import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F4F5F7',
  white: '#FFFFFF',
  primary: '#7B4DFF',
  text: '#111827',
  subText: '#6B7280',
  border: '#E5E7EB',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 16,

    paddingBottom: 40,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },
});