export type MainTabParamList = {
  Notes: { spaceId?: string } | undefined;
  Tasks: { spaceId?: string } | undefined;
  Reminders: undefined;
  Briefing: undefined;
  Share: undefined;
  Calendar: undefined;
  GoalMonitor: undefined;
  AI: { spaceId?: string; spaceName?: string } | undefined;
  Profile: undefined;
  Plans: undefined;
  Feedback: undefined;
  HelpSupport: undefined;
};

export type ReminderCallParams = {
  reminderId?: string;
  title: string;
  message: string;
  callId?: string;
  autoAnswer?: boolean;
};

export type ReminderAlarmParams = {
  reminderId?: string;
  title: string;
  message: string;
};

export type ChatThreadParams = {
  id: string;
  name: string;
  kind: 'assistant' | 'unknown';
};

export type AppStackParamList = {
  Main: undefined;
  ChatThread: ChatThreadParams;
  ReminderCall: ReminderCallParams;
  ReminderAlarm: ReminderAlarmParams;
};
