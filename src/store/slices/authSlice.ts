import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { PersistedAuthSession } from '../../services/authSessionStorage';

export type OnboardingData = {
  profession: string;
  usageGoal: string;
  source: string;
};

type AuthState = {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isNewUser: boolean;
  userId: string | null;
  token: string | null;
  phone: string | number | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  onboarding: OnboardingData;
};

const initialState: AuthState = {
  isAuthenticated: false,
  hasCompletedOnboarding: false,
  isNewUser: false,
  userId: null,
  token: null,
  phone: null,
  email: null,
  name: null,
  avatar: null,
  onboarding: {
    profession: '',
    usageGoal: '',
    source: '',
  },
};

type LoginSuccessPayload = {
  userId: string;
  token: string;
  isNewUser: boolean;
  phone?: string | number;
  email?: string;
  name?: string;
  avatar?: string;
  hasCompletedOnboarding?: boolean;
};

type UpdateProfilePayload = {
  phone?: string | number | null;
  email?: string | null;
  name?: string | null;
  avatar?: string | null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.isAuthenticated = true;
      state.isNewUser = action.payload.isNewUser;
      state.hasCompletedOnboarding =
        action.payload.hasCompletedOnboarding ?? !action.payload.isNewUser;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.phone = action.payload.phone ?? null;
      state.email = action.payload.email ?? null;
      state.name = action.payload.name ?? null;
      state.avatar = action.payload.avatar ?? null;
    },
    setOnboardingProfession: (state, action: PayloadAction<string>) => {
      state.onboarding.profession = action.payload;
    },
    setOnboardingUsage: (state, action: PayloadAction<string>) => {
      state.onboarding.usageGoal = action.payload;
    },
    setOnboardingSource: (state, action: PayloadAction<string>) => {
      state.onboarding.source = action.payload;
    },
    completeOnboarding: state => {
      state.hasCompletedOnboarding = true;
      state.isNewUser = false;
    },
    checkAuthSuccess: (
      state,
      action: PayloadAction<Omit<LoginSuccessPayload, 'token'> & { token?: string }>,
    ) => {
      state.isAuthenticated = true;
      state.isNewUser = action.payload.isNewUser;
      state.hasCompletedOnboarding =
        action.payload.hasCompletedOnboarding ?? !action.payload.isNewUser;
      state.userId = action.payload.userId;
      state.token = action.payload.token ?? state.token;
      state.phone = action.payload.phone ?? null;
      state.email = action.payload.email ?? null;
      state.name = action.payload.name ?? null;
      state.avatar = action.payload.avatar ?? null;
    },
    updateProfileSuccess: (
      state,
      action: PayloadAction<UpdateProfilePayload>,
    ) => {
      if (action.payload.phone !== undefined) {
        state.phone = action.payload.phone;
      }
      if (action.payload.email !== undefined) {
        state.email = action.payload.email;
      }
      if (action.payload.name !== undefined) {
        state.name = action.payload.name;
      }
      if (action.payload.avatar !== undefined) {
        state.avatar = action.payload.avatar;
      }
    },
    restoreSession: (state, action: PayloadAction<PersistedAuthSession>) => {
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.isNewUser = action.payload.isNewUser;
      state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;
      state.phone = action.payload.phone;
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.avatar = action.payload.avatar;
    },
    logout: () => initialState,
  },
});

export const selectPersistableSession = (
  state: AuthState,
): PersistedAuthSession | null =>
  state.isAuthenticated && state.userId
    ? {
        userId: state.userId,
        token: state.token,
        isNewUser: state.isNewUser,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        phone: state.phone,
        email: state.email,
        name: state.name,
        avatar: state.avatar,
      }
    : null;

export const {
  loginSuccess,
  setOnboardingProfession,
  setOnboardingUsage,
  setOnboardingSource,
  completeOnboarding,
  checkAuthSuccess,
  updateProfileSuccess,
  restoreSession,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
