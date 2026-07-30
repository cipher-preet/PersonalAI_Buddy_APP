export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  bullets?: string[];
  time: string;
};

export type ChatSession = {
  id: string;
  title: string;
  preview: string;
  updatedAt: Date;
  messageCount: number;
  messages: ChatMessage[];
};
