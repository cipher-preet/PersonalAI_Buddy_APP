import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Header from './components/Header';
import UserMessage from './components/UserMessage';
import AIMessage from './components/AIMessage';
import BottomInput from './components/BottomInput';
import ChatHistoryDrawer from './components/ChatHistoryDrawer';
import TypingIndicator from './components/TypingIndicator';
import ScrollToBottomButton from './components/ScrollToBottomButton';
import { COLORS, styles } from './styles';
import type { ChatMessage, ChatSession } from './types';
import {
  useAskBuddyMutation,
  useCreateChatSessionMutation,
  useGetChatSessionsQuery,
  useLazyGetChatSessionByIdQuery,
  useLazyGetChatSessionsQuery,
} from '../../store/api';
import { useAppSelector } from '../../store/hooks';
import type {
  ChatMessageDto,
  ChatSessionDto,
} from '../../store/api/chat';
import { ms, spacing } from '../../theme';

const SUGGESTIONS = [
  'Summarize my day',
  'Plan my tasks for tomorrow',
  'Help me prepare for a meeting',
];

const formatTime = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

/** Keep a comfortable gap between the input bar and the keyboard. */
const KEYBOARD_INPUT_GAP = spacing.xl;
const PAGE_SIZE = 20;

const fallbackErrorMessage = 'Something went wrong. Please try again.';

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error && 'name' in error) {
    const name = String((error as { name?: unknown }).name || '');
    if (name === 'AbortError') {
      return 'Could not reach the FastAPI chat server. Make sure it is running on --host 0.0.0.0 and your phone is on the same Wi-Fi.';
    }
  }
  if (typeof error === 'object' && error && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (status === 'TIMEOUT_ERROR' || status === 'FETCH_ERROR') {
      return 'Could not reach the FastAPI chat server. Check the server IP, port 8000, firewall, and Wi-Fi connection.';
    }
    if ('error' in error && typeof (error as { error?: unknown }).error === 'string') {
      const message = (error as { error: string }).error;
      if (message.toLowerCase().includes('abort')) {
        return 'Could not reach the FastAPI chat server before the request timed out.';
      }
      return `Request failed (${status}): ${message}`;
    }
  }
  if (typeof error === 'object' && error && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') {
      return data.slice(0, 180);
    }
    if (typeof data === 'object' && data && 'detail' in data) {
      const status =
        'status' in error ? ` (${String((error as { status?: unknown }).status)})` : '';
      return `Request failed${status}: ${String(
        (data as { detail?: unknown }).detail || fallbackErrorMessage,
      )}`;
    }
    if (typeof data === 'object' && data && 'message' in data) {
      const raw =
        'raw' in data && typeof (data as { raw?: unknown }).raw === 'string'
          ? ` ${String((data as { raw: string }).raw).slice(0, 120)}`
          : '';
      return `${String((data as { message?: unknown }).message || fallbackErrorMessage)}${raw}`;
    }
  }
  return fallbackErrorMessage;
};

const mapSessionDto = (session: ChatSessionDto): ChatSession => ({
  id: session.id,
  title: session.title || 'New conversation',
  preview:
    session.messageCount > 0
      ? `${session.messageCount} message${session.messageCount === 1 ? '' : 's'}`
      : 'Start chatting with Buddy...',
  updatedAt: new Date(session.updatedAt),
  messageCount: session.messageCount,
  messages: [],
});

const mapMessageDto = (message: ChatMessageDto, index: number): ChatMessage => ({
  id: `${message.role}-${index}`,
  role: message.role,
  text: message.content,
  time: '',
});

const createLocalPendingSession = (): ChatSession => ({
  id: `pending-${Date.now()}`,
  title: 'New conversation',
  preview: 'Start chatting with Buddy...',
  updatedAt: new Date(),
  messageCount: 0,
  messages: [],
});

