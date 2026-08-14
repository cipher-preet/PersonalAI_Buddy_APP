export type ReminderSource = 'ai' | 'manual';

export type ReminderTone = 'rose' | 'lavender' | 'ochre' | 'teal';

export type ReminderRepeat =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'weekdays'
  | 'monthly';

export type ReminderItem = {
  id: string;
  title: string;
  emoji: string;
  description: string;
  timeLabel: string;
  dateLabel: string;
  source: ReminderSource;
  dateKey: string;
  tone: ReminderTone;
  repeat: ReminderRepeat;
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
};

export const REMINDER_TONES: Record<
  ReminderTone,
  { bg: string; text: string; muted: string; arrow: string }
> = {
  rose: {
    bg: '#F8D7DD',
    text: '#5C2430',
    muted: '#8B4A58',
    arrow: '#7A3344',
  },
  lavender: {
    bg: '#E4D9F5',
    text: '#3D2E5C',
    muted: '#6B5A8A',
    arrow: '#5A4580',
  },
  ochre: {
    bg: '#F5E4C8',
    text: '#5C4220',
    muted: '#8A6840',
    arrow: '#7A5530',
  },
  teal: {
    bg: '#C8E8E4',
    text: '#1F4A44',
    muted: '#3D726A',
    arrow: '#2D6058',
  },
};

export const REPEAT_LABELS: Record<ReminderRepeat, string> = {
  once: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
  weekdays: 'Weekdays',
  monthly: 'Monthly',
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const MOCK_REMINDERS: ReminderItem[] = [
  {
    id: '1',
    title: "Don't forget math homework",
    emoji: '📖',
    description: 'Finish chapter 4 exercises and check answers before class.',
    timeLabel: '2:30 PM',
    dateLabel: formatDateLabel(today),
    source: 'manual',
    dateKey: toDateKey(today),
    tone: 'rose',
    repeat: 'once',
    aiCalling: false,
    notification: true,
    beeping: false,
  },
  {
    id: '2',
    title: 'Buy snacks before 6 PM',
    emoji: '🍪',
    description: 'Pick up chips, fruit, and water for tonight’s study session.',
    timeLabel: '5:45 PM',
    dateLabel: formatDateLabel(today),
    source: 'ai',
    dateKey: toDateKey(today),
    tone: 'lavender',
    repeat: 'once',
    aiCalling: true,
    notification: true,
    beeping: false,
  },
  {
    id: '3',
    title: 'Call mom every weekend',
    emoji: '❤️',
    description: 'Catch up and share how the week went. Prefer a quiet room.',
    timeLabel: '8:00 PM',
    dateLabel: formatDateLabel(today),
    source: 'manual',
    dateKey: toDateKey(today),
    tone: 'ochre',
    repeat: 'weekly',
    aiCalling: true,
    notification: true,
    beeping: true,
  },
  {
    id: '4',
    title: 'Water the plants',
    emoji: '🌱',
    description: 'Balcony herbs and the living-room monstera need a light soak.',
    timeLabel: 'Morning',
    dateLabel: formatDateLabel(today),
    source: 'ai',
    dateKey: toDateKey(today),
    tone: 'teal',
    repeat: 'daily',
    aiCalling: false,
    notification: true,
    beeping: true,
  },
  {
    id: '5',
    title: 'Team standup prep',
    emoji: '💼',
    description: 'Review blockers, ship notes, and update the shared agenda.',
    timeLabel: '9:00 AM',
    dateLabel: formatDateLabel(tomorrow),
    source: 'ai',
    dateKey: toDateKey(tomorrow),
    tone: 'lavender',
    repeat: 'weekdays',
    aiCalling: false,
    notification: true,
    beeping: false,
  },
  {
    id: '6',
    title: 'Grocery list review',
    emoji: '🛒',
    description: 'Confirm pantry items before placing the weekly order.',
    timeLabel: '6:30 PM',
    dateLabel: formatDateLabel(tomorrow),
    source: 'manual',
    dateKey: toDateKey(tomorrow),
    tone: 'rose',
    repeat: 'weekly',
    aiCalling: false,
    notification: true,
    beeping: false,
  },
  {
    id: '7',
    title: 'Weekly budget check',
    emoji: '💰',
    description: 'Review spending, savings goals, and pending subscriptions.',
    timeLabel: 'Sunday',
    dateLabel: formatDateLabel(today),
    source: 'ai',
    dateKey: toDateKey(today),
    tone: 'ochre',
    repeat: 'weekly',
    aiCalling: true,
    notification: true,
    beeping: false,
  },
  {
    id: '8',
    title: 'Evening walk',
    emoji: '🚶',
    description: 'A 20-minute walk to clear the mind after work.',
    timeLabel: '7:15 PM',
    dateLabel: formatDateLabel(today),
    source: 'manual',
    dateKey: toDateKey(today),
    tone: 'teal',
    repeat: 'daily',
    aiCalling: false,
    notification: true,
    beeping: true,
  },
];
