import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { HistoryIcon } from '../../../../styles/icons';
import { CHAT } from '../styles';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  onHistoryPress?: () => void;
  onBack?: () => void;
  onNewChatPress?: () => void;
  showTitle?: boolean;
  title?: string | null;
  contextLabel?: string | null;
};

const BackIcon = ({ color = CHAT.text }: { color?: string }) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6 9 12l6 6"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlusIcon = ({ color = CHAT.text }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2.1}
      strokeLinecap="round"
    />
  </Svg>
);

const Header = ({
  onHistoryPress,
  onBack,
  onNewChatPress,
  showTitle = false,
  title,
  contextLabel,
}: Props) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.titleButton}
        activeOpacity={0.75}
        onPress={onBack || onHistoryPress}
        accessibilityRole="button"
        accessibilityLabel={onBack ? 'Back to chats' : 'Chat history'}
      >
        {onBack ? (
          <BackIcon />
        ) : (
          <HistoryIcon width={ms(18)} height={ms(18)} color={CHAT.primary} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {showTitle ? title?.trim() || 'New chat' : 'Chats'}
        </Text>
      </TouchableOpacity>

      {contextLabel ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {contextLabel}
        </Text>
      ) : (
        <View style={styles.subtitleSpacer} />
      )}

      <TouchableOpacity
        style={styles.newButton}
        onPress={onNewChatPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="New chat"
      >
        <PlusIcon />
        <Text style={styles.newButtonText}>New</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    gap: spacing.md,
  },

  titleButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  title: {
    flexShrink: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: CHAT.text,
  },

  subtitle: {
    maxWidth: '28%',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: CHAT.textMuted,
  },

  subtitleSpacer: {
    width: spacing.xs,
  },

  newButton: {
    minHeight: ms(32),
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: CHAT.border,
    backgroundColor: CHAT.surface,
  },

  newButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: CHAT.text,
  },
});
