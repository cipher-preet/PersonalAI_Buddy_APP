import { baseApi } from '../baseApi';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrapApiData = <T>(response: unknown): T => {
  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    'success' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }

  return response as T;
};

export type OtpVerifyResponse = {
  token: string;
  userId: string;
  isNewUser: boolean;
  message?: string;
};

export type GoogleAuthResponse = {
  token: string;
  userId: string;
  isNewUser: boolean;
  name?: string;
  email?: string;
};

export type CheckAuthResponse = {
  authenticated: boolean;
  userId: string;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  phone?: string | number;
  email?: string;
  name?: string;
  sessionAuthenticated?: boolean;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    checkAuth: builder.query<CheckAuthResponse, void>({
      query: () => ({
        url: 'auth/checkauth',
        method: 'GET',
      }),
      transformResponse: response => unwrapApiData<CheckAuthResponse>(response),
    }),

    sendOtp: builder.mutation<{ message?: string }, { phone: string }>({
      query: body => ({
        url: 'auth/send-otp',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<{ message?: string }>(response),
    }),

    verifyOtp: builder.mutation<OtpVerifyResponse, { phone: string; otp: string }>({
      query: body => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<OtpVerifyResponse>(response),
    }),

    googleLogin: builder.mutation<GoogleAuthResponse, { idToken: string }>({
      query: body => ({
        url: 'auth/google',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<GoogleAuthResponse>(response),
    }),

    completeOnboarding: builder.mutation<
      { message?: string },
      {
        userId: string;
        profession: string;
        usageGoal: string;
        source: string;
      }
    >({
      query: body => ({
        url: 'auth/onboarding',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<{ message?: string }>(response),
    }),

    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: response => unwrapApiData<{ token: string }>(response),
    }),
  }),
  overrideExisting: true,
});

export const {
  useCheckAuthQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGoogleLoginMutation,
  useCompleteOnboardingMutation,
  useLoginMutation,
} = authApi;
