import { baseApi } from '../baseApi';

interface CreateSpacePayload {
  spacename: string;
  userId: string;
}

interface CreateSpaceResponse {
  success: boolean;
  message: string;
  data: any;
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

interface GetSpaceStatsResponse {
  success: boolean;
  data: SpaceStats;
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
interface GetNoteWorkspacesArgs {
  userId: string;
}
interface GetStagedNotesBySpaceArgs {
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
  }),
});

export const {
  useCreateSpaceMutation,
  useGetUserSpacesQuery,
  useStartListningMutation,
  useGetUserActiveSpaceQuery,
  useGetSpaceStatsQuery,
  useGetNoteWorkspacesQuery,
  useGetStagedNotesBySpaceQuery,
} = homeApi;
