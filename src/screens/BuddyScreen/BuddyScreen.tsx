import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import BottomInput, { INPUT_BAR_HEIGHT } from './components/BottomInput';
import { COLORS, styles } from './styles';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  bullets?: string[];
  time: string;
};

const SUGGESTIONS = [
  'Summarize my day',
  'Plan my tasks for tomorrow',
  'Help me prepare for a meeting',
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    text: 'Good morning Buddy! Can you give me a quick overview of my day?',
    time: '9:02 AM',
  },
  {
    id: '2',
    role: 'assistant',
    text: 'Good morning! Here is what your day looks like:',
    bullets: [
      '10:00 AM — Team standup on Google Meet',
      '12:30 PM — Lunch with the design team',
      '3:00 PM — Product review with stakeholders',
    ],
    time: '9:02 AM',
  },
  {
    id: '3',
    role: 'user',
    text: 'What tasks are still pending from yesterday?',
    time: '9:15 AM',
  },
  {
    id: '4',
    role: 'assistant',
    text: 'You have 3 open tasks from yesterday:',
    bullets: [
      'Finish the API integration for voice upload',
      'Review pull request #42 from the backend team',
      'Send weekly progress update to your manager',
    ],
    time: '9:15 AM',
  },
  {
    id: '5',
    role: 'user',
    text: 'Can you draft a short progress update email for me?',
    time: '9:28 AM',
  },
  {
    id: '6',
    role: 'assistant',
    text: 'Sure! Here is a draft you can send:',
    bullets: [
      'Subject: Weekly Progress Update',
      'Hi team, this week I completed the voice recording module and started on the chat UI. Next week I will focus on API integration and testing.',
      'Let me know if you need any more details.',
    ],
    time: '9:28 AM',
  },
  {
    id: '7',
    role: 'user',
    text: 'That looks great. Also remind me about the marketing meeting tomorrow.',
    time: '10:05 AM',
  },
  {
    id: '8',
    role: 'assistant',
    text: 'Your marketing meeting is tomorrow at 11:00 AM in Conference Room B.',
    bullets: [
      'Q3 Campaign Review: ROI analysis of the social push',
      'Budget Allocation: Shift towards influencer partnerships',
      'New Product Launch: Finalize messaging framework',
    ],
    time: '10:05 AM',
  },
  {
    id: '9',
    role: 'user',
    text: 'What notes do I have about the product launch?',
    time: '10:18 AM',
  },
  {
    id: '10',
    role: 'assistant',
    text: 'I found 2 notes related to the product launch:',
    bullets: [
      'Messaging should focus on productivity and ease of use',
      'Target launch window is early next quarter',
      'Competitive analysis doc is pinned in your workspace',
    ],
    time: '10:18 AM',
  },
  {
    id: '11',
    role: 'user',
    text: 'Create a task to prepare slides for the marketing meeting.',
    time: '10:24 AM',
  },
  {
    id: '12',
    role: 'assistant',
    text: 'Done! I created a task: "Prepare marketing meeting slides" due tomorrow at 9:00 AM. Would you like me to outline the slide structure?',
    time: '10:24 AM',
  },
  {
    id: '13',
    role: 'user',
    text: 'Yes please, outline the slides.',
    time: '10:26 AM',
  },
  {
    id: '14',
    role: 'assistant',
    text: 'Here is a suggested slide structure:',
    bullets: [
      'Slide 1: Q3 performance highlights and key metrics',
      'Slide 2: Campaign ROI breakdown by channel',
      'Slide 3: Proposed budget reallocation for Q4',
      'Slide 4: Product launch timeline and messaging',
      'Slide 5: Next steps and open discussion',
    ],
    time: '10:26 AM',
  },
  {
    id: '15',
    role: 'user',
    text: 'Perfect. One last thing — any conflicts in my calendar this afternoon?',
    time: '10:31 AM',
  },
  {
    id: '16',
    role: 'assistant',
    text: 'No conflicts found. Your 3:00 PM product review has no overlapping events. You have a free block from 1:00 PM to 2:30 PM if you want to work on the slides.',
    time: '10:31 AM',
  },
  {
    id: '17',
    role: 'user',
    text: 'Great. Block 1:00 to 2:30 PM for slide prep on my calendar.',
    time: '10:33 AM',
  },
  {
    id: '18',
    role: 'assistant',
    text: 'Done! I added "Slide prep for marketing meeting" to your calendar from 1:00 PM to 2:30 PM.',
    time: '10:33 AM',
  },
  {
    id: '19',
    role: 'user',
    text: 'Summarize the voice notes I recorded this morning.',
    time: '11:10 AM',
  },
  {
    id: '20',
    role: 'assistant',
    text: 'From your morning voice notes, here are the key takeaways:',
    bullets: [
      'Follow up with the backend team on upload timeout issues',
      'Prioritize chat screen UI before profile screen',
      'Schedule a design review for the new home screen cards',
    ],
    time: '11:10 AM',
  },
  {
    id: '21',
    role: 'user',
    text: 'Add those as tasks in my workspace.',
    time: '11:12 AM',
  },
  {
    id: '22',
    role: 'assistant',
    text: 'All three items have been added to your task list under the Mobile App workspace.',
    time: '11:12 AM',
  },
  {
    id: '23',
    role: 'user',
    text: 'What did we discuss in last week\'s product review?',
    time: '11:45 AM',
  },
  {
    id: '24',
    role: 'assistant',
    text: 'Last week\'s product review covered:',
    bullets: [
      'Voice assistant latency needs to be under 2 seconds',
      'Space management UX needs simplification',
      'Beta launch target moved to end of month',
      'Security audit scheduled for the auth module',
    ],
    time: '11:45 AM',
  },
  {
    id: '25',
    role: 'user',
    text: 'Who attended that meeting?',
    time: '11:46 AM',
  },
  {
    id: '26',
    role: 'assistant',
    text: 'Attendees were Sarah (PM), James (Engineering), Priya (Design), and you. Notes were shared in the team workspace.',
    time: '11:46 AM',
  },
  {
    id: '27',
    role: 'user',
    text: 'Remind me to call Sarah before the 3 PM review.',
    time: '12:05 PM',
  },
  {
    id: '28',
    role: 'assistant',
    text: 'Reminder set for 2:30 PM: "Call Sarah before product review." I will notify you 15 minutes before.',
    time: '12:05 PM',
  },
  {
    id: '29',
    role: 'user',
    text: 'How many spaces do I have active right now?',
    time: '12:20 PM',
  },
  {
    id: '30',
    role: 'assistant',
    text: 'You currently have 4 active spaces:',
    bullets: [
      'Personal — 12 notes, 8 tasks',
      'Work Projects — 24 notes, 15 tasks',
      'Mobile App — 6 notes, 9 tasks',
      'Marketing — 3 notes, 4 tasks',
    ],
    time: '12:20 PM',
  },
  {
    id: '31',
    role: 'user',
    text: 'Show me overdue tasks across all spaces.',
    time: '12:35 PM',
  },
  {
    id: '32',
    role: 'assistant',
    text: 'You have 2 overdue tasks:',
    bullets: [
      'Submit expense report — due yesterday',
      'Update API documentation — due 2 days ago',
    ],
    time: '12:35 PM',
  },
  {
    id: '33',
    role: 'user',
    text: 'Move the expense report to high priority.',
    time: '12:36 PM',
  },
  {
    id: '34',
    role: 'assistant',
    text: 'Updated "Submit expense report" to high priority. Want me to block 30 minutes on your calendar to complete it today?',
    time: '12:36 PM',
  },
  {
    id: '35',
    role: 'user',
    text: 'Yes, block 4:30 PM today for that.',
    time: '12:37 PM',
  },
  {
    id: '36',
    role: 'assistant',
    text: 'Calendar updated. "Submit expense report" is scheduled for 4:30 PM to 5:00 PM today.',
    time: '12:37 PM',
  },
];

