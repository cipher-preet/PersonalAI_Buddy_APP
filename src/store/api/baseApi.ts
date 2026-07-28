import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const API_BASE_URL =
  'https://f65d-2401-4900-1c71-4a77-6918-77c2-edd0-9dc3.ngrok-free.app/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['Spaces'],
  endpoints: () => ({}),
});
