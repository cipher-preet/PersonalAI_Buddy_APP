import { baseApi } from '../baseApi';


export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<
      { token: string },
      { email: string; password: string }
    >({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