const formatTime = () =>
  new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const KEYBOARD_INPUT_GAP = 20;

const BuddyScreen = () => {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
      scrollToEnd();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollToEnd]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
      time: formatTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    scrollToEnd();

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: "I'm on it. I'll break this down and share the most useful next steps in a moment.",
        time: formatTime(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      scrollToEnd();
    }, 700);
  }, [input, scrollToEnd]);

  const handleSuggestionPress = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    scrollToEnd();
  };

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
            style={styles.suggestionChip}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <View style={styles.suggestionDot} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const inputBottomOffset =
    keyboardHeight > 0
      ? keyboardHeight + KEYBOARD_INPUT_GAP
      : Math.max(insets.bottom, 12);

  const listBottomPadding = INPUT_BAR_HEIGHT + inputBottomOffset + 16;

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
        <Header />

        <View style={styles.chatArea}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: listBottomPadding },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            ListEmptyComponent={renderEmptyState}
            ListHeaderComponent={
              messages.length > 0 ? (
                <View style={styles.dateSeparator}>
                  <Text style={styles.dateSeparatorText}>Today</Text>
                </View>
              ) : null
            }
            onContentSizeChange={scrollToEnd}
          />

          <View style={[styles.inputBar, { bottom: inputBottomOffset }]}>
            <BottomInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSend={handleSend}
              onFocus={handleInputFocus}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default BuddyScreen;