const mergeSessions = (
  current: ChatSession[],
  incoming: ChatSession[],
): ChatSession[] => {
  const byId = new Map(current.map(session => [session.id, session]));
  incoming.forEach(session => {
    const existing = byId.get(session.id);
    byId.set(session.id, {
      ...session,
      messages: existing?.messages?.length ? existing.messages : session.messages,
      preview: existing?.messages?.length
        ? existing.preview
        : session.preview,
    });
  });
  return Array.from(byId.values()).sort(
    (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
  );
};

const BuddyScreen = () => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const userId = useAppSelector(state => state.auth.userId);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [sessionsCursor, setSessionsCursor] = useState<string | null>(null);
  const [hasMoreSessions, setHasMoreSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [initialSessionsLoaded, setInitialSessionsLoaded] = useState(false);
  const [sessionsTimedOut, setSessionsTimedOut] = useState(false);
  const [activeChatLoading, setActiveChatLoading] = useState(false);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const isNearBottomRef = useRef(true);

  const {
    data: sessionsResponse,
    isLoading: sessionsLoading,
    isFetching: sessionsFetching,
    isError: sessionsIsError,
    error: sessionsQueryError,
    refetch: refetchSessions,
  } = useGetChatSessionsQuery(
    { userId: userId || '', limit: PAGE_SIZE },
    { skip: !userId },
  );
  const [fetchSessionsPage] = useLazyGetChatSessionsQuery();
  const [createChatSession, { isLoading: creatingChat }] =
    useCreateChatSessionMutation();
  const [loadChatSession] = useLazyGetChatSessionByIdQuery();
  const [askBuddy, { isLoading: sendingMessage }] = useAskBuddyMutation();

  const messages = useMemo(
    () =>
      sessions.find(session => session.id === activeSessionId)?.messages ?? [],
    [sessions, activeSessionId],
  );

  const scrollToEnd = useCallback((force = false) => {
    if (!force && !isNearBottomRef.current) {
      return;
    }
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
      isNearBottomRef.current = true;
      setShowScrollToBottom(false);
    }, 100);
  }, []);

  const handleScrollToBottomPress = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);
  }, []);

  const handleListScroll = useCallback(
    (event: {
      nativeEvent: {
        contentOffset: { y: number };
        layoutMeasurement: { height: number };
        contentSize: { height: number };
      };
    }) => {
      const { contentOffset, layoutMeasurement, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const nearBottom = distanceFromBottom < ms(96);

      if (nearBottom !== isNearBottomRef.current) {
        isNearBottomRef.current = nearBottom;
        setShowScrollToBottom(!nearBottom && messages.length > 0);
      }
    },
    [messages.length],
  );

  const handleContentSizeChange = useCallback(() => {
    if (isNearBottomRef.current) {
      scrollToEnd(true);
    }
  }, [scrollToEnd]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      // Height of the keyboard overlay from the bottom of the screen.
      // With adjustNothing we own this offset — no system pan/resize.
      const height = Math.max(0, event.endCoordinates.height);
      setKeyboardHeight(height);
      scrollToEnd(true);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToEnd]);

  useEffect(() => {
    if (!sessionsResponse?.success || !sessionsResponse?.data?.chats) {
      if (sessionsResponse && !sessionsResponse.success) {
        const message =
          'message' in sessionsResponse
            ? String((sessionsResponse as unknown as { message?: string }).message)
            : fallbackErrorMessage;
        const raw =
          'raw' in sessionsResponse
            ? ` ${String((sessionsResponse as unknown as { raw?: string }).raw).slice(0, 120)}`
            : '';
        setSessionsError(`${message}${raw}`);
        setInitialSessionsLoaded(true);
        setSessionsTimedOut(false);
      }
      return;
    }
    const nextSessions = sessionsResponse.data.chats.map(mapSessionDto);
    setSessions(prev => mergeSessions(prev, nextSessions));
    setSessionsCursor(sessionsResponse.data.nextCursor);
    setHasMoreSessions(sessionsResponse.data.hasMore);
    setSessionsError(null);
    setInitialSessionsLoaded(true);
    setSessionsTimedOut(false);
  }, [sessionsResponse]);

  useEffect(() => {
    if (sessionsIsError) {
      setSessionsError(getErrorMessage(sessionsQueryError));
      setInitialSessionsLoaded(true);
      setSessionsTimedOut(false);
    }
  }, [sessionsIsError, sessionsQueryError]);

  useEffect(() => {
    if (userId && !sessionsLoading && !sessionsFetching && !sessionsResponse && !sessionsIsError) {
      setInitialSessionsLoaded(true);
    }
  }, [sessionsFetching, sessionsIsError, sessionsLoading, sessionsResponse, userId]);

  useEffect(() => {
    if (!userId || initialSessionsLoaded || sessionsIsError || sessionsResponse) {
      return;
    }
    const timer = setTimeout(() => {
      setSessionsTimedOut(true);
      setInitialSessionsLoaded(true);
      setSessionsError(
        'Chat server is taking too long to respond. Check FastAPI is reachable from this phone.',
      );
    }, 13000);

    return () => clearTimeout(timer);
  }, [initialSessionsLoaded, sessionsIsError, sessionsResponse, userId]);

  useEffect(() => {
    if (!userId) {
      setInitialSessionsLoaded(true);
      setSessionsError('Please log in again to load chats.');
    } else {
      setSessionsError(null);
      if (!sessionsResponse) {
        setInitialSessionsLoaded(false);
      }
    }
  }, [userId, sessionsResponse]);

  const updateSessionById = useCallback(
    (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
      if (!sessionId) {
        return;
      }
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId ? updater(session) : session,
        ),
      );
    },
    [],
  );

  const recoverLatestSession = useCallback(async () => {
    if (!userId) {
      return null;
    }
    const response = await fetchSessionsPage({
      userId,
      limit: PAGE_SIZE,
    }).unwrap();
    const latestSessions = response.data.chats.map(mapSessionDto);
    setSessions(prev => mergeSessions(prev, latestSessions));
    setSessionsCursor(response.data.nextCursor);
    setHasMoreSessions(response.data.hasMore);
    setSessionsError(null);
    return latestSessions[0] || null;
  }, [fetchSessionsPage, userId]);

  const ensureActiveSession = useCallback(async () => {
    if (!userId) {
      throw new Error('Please log in again to continue.');
    }
    if (activeSessionId && !activeSessionId.startsWith('pending-')) {
      return activeSessionId;
    }
    try {
      const response = await createChatSession({ userId }).unwrap();
      const session = mapSessionDto(response.data);
      setSessions(prev =>
        mergeSessions(
          prev.filter(item => item.id !== activeSessionId),
          [session],
        ),
      );
      setActiveSessionId(session.id);
      return session.id;
    } catch (error) {
      const recoveredSession = await recoverLatestSession();
      if (recoveredSession) {
        setSessions(prev =>
          prev.filter(item => item.id !== activeSessionId),
        );
        setActiveSessionId(recoveredSession.id);
        return recoveredSession.id;
      }
      throw error;
    }
  }, [activeSessionId, createChatSession, recoverLatestSession, userId]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sendingMessage) {
      return;
    }

    let sessionId: string;
    try {
      sessionId = await ensureActiveSession();
    } catch (error) {
      setSessionsError(error instanceof Error ? error.message : fallbackErrorMessage);
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
      time: formatTime(),
    };

    updateSessionById(sessionId, session => ({
      ...session,
      title:
        session.messages.length === 0
          ? trimmed.slice(0, 42) + (trimmed.length > 42 ? '...' : '')
          : session.title,
      preview: trimmed,
      updatedAt: new Date(),
      messageCount: session.messageCount + 1,
      messages: [...session.messages, userMessage],
    }));

    setInput('');
    scrollToEnd(true);

    try {
      const response = await askBuddy({
        userId: userId || '',
        chatId: sessionId,
        question: trimmed,
      }).unwrap();
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: response.data.answer,
        time: formatTime(),
      };

      updateSessionById(sessionId, session => ({
        ...session,
        updatedAt: new Date(),
        preview: response.data.answer,
        messageCount: session.messageCount + 1,
        messages: [...session.messages, assistantMessage],
      }));
      scrollToEnd(true);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant-error`,
        role: 'assistant',
        text: getErrorMessage(error),
        time: formatTime(),
      };
      updateSessionById(sessionId, session => ({
        ...session,
        messages: [...session.messages, assistantMessage],
      }));
      scrollToEnd(true);
    }
  }, [
    askBuddy,
    ensureActiveSession,
    input,
    scrollToEnd,
    sendingMessage,
    updateSessionById,
    userId,
  ]);

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    scrollToEnd(true);
  };

  const handleOpenHistory = () => {
    Keyboard.dismiss();
    setHistoryVisible(true);
  };

  const handleCloseHistory = () => {
    setHistoryVisible(false);
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!userId) {
      setSessionsError('Please log in again to continue.');
      return;
    }
    setActiveSessionId(sessionId);
    setHistoryVisible(false);
    setInput('');
    setActiveChatLoading(true);
    try {
      const response = await loadChatSession({ userId, sessionId }).unwrap();
      const loadedSession = mapSessionDto(response.data.chat);
      const loadedMessages = response.data.messages.map(mapMessageDto);
      setSessions(prev =>
        mergeSessions(prev, [
          {
            ...loadedSession,
            messages: loadedMessages,
            preview:
              loadedMessages[loadedMessages.length - 1]?.text ||
              loadedSession.preview,
          },
        ]),
      );
      scrollToEnd(true);
    } catch (error) {
      setSessionsError(getErrorMessage(error));
    } finally {
      setActiveChatLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!userId) {
      setSessionsError('Please log in again to continue.');
      return;
    }
    const pendingSession = createLocalPendingSession();
    setSessions(prev => mergeSessions(prev, [pendingSession]));
    setActiveSessionId(pendingSession.id);
    setHistoryVisible(false);
    setInput('');
    setSessionsError(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 320);

    try {
      const response = await createChatSession({ userId }).unwrap();
      const newSession = mapSessionDto(response.data);
      setSessions(prev =>
        mergeSessions(
          prev.filter(session => session.id !== pendingSession.id),
          [newSession],
        ),
      );
      setActiveSessionId(newSession.id);
    } catch (error) {
      try {
        const recoveredSession = await recoverLatestSession();
        if (recoveredSession) {
          setSessions(prev =>
            prev.filter(session => session.id !== pendingSession.id),
          );
          setActiveSessionId(recoveredSession.id);
          return;
        }
      } catch {
        // Fall through to the original create error.
      }
      setSessions(prev =>
        prev.filter(session => session.id !== pendingSession.id),
      );
      setSessionsError(getErrorMessage(error));
    }
  };

  const handleLoadMoreSessions = async () => {
    if (!userId || !sessionsCursor || loadingMoreSessions) {
      return;
    }
    setLoadingMoreSessions(true);
    try {
      const response = await fetchSessionsPage({
        userId,
        limit: PAGE_SIZE,
        cursor: sessionsCursor,
      }).unwrap();
      setSessions(prev =>
        mergeSessions(prev, response.data.chats.map(mapSessionDto)),
      );
      setSessionsCursor(response.data.nextCursor);
      setHasMoreSessions(response.data.hasMore);
      setSessionsError(null);
    } catch (error) {
      setSessionsError(getErrorMessage(error));
    } finally {
      setLoadingMoreSessions(false);
    }
  };

  useEffect(() => {
    if (sendingMessage) {
      scrollToEnd(true);
    }
  }, [sendingMessage, scrollToEnd]);

  useEffect(() => {
    if (messages.length === 0) {
      isNearBottomRef.current = true;
      setShowScrollToBottom(false);
    }
  }, [messages.length, activeSessionId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.role === 'user') {
      return <UserMessage text={item.text || ''} time={item.time} />;
    }

    return (
      <AIMessage text={item.text} bullets={item.bullets} time={item.time} />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>AI Assistant</Text>
        </View>
        <Text style={styles.emptyTitle}>How can I help you today?</Text>
        <Text style={styles.emptySubtitle}>
          Ask Buddy to plan your day, summarize notes, or prepare for meetings.
        </Text>
      </View>

      <Text style={styles.suggestionsTitle}>Quick prompts</Text>
      <View style={styles.suggestionsWrap}>
        {SUGGESTIONS.map(suggestion => (
          <Pressable
            key={suggestion}
            style={[
              styles.suggestionChip,
              sendingMessage && styles.suggestionChipDisabled,
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
            disabled={sendingMessage}
          >
            <View style={styles.suggestionDot} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const keyboardOpen = keyboardHeight > 0;
  const inputSafeBottom = keyboardOpen
    ? keyboardHeight + KEYBOARD_INPUT_GAP
    : Math.max(insets.bottom, spacing.xl);

  return (
    <LinearGradient
      colors={[
        COLORS.gradientStart,
        COLORS.gradientMid,
        COLORS.gradientEnd,
        COLORS.gradientEnd,
      ]}
      locations={[0, 0.25, 0.7, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Header onHistoryPress={handleOpenHistory} />

        <View style={styles.chatArea}>
          <View style={styles.listWrap}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: spacing['2xl'] },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={
                activeChatLoading || sendingMessage ? (
                  <View style={styles.typingFooter}>
                    <TypingIndicator />
                  </View>
                ) : null
              }
              ListHeaderComponent={
                messages.length > 0 ? (
                  <View style={styles.dateSeparator}>
                    <Text style={styles.dateSeparatorText}>Today</Text>
                  </View>
                ) : null
              }
              onContentSizeChange={handleContentSizeChange}
              onScroll={handleListScroll}
              scrollEventThrottle={16}
            />

            <ScrollToBottomButton
              visible={showScrollToBottom}
              bottom={spacing.xl}
              onPress={handleScrollToBottomPress}
            />
          </View>

          <View style={[styles.inputBar, { paddingBottom: inputSafeBottom }]}>
            <BottomInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              onFocus={handleInputFocus}
              disabled={!userId || creatingChat || sendingMessage}
            />
          </View>
        </View>
      </SafeAreaView>

      <ChatHistoryDrawer
        visible={historyVisible}
        sessions={sessions}
        activeSessionId={activeSessionId || ''}
        loading={
          !!userId &&
          !initialSessionsLoaded &&
          !sessionsTimedOut &&
          (sessionsLoading || sessionsFetching)
        }
        loadingMore={loadingMoreSessions}
        creating={creatingChat}
        error={sessionsError}
        hasMore={hasMoreSessions}
        onClose={handleCloseHistory}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRetry={refetchSessions}
        onLoadMore={handleLoadMoreSessions}
      />
    </LinearGradient>
  );
};

export default BuddyScreen;
