import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import config from './env.js';

export const geminiModel = new ChatGoogleGenerativeAI({
  apiKey: config.GEMINI_API_KEY,
  model: 'gemini-2.5-flash',
  maxOutputTokens: 2048,
  responseMimeType: 'application/json'
});

export default {
  geminiModel
};
