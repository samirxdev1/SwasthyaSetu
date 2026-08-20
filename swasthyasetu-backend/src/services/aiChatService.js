import { HumanMessage, SystemMessage, AIMessage, ToolMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import config from '../config/env.js';
import { buildPatientTools } from './aiChatTools.js';

/**
 * SYSTEM PROMPT for the patient chat assistant.
 * This is sent once per request and scopes all behaviour of the model.
 */
const SYSTEM_PROMPT = `You are SwasthyaSetu's clinical-assist chatbot. You help patients understand their OWN health records clearly and compassionately. 

CORE RULES:
1. ALWAYS use the provided tools to fetch real patient data before answering any question about:
   - Past visits or consultations → use getPatientConsultations
   - Medicines or prescriptions → use getPatientPrescriptions
   - Lab tests, results, or reports → use getPatientLabOrdersAndReports
   - Ongoing health conditions → use getPatientChronicConditions
2. NEVER guess, fabricate, or infer health data. If a tool returns no data, say so honestly.
3. NEVER provide new medical diagnoses, suggest dosage changes, or override doctor instructions.
4. For any medicine or dosage question, always include: "Please confirm this with your doctor or pharmacist before making any changes."
5. When relevant, personalize explanations based on the patient's real conditions retrieved via tools (e.g., if the patient has Type 2 Diabetes, tailor health explanations accordingly).
6. For general greetings or small talk (e.g., "Hi", "How are you?"), respond warmly and naturally — do NOT call any tools unnecessarily.
7. If the patient asks about another person's records or attempts to retrieve data beyond their own, clarify that you can only discuss their personal health information.
8. Respond in clear, friendly, non-technical language. Avoid medical jargon; explain terms when used.
9. Always end answers about health conditions or medicines with a brief reminder to consult their doctor for any medical decisions.`;

/**
 * Converts the client-supplied conversationHistory array to LangChain message objects.
 * Only accepts the last few turns to keep context window lightweight.
 *
 * @param {Array<{role: 'user'|'assistant', content: string}>} conversationHistory
 * @returns {Array<HumanMessage|AIMessage>}
 */
const buildHistoryMessages = (conversationHistory) => {
  if (!Array.isArray(conversationHistory) || conversationHistory.length === 0) return [];

  // Limit to last 6 turns (3 user + 3 assistant) to keep context light
  const recentHistory = conversationHistory.slice(-6);

  return recentHistory
    .filter(turn => turn && turn.role && typeof turn.content === 'string')
    .map(turn => {
      if (turn.role === 'user') return new HumanMessage(turn.content);
      if (turn.role === 'assistant') return new AIMessage(turn.content);
      return null;
    })
    .filter(Boolean);
};

/**
 * Runs the AI chat assistant with tool-calling for a given patient.
 *
 * SECURITY: The patientId comes from the authenticated JWT (req.user) — never from the
 * request body. Tools are built fresh per-request (no shared/global instances) and
 * structurally hard-bind every data fetch to this specific patient.
 *
 * @param {string} patientId - patients.id UUID of the authenticated patient
 * @param {string} userMessage - The patient's natural-language question
 * @param {Array<{role: 'user'|'assistant', content: string}>} conversationHistory - Recent turns
 * @returns {Promise<{reply: string, toolsUsed: string[]}>}
 */
export const chatWithPatientAssistant = async (patientId, userMessage, conversationHistory = []) => {
  if (!patientId) {
    throw Object.assign(new Error('patientId is required'), { statusCode: 400 });
  }
  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
    throw Object.assign(new Error('userMessage is required and must be a non-empty string'), { statusCode: 400 });
  }

  // ── 1. Build tools fresh for this specific patient (no shared instances) ──
  const tools = buildPatientTools(patientId);

  // ── 2. Create a chat model instance with tool-calling enabled ─────────────
  // Note: We create a fresh ChatGoogleGenerativeAI instance here (not the shared
  // geminiModel from llmClients.js) because we need to:
  //   a) Remove `responseMimeType: 'application/json'` — tool-calling mode
  //      returns structured tool call objects, not raw JSON text
  //   b) Bind tools to this model instance
  const chatModel = new ChatGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    maxOutputTokens: 2048
    // No responseMimeType — tool-calling produces structured responses, not JSON text
  });

  const modelWithTools = chatModel.bindTools(tools);

  // ── 3. Build messages: system + history + current user message ────────────
  const historyMessages = buildHistoryMessages(conversationHistory);
  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    ...historyMessages,
    new HumanMessage(userMessage)
  ];

  const toolsUsed = [];

  // ── 4. First model call — may request tool calls ──────────────────────────
  let response = await modelWithTools.invoke(messages);
  messages.push(response); // Add AI response to message chain

  // ── 5. Agentic loop — execute tool calls until the model is done ──────────
  // Gemini 2.5 Flash may chain multiple tool calls before giving a final text reply
  let maxIterations = 5; // Safety limit — prevents runaway loops
  while (response.tool_calls && response.tool_calls.length > 0 && maxIterations > 0) {
    maxIterations--;

    // Execute each requested tool call
    for (const toolCall of response.tool_calls) {
      const toolName = toolCall.name;
      const tool = tools.find(t => t.name === toolName);

      if (!tool) {
        console.warn(`[aiChatService] Model requested unknown tool: ${toolName}`);
        messages.push(new ToolMessage({
          tool_call_id: toolCall.id,
          content: `Tool '${toolName}' is not available.`
        }));
        continue;
      }

      // Track which tools were actually called
      if (!toolsUsed.includes(toolName)) {
        toolsUsed.push(toolName);
      }

      let toolResult;
      try {
        toolResult = await tool.func(toolCall.args || {});
      } catch (toolErr) {
        console.error(`[aiChatService] Tool '${toolName}' execution error:`, toolErr.message);
        toolResult = JSON.stringify({ error: `Tool execution failed: ${toolErr.message}` });
      }

      messages.push(new ToolMessage({
        tool_call_id: toolCall.id,
        content: toolResult
      }));
    }

    // Call model again with tool results
    response = await modelWithTools.invoke(messages);
    messages.push(response);
  }

  // ── 6. Extract the final text reply ───────────────────────────────────────
  let reply = '';
  if (typeof response.content === 'string') {
    reply = response.content.trim();
  } else if (Array.isArray(response.content)) {
    // Gemini sometimes returns content as an array of parts
    reply = response.content
      .filter(part => part.type === 'text' || typeof part === 'string')
      .map(part => (typeof part === 'string' ? part : part.text || ''))
      .join('')
      .trim();
  }

  if (!reply) {
    reply = "I'm sorry, I wasn't able to generate a response. Please try rephrasing your question or try again shortly.";
  }

  return { reply, toolsUsed };
};

export default {
  chatWithPatientAssistant
};
