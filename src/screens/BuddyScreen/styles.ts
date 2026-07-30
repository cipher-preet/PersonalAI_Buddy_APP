import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F7F7FB',
  gradientStart: '#F9F7FF',
  gradientMid: '#EFF3FF',
  gradientEnd: '#FFFFFF',
  white: '#FFFFFF',
  primary: '#4338CA',
  primaryPurple: '#8B5CF6',
  primaryLight: '#EEF2FF',
  primarySoft: '#6366F1',
  text: '#111827',
  subText: '#64748B',
  muted: '#94A3B8',
  border: '#E5E7EB',
  userBubble: '#4338CA',
  aiBubble: '#FFFFFF',
  inputBg: '#FFFFFF',
  chipBg: '#FFFFFF',
};

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  chatArea: {
    flex: 1,
    position: 'relative',
  },

  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    flexGrow: 1,
  },

  heroCard: {
    marginBottom: 20,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },

  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 8,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 32,
    letterSpacing: -0.4,
  },

  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },

  suggestionsTitle: {
    marginTop: 22,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  suggestionsWrap: {
    gap: 10,
  },

  suggestionChip: {
    backgroundColor: COLORS.chipBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primaryPurple,
    marginRight: 10,
  },

  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  dateSeparator: {
    alignSelf: 'center',
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ECEFF5',
  },

  dateSeparatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.subText,
    letterSpacing: 0.2,
  },

  loadingFooter: {
    paddingTop: 14,
    alignItems: 'center',
  },

  typingFooter: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  suggestionChipDisabled: {
    opacity: 0.55,
  },
});
