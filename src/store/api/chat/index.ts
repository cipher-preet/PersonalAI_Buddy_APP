import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../../store';
import { BUDDY_CHAT_API_BASE_URL } from '../baseApi';

export interface ChatSessionDto {
  id: string;
  userId: string;
  spaceId: string | null;
  title: string | null;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface CreateChatSessionArgs {
  userId: string;
  spaceId?: string | null;
}

interface ListChatSessionsArgs {
  userId: string;
  spaceId?: string | null;
  limit?: number;
  cursor?: string | null;
}

interface ListChatSessionsData {
  chats: ChatSessionDto[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

interface GetChatSessionArgs {
  userId: string;
  sessionId: string;
}

interface GetChatSessionData {
  chat: ChatSessionDto;
  messages: ChatMessageDto[];
}

interface AskBuddyArgs {
  userId: string;
  question: string;
  chatId?: string | null;
  spaceId?: string | null;
}

interface AskBuddyData {
  chatId: string;
  createdNewChat: boolean;
  answer: string;
}

const parseApiResponse = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      message: `Buddy API returned non-JSON response (${response.status}). Check BUDDY_CHAT_API_BASE_URL.`,
      raw: text.slice(0, 300),
    };
  }
};

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BUDDY_CHAT_API_BASE_URL,
    credentials: 'include',
    responseHandler: parseApiResponse,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      headers.set('Accept', 'application/json');
      headers.set('ngrok-skip-browser-warning', 'true');

      return headers;
    },
  }),
  endpoints: builder => ({
    createChatSession: builder.mutation<
      ApiResponse<ChatSessionDto>,
      CreateChatSessionArgs
    >({
      query: ({ userId, spaceId }) => ({
        url: 'chat/sessions',
        method: 'POST',
        body: {
          userId,
          ...(spaceId ? { spaceId } : {}),
        },
      }),
    }),

    getChatSessions: builder.query<
      ApiResponse<ListChatSessionsData>,
      ListChatSessionsArgs
    >({
      query: ({ userId, spaceId, limit = 20, cursor }) => ({
        url: 'chat/sessions',
        method: 'GET',
        params: {
          userId,
          limit,
          ...(spaceId ? { spaceId } : {}),
          ...(cursor ? { cursor } : {}),
        },
      }),
    }),

    getChatSessionById: builder.query<
      ApiResponse<GetChatSessionData>,
      GetChatSessionArgs
    >({
      query: ({ userId, sessionId }) => ({
        url: `chat/sessions/${sessionId}`,
        method: 'GET',
        params: {
          userId,
        },
      }),
    }),

    askBuddy: builder.mutation<ApiResponse<AskBuddyData>, AskBuddyArgs>({
      query: ({ userId, question, chatId, spaceId }) => ({
        url: 'chat/ask',
        method: 'POST',
        body: {
          userId,
          question,
          ...(chatId ? { chatId } : {}),
          ...(spaceId ? { spaceId } : {}),
        },
      }),
    }),
  }),
});

export const {
  useCreateChatSessionMutation,
  useGetChatSessionsQuery,
  useLazyGetChatSessionsQuery,
  useLazyGetChatSessionByIdQuery,
  useAskBuddyMutation,
} = chatApi;
