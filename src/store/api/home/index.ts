import { baseApi } from '../baseApi';

interface CreateSpacePayload {
  spacename: string;
  userId: string;
}

interface CreateSpaceResponse {
  success: boolean;
  message: string;
  data: {
    message?: string;
  };
}

interface DeleteSpaceResponse {
  success: boolean;
  message?: string;
  data: {
    message?: string;
    data?: {
      deletedSpaceId?: string;
    };
  };
}

interface DeleteStagedItemResponse {
  success: boolean;
  message?: string;
  data: {
    message?: string;
    data?: {
      deletedNoteId?: string;
      deletedTaskId?: string;
    };
  };
}

interface StartLIstningResponse {
  success: boolean;
  data: any;
}
interface StartLIstningPayload {
  spaceId: string;
  isListning: boolean
}

export interface Space {
  _id: string;
  spacename: string;
  description: string;
  notesCount?: number;
  tasksCount?: number;
  userId: string;
  isListning: boolean;
  listeningStartedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface GetUserSpacesData {
  spaces: Space[];
  nextCursor?: string;
}

interface GetUserSpacesPayload {
  status: number;
  message: string;
  data: GetUserSpacesData;
}

interface GetUserSpacesResponse {
  success: boolean;
  data: GetUserSpacesPayload;
}
interface GetUserActiveSpacesResponse {
  success: boolean;
  data: any;
}

export type BriefingTaskCard = {
  id: string;
  title: string;
  meta: string;
  priority?: string;
  due?: string;
  dueStatus?: string;
  space?: string;
  reason?: string;
};

export type BriefingFocusItem = {
  id: string;
  title: string;
  why: string;
  timeHint: string;
  taskId: string;
};

export type BriefingAgendaCard = {
  id: string;
  kind: string;
  time: string;
  endTime: string;
  title: string;
  location: string;
  prep: string;
};

export type BriefingStats = {
  completedTasks: number;
  openTasks: number;
  overdueTasks: number;
  dueToday: number;
  meetings: number;
  reminders: number;
  conversations: number;
  chatMessages: number;
  notes: number;
};

export type BriefingMeetingCard = {
  id: string;
  time: string;
  title: string;
  meta: string;
};

export type BriefingInsightCard = {
  id: string;
  source: string;
  sourceType: string;
  title: string;
  body: string;
  excerpt: string;
  whyItMatters: string;
  capturedAt: string;
  space: string;
  tags: string[];
};

export type BriefingListItem = {
  id: string;
  title: string;
  detail: string;
};

export type BriefingSourceStats = {
  transcriptCount: number;
  taskCount: number;
  noteCount: number;
  eventCount: number;
  reminderCount: number;
  pendingTranscriptCount: number;
  chatMessageCount?: number;
  openTaskCount?: number;
};

export type BriefingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY'
  | 'FAILED'
  | 'SKIPPED'
  | string;

export type DailyBriefingPayload = {
  userId: string;
  dateKey: string;
  timezone: string;
  status: BriefingStatus;
  skipReason?: string | null;
  headline: string;
  overview: string;
  highlights: BriefingListItem[];
  importantMoments: BriefingListItem[];
  completed: BriefingListItem[];
  pendingTasks: BriefingListItem[];
  decisions: BriefingListItem[];
  followUps: BriefingListItem[];
  tomorrowFocus: BriefingListItem[];
  insights: BriefingInsightCard[];
  people: string[];
  topics: string[];
  tasks: BriefingTaskCard[];
  meetings: BriefingMeetingCard[];
  focus?: BriefingFocusItem[];
  agenda?: BriefingAgendaCard[];
  risks?: BriefingListItem[];
  stats?: BriefingStats;
  planDateKey?: string;
  sourceStats: BriefingSourceStats;
  pipelineVersion?: string;
  generatedAt?: string | null;
  updatedAt?: string | null;
  periodStartUtc?: string | null;
  periodEndUtc?: string | null;
};

interface GetDailyBriefingResponse {
  success: boolean;
  message?: string;
  data: DailyBriefingPayload;
}

export interface SpaceStats {
  notesCount: number;
  tasksCount: number;
  doneTasksCount: number;
  completionPercentage: number;
}

export interface ProfileSummary {
  notesCount: number;
  tasksCount: number;
  spacesCount: number;
}

export interface NoteWorkspace {
  id: string;
  name: string;
  description?: string;
  notesCount: number;
}

export interface StagedNoteCard {
  id: string;
  title: string;
  bodyPreview: string;
  confidence: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  conversationId?: string | null;
}

export interface StagedNoteDetail {
  id: string;
  title: string;
  body: string;
  evidence: unknown;
}

export interface StagedTaskCard {
  id: string;
  title: string;
  body: string;
  descriptionPreview: string;
  evidence: unknown;
  operation: string | null;
  priority: string | null;
  dueDate: string | null;
  confidence: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface GetSpaceStatsResponse {
  success: boolean;
  data: SpaceStats;
}

interface GetProfileSummaryResponse {
  success: boolean;
  data: ProfileSummary;
}

interface GetNoteWorkspacesResponse {
  success: boolean;
  data: {
    spaces: NoteWorkspace[];
  };
}

export interface GetStagedNotesBySpaceResponse {
  success: boolean;
  data: {
    notes: StagedNoteCard[];
    nextCursor: string | null;
    total?: number;
    date?: string;
  };
}

export const NO_CONVERSATION_GROUP_ID = 'none';

export interface NoteConversationGroup {
  id: string;
  conversationId: string | null;
  notesCount: number;
  latestAt: string | null;
  earliestAt: string | null;
  startedAt: string | null;
  stoppedAt: string | null;
  sourceType: string | null;
  previewTitles: string[];
}

export interface GetNoteConversationsBySpaceResponse {
  success: boolean;
  data: {
    groups: NoteConversationGroup[];
    nextCursor: string | null;
    totalGroups: number;
    totalNotes: number;
  };
}

interface GetStagedNoteByIdResponse {
  success: boolean;
  data: StagedNoteDetail;
}

interface GetStagedTasksBySpaceResponse {
  success: boolean;
  data: {
    tasks: StagedTaskCard[];
    nextCursor: string | null;
    total?: number;
    date?: string;
  };
}

interface CreateStagedNotePayload {
  spaceId: string;
  title: string;
  description: string;
  date?: string;
}

interface CreateStagedNoteResponse {
  success: boolean;
  data: {
    message?: string;
    note: StagedNoteCard;
  };
}

interface CreateStagedTaskPayload {
  spaceId: string;
  title: string;
  description: string;
  date?: string;
}

interface CreateStagedTaskResponse {
  success: boolean;
  data: {
    message?: string;
    task: StagedTaskCard;
  };
}

interface SetStagedTaskStatusPayload {
  taskId: string;
  done: boolean;
}

interface SetStagedTaskStatusResponse {
  success: boolean;
  data: {
    message?: string;
    task?: StagedTaskCard;
  };
}

export type SpaceCountsMode = 'all' | 'notes' | 'tasks' | 'none';
interface GetUserSpacesArgs {
  userId: string;
  limit?: number;
  cursor?: string;
  /** Which per-space counts the backend should compute. Defaults to 'all'. */
  counts?: SpaceCountsMode;
}
interface GetActiveSpacesArgs {
  userId: string;
}
interface GetSpaceStatsArgs {
  userId: string;
  spaceId: string;
}
interface GetProfileSummaryArgs {
  userId: string;
}
interface GetNoteWorkspacesArgs {
  userId: string;
}
interface GetStagedNotesBySpaceArgs {
  userId: string;
  spaceId: string;
  limit?: number;
  cursor?: string;
  date?: string;
  /** Conversation id, or `NO_CONVERSATION_GROUP_ID` for notes without one. */
  conversationId?: string;
}
interface GetNoteConversationsBySpaceArgs {
  userId: string;
  spaceId: string;
  limit?: number;
  cursor?: string;
}
interface GetStagedNoteByIdArgs {
  noteId: string;
}
interface GetStagedTasksBySpaceArgs {
  userId: string;
  spaceId: string;
  limit?: number;
  cursor?: string;
  date?: string;
}
interface GetDateMarkersBySpaceArgs {
  userId: string;
  spaceId: string;
  from: string;
  to: string;
}
interface GetDateMarkersBySpaceResponse {
  success: boolean;
  data: {
    dates: string[];
    from: string;
    to: string;
  };
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createSpace: builder.mutation<CreateSpaceResponse, CreateSpacePayload>({
      query: data => ({
        url: 'home/create-space',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Spaces', 'Plans'],
    }),

    deleteSpace: builder.mutation<DeleteSpaceResponse, { spaceId: string }>({
      query: data => ({
        url: 'home/delete-space',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Spaces', 'Plans'],
    }),

    startListning: builder.mutation<
      StartLIstningResponse,
      StartLIstningPayload
    >({
      query: data => ({
        url: 'home/startListning',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Spaces', 'Plans'],
    }),

    getUserSpaces: builder.query<GetUserSpacesResponse, GetUserSpacesArgs>({
      query: ({ userId, limit = 10, cursor = '', counts = 'all' }) => ({
        url: 'home/getuserspaces',
        method: 'GET',
        params: {
          userId,
          limit,
          cursor,
          ...(counts !== 'all' ? { counts } : {}),
        },
      }),
      providesTags: (_result, _error, { counts = 'all' }) => [
        'Spaces',
        ...(counts === 'all' || counts === 'notes' ? (['NoteCounts'] as const) : []),
        ...(counts === 'all' || counts === 'tasks' ? (['TaskCounts'] as const) : []),
      ],
    }),

    getUserActiveSpace: builder.query<
      GetUserActiveSpacesResponse,
      GetActiveSpacesArgs
    >({
      query: ({ userId }) => ({
        url: 'home/getUserActiveSpace',
        method: 'GET',
        params: {
          userId,
        },
      }),
      providesTags: ['Spaces'],
    }),

    getSpaceStats: builder.query<GetSpaceStatsResponse, GetSpaceStatsArgs>({
      query: ({ userId, spaceId }) => ({
        url: 'home/getSpaceStats',
        method: 'GET',
        params: {
          userId,
          spaceId,
        },
      }),
      providesTags: ['Spaces', 'NoteCounts', 'TaskCounts', 'TaskStatus'],
    }),

    getProfileSummary: builder.query<
      GetProfileSummaryResponse,
      GetProfileSummaryArgs
    >({
      query: ({ userId }) => ({
        url: 'home/getProfileSummary',
        method: 'GET',
        params: {
          userId,
        },
      }),
      providesTags: ['Spaces', 'NoteCounts', 'TaskCounts', 'TaskStatus'],
    }),

    getNoteWorkspaces: builder.query<
      GetNoteWorkspacesResponse,
      GetNoteWorkspacesArgs
    >({
      query: ({ userId }) => ({
        url: 'home/getNoteWorkspaces',
        method: 'GET',
        params: {
          userId,
        },
      }),
      providesTags: ['Spaces', 'NoteCounts'],
    }),

    getStagedNotesBySpace: builder.query<
      GetStagedNotesBySpaceResponse,
      GetStagedNotesBySpaceArgs
    >({
      query: ({
        userId,
        spaceId,
        limit = 10,
        cursor = '',
        date,
        conversationId,
      }) => ({
        url: 'home/getStagedNotesBySpace',
        method: 'GET',
        params: {
          userId,
          spaceId,
          limit,
          cursor,
          ...(date ? { date } : {}),
          ...(conversationId ? { conversationId } : {}),
        },
      }),
      providesTags: ['Notes'],
    }),

    getNoteConversationsBySpace: builder.query<
      GetNoteConversationsBySpaceResponse,
      GetNoteConversationsBySpaceArgs
    >({
      query: ({ userId, spaceId, limit = 10, cursor = '' }) => ({
        url: 'home/getNoteConversationsBySpace',
        method: 'GET',
        params: {
          userId,
          spaceId,
          limit,
          cursor,
        },
      }),
      providesTags: ['Notes'],
    }),

    getStagedNoteById: builder.query<
      GetStagedNoteByIdResponse,
      GetStagedNoteByIdArgs
    >({
      query: ({ noteId }) => ({
        url: 'home/getStagedNoteById',
        method: 'GET',
        params: {
          noteId,
        },
      }),
      providesTags: ['Notes'],
    }),

    deleteStagedNote: builder.mutation<
      DeleteStagedItemResponse,
      { noteId: string }
    >({
      query: data => ({
        url: 'home/delete-staged-note',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notes', 'NoteCounts', 'Plans'],
    }),

    getStagedTasksBySpace: builder.query<
      GetStagedTasksBySpaceResponse,
      GetStagedTasksBySpaceArgs
    >({
      query: ({ userId, spaceId, limit = 10, cursor = '', date }) => ({
        url: 'home/getStagedTasksBySpace',
        method: 'GET',
        params: {
          userId,
          spaceId,
          limit,
          cursor,
          ...(date ? { date } : {}),
        },
      }),
      providesTags: ['Tasks'],
    }),

    getNoteDateMarkersBySpace: builder.query<
      GetDateMarkersBySpaceResponse,
      GetDateMarkersBySpaceArgs
    >({
      query: ({ userId, spaceId, from, to }) => ({
        url: 'home/getNoteDateMarkersBySpace',
        method: 'GET',
        params: { userId, spaceId, from, to },
      }),
      providesTags: ['Notes'],
    }),

    getTaskDateMarkersBySpace: builder.query<
      GetDateMarkersBySpaceResponse,
      GetDateMarkersBySpaceArgs
    >({
      query: ({ userId, spaceId, from, to }) => ({
        url: 'home/getTaskDateMarkersBySpace',
        method: 'GET',
        params: { userId, spaceId, from, to },
      }),
      providesTags: ['Tasks'],
    }),

    deleteStagedTask: builder.mutation<
      DeleteStagedItemResponse,
      { taskId: string }
    >({
      query: data => ({
        url: 'home/delete-staged-task',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tasks', 'TaskCounts', 'Plans'],
    }),

    createStagedNote: builder.mutation<
      CreateStagedNoteResponse,
      CreateStagedNotePayload
    >({
      query: data => ({
        url: 'home/create-staged-note',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notes', 'NoteCounts', 'Plans'],
    }),

    createStagedTask: builder.mutation<
      CreateStagedTaskResponse,
      CreateStagedTaskPayload
    >({
      query: data => ({
        url: 'home/create-staged-task',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tasks', 'TaskCounts', 'Plans'],
    }),

    setStagedTaskStatus: builder.mutation<
      SetStagedTaskStatusResponse,
      SetStagedTaskStatusPayload
    >({
      query: data => ({
        url: 'home/set-staged-task-status',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TaskStatus'],
    }),

    registerDeviceToken: builder.mutation<
      { success: boolean },
      { token: string; platform?: 'android' | 'ios' | 'web' }
    >({
      query: data => ({
        url: 'home/register-device-token',
        method: 'POST',
        body: data,
      }),
    }),
    getDailyBriefing: builder.query<GetDailyBriefingResponse, { date?: string } | void>({
      query: args => ({
        url: 'home/getDailyBriefing',
        method: 'GET',
        params: args?.date ? { date: args.date } : undefined,
      }),
      providesTags: ['Briefing'],
    }),
    /** TEMPORARY test hook — remove before production release. */
    forceGenerateDailyBriefing: builder.mutation<
      {
        success: boolean;
        data?: {
          userId: string;
          dateKey: string;
          timezone: string;
          status: string;
          skipReason?: string | null;
          forced?: boolean;
        };
        message?: string;
      },
      { period?: 'today' | 'yesterday'; date?: string } | void
    >({
      query: args => ({
        url: 'home/forceGenerateDailyBriefing',
        method: 'POST',
        body: {
          period: args?.period ?? 'today',
          ...(args?.date ? { date: args.date } : {}),
        },
      }),
      invalidatesTags: ['Briefing'],
    }),
    submitFeedback: builder.mutation<
      {
        success: boolean;
        data?: {
          message?: string;
          feedbackId?: string;
        };
        message?: string;
      },
      { topicId: string; topicLabel: string; message: string }
    >({
      query: body => ({
        url: 'home/submit-feedback',
        method: 'POST',
        body,
      }),
    }),
    raiseSupportTicket: builder.mutation<
      {
        success: boolean;
        data?: {
          message?: string;
          ticketId?: string;
          status?: string;
        };
        message?: string;
      },
      {
        categoryId: string;
        categoryLabel: string;
        subject: string;
        message: string;
      }
    >({
      query: body => ({
        url: 'home/raise-support-ticket',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreateSpaceMutation,
  useCreateStagedNoteMutation,
  useCreateStagedTaskMutation,
  useDeleteSpaceMutation,
  useDeleteStagedNoteMutation,
  useDeleteStagedTaskMutation,
  useGetUserSpacesQuery,
  useStartListningMutation,
  useGetUserActiveSpaceQuery,
  useGetSpaceStatsQuery,
  useGetProfileSummaryQuery,
  useGetNoteWorkspacesQuery,
  useGetStagedNotesBySpaceQuery,
  useGetNoteConversationsBySpaceQuery,
  useLazyGetStagedNoteByIdQuery,
  useGetStagedTasksBySpaceQuery,
  useGetNoteDateMarkersBySpaceQuery,
  useGetTaskDateMarkersBySpaceQuery,
  useRegisterDeviceTokenMutation,
  useGetDailyBriefingQuery,
  useForceGenerateDailyBriefingMutation,
  useSubmitFeedbackMutation,
  useRaiseSupportTicketMutation,
  useSetStagedTaskStatusMutation,
} = homeApi;
