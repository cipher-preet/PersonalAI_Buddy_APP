import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CalenderIcon, LinkArrow } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import { TaskItem } from '../types/task';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type Props = {
  item: TaskItem;
  onPress: () => void;
  completed?: boolean;
  onToggleComplete?: () => void;
  onDelete?: () => void;
};

const TrashIcon = ({ color = COLORS.errorDark }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaskCard = ({
  item,
  onPress,
  completed = false,
  onToggleComplete,
  onDelete,
}: Props) => {
  const statusLabel = completed ? 'Done' : 'Not done';
  const statusStyle = completed ? styles.doneBadge : styles.pendingBadge;
  const statusTextStyle = completed ? styles.doneText : styles.pendingText;

  return (
    <View style={styles.shadowWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.container, completed && styles.completedContainer]}
        onPress={onPress}
      >
        <View style={[styles.statusRail, completed && styles.doneRail]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.badge, statusStyle]}>
              <Text style={[styles.badgeText, statusTextStyle]}>
                {statusLabel}
              </Text>
            </View>

            <View style={styles.datePill}>
              <CalenderIcon
                width={ms(13)}
                height={ms(13)}
                color={COLORS.subText}
              />
              <Text numberOfLines={1} style={styles.dateText}>
                {item.createdAt}
              </Text>
            </View>
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              accessibilityLabel={
                completed ? 'Mark task as not done' : 'Mark task as done'
              }
              style={[styles.statusDot, completed && styles.doneDot]}
              onPress={event => {
                event.stopPropagation();
                onToggleComplete?.();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {completed ? <View style={styles.statusDotInner} /> : null}
            </TouchableOpacity>

            <View style={[styles.titleBlock, completed && styles.fadedBlock]}>
              <Text
                numberOfLines={2}
                style={[styles.title, completed && styles.completedTitle]}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text numberOfLines={2} style={styles.subtitle}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.deleteButton}
                onPress={event => {
                  event.stopPropagation();
                  onDelete?.();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <TrashIcon />
              </TouchableOpacity>

              <View style={styles.arrowButton}>
                <LinkArrow
                  width={ms(14)}
                  height={ms(14)}
                  color={COLORS.black}
                />
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            {item.priority ? (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            ) : null}

            <View style={styles.projectBadge}>
              <Text numberOfLines={1} style={styles.projectText}>
                {item.project}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: COLORS.white,
    ...shadows.soft,
  },

  container: {
    minHeight: mvs(146),
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  completedContainer: {
    opacity: 0.68,
  },

  statusRail: {
    width: ms(5),
    backgroundColor: COLORS.primary,
  },

  doneRail: {
    backgroundColor: COLORS.successBright,
  },

  content: {
    flex: 1,
    paddingHorizontal: ms(14),
    paddingVertical: ms(14),
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  statusDot: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    borderWidth: 2,
    borderColor: COLORS.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ms(1),
    marginRight: spacing.lg,
    backgroundColor: COLORS.white,
  },

  doneDot: {
    borderColor: COLORS.successBright,
    backgroundColor: COLORS.successBright,
  },

  statusDotInner: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: COLORS.white,
  },

  titleBlock: {
    flex: 1,
    paddingRight: spacing.lg,
  },

  title: {
    color: COLORS.black,
    fontWeight: fontWeight.extrabold,
    fontSize: fontSize.lg,
    lineHeight: ms(21),
  },

  completedTitle: {
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },

  fadedBlock: {
    opacity: 0.72,
  },

  subtitle: {
    marginTop: ms(5),
    color: COLORS.subText,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.medium,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(7),
    flexShrink: 0,
  },

  deleteButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  arrowButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: radii.sm,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  datePill: {
    maxWidth: ms(138),
    minHeight: ms(30),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(9),
    borderRadius: radii.pill,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    gap: spacing.sm,
  },

  dateText: {
    color: COLORS.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: ms(7),
    marginTop: spacing.xl,
    paddingLeft: ms(32),
  },

  badge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  doneBadge: {
    backgroundColor: '#DCFCE7',
  },

  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },

  pendingText: {
    color: '#92400E',
  },

  doneText: {
    color: '#166534',
  },

  priorityBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: COLORS.purpleLight,
  },

  priorityText: {
    color: COLORS.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },

  projectBadge: {
    maxWidth: ms(132),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: COLORS.lightGray,
  },

  projectText: {
    color: COLORS.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },
});
