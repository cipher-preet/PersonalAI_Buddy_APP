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
  name?: string;
  avatar?: string;
  message?: string;
};

export type GoogleAuthResponse = {
  token: string;
  userId: string;
  isNewUser: boolean;
  name?: string;
  email?: string;
  avatar?: string;
};

export type CheckPhoneResponse = {
  exists: boolean;
  phone: string | number;
  name?: string;
  hasCompletedOnboarding?: boolean;
};

export type AuthUserProfile = {
  userId: string;
  phone?: string | number;
  email?: string;
  name?: string;
  avatar?: string;
};

export type CheckAuthResponse = AuthUserProfile & {
  authenticated: boolean;
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  sessionAuthenticated?: boolean;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  phone?: string;
};

export type DeleteAccountResponse = {
  message?: string;
  deleted?: {
    spaces?: number;
    notes?: number;
    tasks?: number;
  };
};

export type LogoutResponse = {
  message?: string;
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

    checkPhone: builder.mutation<CheckPhoneResponse, { phone: string }>({
      query: body => ({
        url: 'auth/check-phone',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<CheckPhoneResponse>(response),
    }),

    verifyOtp: builder.mutation<
      OtpVerifyResponse,
      { phone: string; otp: string; username?: string; fcmToken?: string; platform?: string }
    >({
      query: body => ({
        url: 'auth/verify-otp',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<OtpVerifyResponse>(response),
    }),

    googleLogin: builder.mutation<
      GoogleAuthResponse,
      { idToken: string; fcmToken?: string; platform?: string }
    >({
      query: body => ({
        url: 'auth/google',
        method: 'POST',
        body,
      }),
      transformResponse: response => unwrapApiData<GoogleAuthResponse>(response),
    }),

    updateProfile: builder.mutation<AuthUserProfile, UpdateProfileRequest>({
      query: body => ({
        url: 'auth/me',
        method: 'PATCH',
        body,
      }),
      transformResponse: response => unwrapApiData<AuthUserProfile>(response),
    }),

    updateProfileAvatar: builder.mutation<AuthUserProfile, FormData>({
      query: body => ({
        url: 'auth/me/avatar',
        method: 'PATCH',
        body,
      }),
      transformResponse: response => unwrapApiData<AuthUserProfile>(response),
    }),

    deleteAccount: builder.mutation<
      DeleteAccountResponse,
      { confirmation: string }
    >({
      query: body => ({
        url: 'auth/me',
        method: 'DELETE',
        body,
      }),
      transformResponse: response => unwrapApiData<DeleteAccountResponse>(response),
    }),

    logoutUser: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST',
      }),
      transformResponse: response => unwrapApiData<LogoutResponse>(response),
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

    login: builder.mutation<
      { token: string },
      { email: string; password: string; fcmToken?: string; platform?: string }
    >({
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
  useCheckPhoneMutation,
  useVerifyOtpMutation,
  useGoogleLoginMutation,
  useUpdateProfileMutation,
  useUpdateProfileAvatarMutation,
  useDeleteAccountMutation,
  useLogoutUserMutation,
  useCompleteOnboardingMutation,
  useLoginMutation,
} = authApi;
