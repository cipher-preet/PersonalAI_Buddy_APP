/**
 * DM Sans, the Equal AI type family.
 * Files are linked from assets/fonts. Weights are separate files because
 * Android does not switch a single family with fontWeight.
 */
export const fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semibold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
} as const;

export type FontFamily = (typeof fonts)[keyof typeof fonts];
