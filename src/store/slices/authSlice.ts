import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  hasCompletedOnboarding?: boolean;
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
    },
    logout: () => initialState,
  },
});

export const {
  loginSuccess,
  setOnboardingProfession,
  setOnboardingUsage,
  setOnboardingSource,
  completeOnboarding,
  checkAuthSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
