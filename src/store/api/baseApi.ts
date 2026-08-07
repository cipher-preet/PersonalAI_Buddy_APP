import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { API_URLS } from '../../config/apiConfig';
import type { RootState } from '../store';

export const API_BASE_URL = API_URLS.appApiBase;
export const BUDDY_CHAT_API_BASE_URL = API_URLS.buddyApiBase;

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
      message: `Server returned non-JSON response (${response.status}).`,
      raw: text.slice(0, 300),
    };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: 'include',
    responseHandler: parseApiResponse,
    timeout: 20000,
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
  tagTypes: ['Spaces', 'Plans'],
  endpoints: () => ({}),
});
