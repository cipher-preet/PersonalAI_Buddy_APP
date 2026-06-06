import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL =
  'https://26a8-2401-4900-1c70-ef4a-b00c-942a-f125-dc2b.ngrok-free.app/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['Spaces'],
  endpoints: () => ({}),
});
