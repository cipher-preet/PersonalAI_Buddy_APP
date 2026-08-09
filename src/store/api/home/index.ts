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
  tasksCount?: number;
  userId: string;
  isListining: boolean;
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

interface GetStagedNotesBySpaceResponse {
  success: boolean;
  data: {
    notes: StagedNoteCard[];
    nextCursor: string | null;
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
  };
}

interface GetUserSpacesArgs {
  userId: string;
  limit?: number;
  cursor?: string;
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
}
interface GetStagedNoteByIdArgs {
  noteId: string;
}
interface GetStagedTasksBySpaceArgs {
  userId: string;
  spaceId: string;
  limit?: number;
  cursor?: string;
}

export const homeApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    createSpace: builder.mutation<CreateSpaceResponse, CreateSpacePayload>({
      query: data => ({
        url: 'home/create-space',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Spaces'],
    }),

    deleteSpace: builder.mutation<DeleteSpaceResponse, { spaceId: string }>({
      query: data => ({
        url: 'home/delete-space',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Spaces'],
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
      invalidatesTags: ['Spaces'],
    }),

    getUserSpaces: builder.query<GetUserSpacesResponse, GetUserSpacesArgs>({
      query: ({ userId, limit = 10, cursor = '' }) => ({
        url: 'home/getuserspaces',
        method: 'GET',
        params: {
          userId,
          limit,
          cursor,
        },
      }),
      providesTags: ['Spaces'],
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
      providesTags: ['Spaces'],
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
      providesTags: ['Spaces'],
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
      providesTags: ['Spaces'],
    }),

    getStagedNotesBySpace: builder.query<
      GetStagedNotesBySpaceResponse,
      GetStagedNotesBySpaceArgs
    >({
      query: ({ userId, spaceId, limit = 10, cursor = '' }) => ({
        url: 'home/getStagedNotesBySpace',
        method: 'GET',
        params: {
          userId,
          spaceId,
          limit,
          cursor,
        },
      }),
      providesTags: ['Spaces'],
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
      providesTags: ['Spaces'],
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
      invalidatesTags: ['Spaces'],
    }),

    getStagedTasksBySpace: builder.query<
      GetStagedTasksBySpaceResponse,
      GetStagedTasksBySpaceArgs
    >({
      query: ({ userId, spaceId, limit = 10, cursor = '' }) => ({
        url: 'home/getStagedTasksBySpace',
        method: 'GET',
        params: {
          userId,
          spaceId,
          limit,
          cursor,
        },
      }),
      providesTags: ['Spaces'],
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
      invalidatesTags: ['Spaces'],
    }),
  }),
});

export const {
  useCreateSpaceMutation,
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
  useLazyGetStagedNoteByIdQuery,
  useGetStagedTasksBySpaceQuery,
} = homeApi;
