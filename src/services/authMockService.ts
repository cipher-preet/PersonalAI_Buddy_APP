const MOCK_USER_ID = '6a21be267be2c45e7960c4ab';

export const mockVerifyOtp = (phone: string, otp: string) => {
  if (otp.length !== 4) {
    throw new Error('Please enter a valid 4-digit OTP');
  }

  const digits = phone.replace(/\D/g, '');
  const isNewUser = !digits.endsWith('0');

  return {
    success: true,
    token: `mock-token-${Date.now()}`,
    userId: MOCK_USER_ID,
    isNewUser,
  };
};

export const mockGoogleLogin = () => ({
  success: true,
  token: `mock-google-token-${Date.now()}`,
  userId: MOCK_USER_ID,
  isNewUser: false,
  name: 'Preet Kumar',
  email: 'preet.kumar@gmail.com',
});

export const mockSendOtp = () => ({
  success: true,
  message: 'OTP sent successfully',
});
