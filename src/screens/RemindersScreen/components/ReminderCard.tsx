import React, { memo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { REMINDER_TONES, ReminderItem } from './mockReminders';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  item: ReminderItem;
  width: number;
  onPress?: () => void;
  onDelete?: () => void;
};

const MoreIcon = ({ color = colors.text }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.6" fill={color} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
    <Circle cx="12" cy="19" r="1.6" fill={color} />
  </Svg>
);

const TrashIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
      stroke={colors.error}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReminderCard = ({ item, width, onPress, onDelete }: Props) => {
  const tone = REMINDER_TONES[item.tone] ?? REMINDER_TONES.lavender;
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.shadowWrap, { width }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, { backgroundColor: tone.bg }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text numberOfLines={2} style={[styles.title, { color: tone.text }]}>
              {item.title}
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.moreButton}
              onPress={event => {
                event.stopPropagation();
                setMenuVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Reminder options"
            >
              <MoreIcon color={tone.arrow} />
            </TouchableOpacity>
          </View>

          {item.description ? (
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.description, { color: tone.muted }]}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.timeLabel, { color: tone.muted }]}>
            {item.timeLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable style={styles.menuCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete?.();
              }}
            >
              <TrashIcon />
              <Text style={styles.menuItemText}>Delete reminder</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default memo(ReminderCard);

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radii['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  card: {
    minHeight: ms(148),
    borderRadius: radii['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  body: {
    gap: spacing.xxs,
  },

  moreButton: {
    width: ms(28),
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(1),
  },

  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(22),
    letterSpacing: -0.3,
  },

  description: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
    paddingRight: ms(28),
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },

  timeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  menuBackdrop: {
    flex: 1,
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['4xl'],
  },

  menuCard: {
    width: '100%',
    maxWidth: ms(260),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  menuItemText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
