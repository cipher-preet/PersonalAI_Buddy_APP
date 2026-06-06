import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://4817-223-178-208-251.ngrok-free.app/api/v1',
  }),
  tagTypes: ['Spaces'],
  endpoints: () => ({}),
});
