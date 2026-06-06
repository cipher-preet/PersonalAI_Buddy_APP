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

interface GetUserSpacesArgs {
  userId: string;
  limit?: number;
  cursor?: string;
}
interface GetActiveSpacesArgs {
  userId: string;
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
  }),
});

export const {
  useCreateSpaceMutation,
  useGetUserSpacesQuery,
  useStartListningMutation,
  useGetUserActiveSpaceQuery,
} = homeApi;
