import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, BottomTabInset } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import SwasthyaBadge from '@/components/ui/SwasthyaBadge';
import { aiApi } from '@/services/endpoints';
import { getErrorMessage } from '@/services/api';

type MessageRole = 'user' | 'assistant' | 'system' | 'error';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi there 👋 I'm your SwasthyaSetu health assistant. Ask me about your medications, symptoms, reports, or any general health question. I'll do my best to help — and remember: always confirm with your doctor for medical decisions.",
    createdAt: Date.now() - 60000,
  },
];

const bubbleStyles = {
  user: {
    wrapper: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    text: { color: '#fff' },
    align: 'flex-end' as const,
  },
  assistant: {
    wrapper: { backgroundColor: Colors.softSage, borderColor: Colors.primaryLight },
    text: { color: Colors.text },
    align: 'flex-start' as const,
  },
  error: {
    wrapper: { backgroundColor: '#FFF3EC', borderColor: '#F8D6BE' },
    text: { color: Colors.alert },
    align: 'flex-start' as const,
  },
  system: {
    wrapper: { backgroundColor: Colors.surface, borderColor: Colors.border },
    text: { color: Colors.textSecondary },
    align: 'center' as const,
  },
};

const formatTime = (ts: number) => {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const AiChatScreen: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    sendingRef.current = sending;
  }, [sending]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, []);

  const addMessage = (msg: Omit<ChatMessage, 'createdAt' | 'id'>, createdAt?: number): string => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const full: ChatMessage = {
      ...msg,
      id,
      createdAt: createdAt ?? Date.now(),
    };
    setMessages((prev) => [...prev, full]);
    scrollToBottom();
    return id;
  };

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sendingRef.current) return;
    const userText = content;
    setInput('');
    addMessage({ role: 'user', content: userText });
    setSending(true);
    const thinkingId = addMessage({
      role: 'system',
      content: 'Thinking...',
    });
    try {
      const res = await aiApi.chat(userText);
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      if (res.success && res.data) {
        addMessage({ role: 'assistant', content: res.data.reply });
      } else {
        addMessage({
          role: 'error',
          content: res.message || t.chatUnavailable,
        });
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      const status = err?.response?.status;
      if (status === 404) {
        addMessage({
          role: 'error',
          content: t.chatUnavailable,
        });
      } else {
        addMessage({
          role: 'error',
          content: getErrorMessage(err) || t.chatUnavailable,
        });
      }
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSystem = item.role === 'system';
    const isError = item.role === 'error';
    const stylesKey = isError ? 'error' : isUser ? 'user' : isSystem ? 'system' : 'assistant';
    const bubble = bubbleStyles[stylesKey as keyof typeof bubbleStyles];
    const isThinking = isSystem && item.content === 'Thinking...';
    return (
      <View style={[styles.messageRow, { justifyContent: bubble.align }]}>
        {!isUser && !isSystem ? (
          <View style={styles.avatar}>
            <Ionicons name="sparkles-outline" size={16} color={Colors.primary} />
          </View>
        ) : null}
        <View
          style={[
            styles.bubble,
            bubble.wrapper,
            isSystem && { maxWidth: '100%', alignSelf: 'center' },
          ]}
        >
          {isThinking ? (
            <View style={styles.thinkingDots}>
              <TypingDot delay={0} />
              <TypingDot delay={180} />
              <TypingDot delay={360} />
            </View>
          ) : (
            <>
              <Text style={[styles.bubbleText, bubble.text]}>{item.content}</Text>
              {!isSystem ? (
                <Text
                  style={[
                    styles.bubbleTime,
                    { color: isUser ? 'rgba(255,255,255,0.75)' : Colors.textSecondary },
                  ]}
                >
                  {formatTime(item.createdAt)}
                </Text>
              ) : null}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <View style={styles.headerIcon}>
              <Ionicons name="sparkles" size={18} color={Colors.honeyGold} />
            </View>
            <Text style={styles.headerTitle}>{t.chatTitle}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            General guidance only — not a replacement for your doctor
          </Text>
        </View>
        <SwasthyaBadge tone="gold" label="AI Powered" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom()}
          ListEmptyComponent={null}
        />

        <View style={styles.inputWrap}>
          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t.typeMessage}
              placeholderTextColor={Colors.textSecondary}
              style={styles.textInput}
              multiline
              maxLength={800}
              returnKeyType="send"
              blurOnSubmit
              onSubmitEditing={() => {
                if (Platform.OS !== 'web') sendMessage();
              }}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            style={[
              styles.sendBtn,
              {
                backgroundColor: !input.trim() || sending ? Colors.border : Colors.primary,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={18}
              color={!input.trim() || sending ? Colors.textSecondary : '#fff'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const TypingDot: React.FC<{ delay: number }> = ({ delay }) => {
  return (
    <View
      style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        opacity: 0.5,
        marginHorizontal: 2,
      }}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.h3.fontSize,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    marginTop: 2,
    marginLeft: 48,
    fontSize: Typography.caption.fontSize,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: BottomTabInset + Spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  bubbleText: {
    fontSize: Typography.body.fontSize,
    lineHeight: Typography.body.lineHeight,
  },
  bubbleTime: {
    marginTop: 4,
    fontSize: Typography.caption.fontSize,
    alignSelf: 'flex-end',
  },
  thinkingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  inputWrap: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  inputBar: {
    flex: 1,
    minHeight: 44,
    maxHeight: 140,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'web' ? Spacing.sm : Spacing.xs,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: Typography.body.fontSize,
    color: Colors.text,
    padding: 0,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AiChatScreen;
