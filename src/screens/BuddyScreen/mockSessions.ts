import type { ChatMessage, ChatSession } from './types';

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
];

const daysAgo = (days: number, hours = 14, minutes = 30): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Daily overview & tasks',
    preview: 'Good morning Buddy! Can you give me a quick overview of my day?',
    updatedAt: new Date(),
    messageCount: INITIAL_MESSAGES.length,
    messages: INITIAL_MESSAGES,
  },
  {
    id: 'session-2',
    title: 'Marketing meeting prep',
    preview: 'Help me prepare slides for the marketing meeting tomorrow.',
    updatedAt: daysAgo(1, 16, 45),
    messageCount: 2,
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: 'Help me prepare slides for the marketing meeting tomorrow.',
        time: '4:45 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text: 'Here is a suggested slide structure for your marketing meeting:',
        bullets: [
          'Q3 performance highlights and key metrics',
          'Campaign ROI breakdown by channel',
          'Proposed budget reallocation for Q4',
        ],
        time: '4:45 PM',
      },
    ],
  },
  {
    id: 'session-3',
    title: 'Voice notes summary',
    preview: 'Summarize the voice notes I recorded this morning.',
    updatedAt: daysAgo(2, 11, 10),
    messageCount: 2,
    messages: [
      {
        id: 'v1',
        role: 'user',
        text: 'Summarize the voice notes I recorded this morning.',
        time: '11:10 AM',
      },
      {
        id: 'v2',
        role: 'assistant',
        text: 'From your morning voice notes, here are the key takeaways:',
        bullets: [
          'Follow up with the backend team on upload timeout issues',
          'Prioritize chat screen UI before profile screen',
        ],
        time: '11:10 AM',
      },
    ],
  },
  {
    id: 'session-4',
    title: 'Product review notes',
    preview: 'What did we discuss in last week\'s product review?',
    updatedAt: daysAgo(4, 9, 20),
    messageCount: 2,
    messages: [
      {
        id: 'p1',
        role: 'user',
        text: 'What did we discuss in last week\'s product review?',
        time: '9:20 AM',
      },
      {
        id: 'p2',
        role: 'assistant',
        text: 'Last week\'s product review covered:',
        bullets: [
          'Voice assistant latency needs to be under 2 seconds',
          'Beta launch target moved to end of month',
        ],
        time: '9:20 AM',
      },
    ],
  },
  {
    id: 'session-5',
    title: 'Weekend planning',
    preview: 'Plan my tasks for the weekend and block focus time.',
    updatedAt: daysAgo(6, 18, 0),
    messageCount: 2,
    messages: [
      {
        id: 'w1',
        role: 'user',
        text: 'Plan my tasks for the weekend and block focus time.',
        time: '6:00 PM',
      },
      {
        id: 'w2',
        role: 'assistant',
        text: 'I scheduled two focus blocks for you this weekend:',
        bullets: [
          'Saturday 10 AM — Finish API documentation',
          'Sunday 3 PM — Review design mockups',
        ],
        time: '6:00 PM',
      },
    ],
  },
];

export const createEmptySession = (): ChatSession => ({
  id: `session-${Date.now()}`,
  title: 'New conversation',
  preview: 'Start chatting with Buddy...',
  updatedAt: new Date(),
  messageCount: 0,
  messages: [],
});
