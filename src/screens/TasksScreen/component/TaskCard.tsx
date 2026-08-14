import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { TaskItem } from '../types/task';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
  layout
} from '../../../theme';

type Props = {
  item: TaskItem;
  onPress: () => void;
  completed?: boolean;
  onToggleComplete?: () => void;
  onDelete?: () => void;
};

const CalendarIcon = () => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke={colors.textSecondary}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="1.6" fill={colors.text} />
    <Circle cx="12" cy="12" r="1.6" fill={colors.text} />
    <Circle cx="12" cy="19" r="1.6" fill={colors.text} />
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

const OpenIcon = () => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17 17 7M10 7h7v7"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6 9 17l-5-5"
      stroke={color}
      strokeWidth={1.9}
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
  const [menuVisible, setMenuVisible] = useState(false);
  const displayDate = item.updatedAt || item.createdAt;
  const statusLabel = completed ? 'Done' : 'Not done';
  const metaPills = [
    item.priority,
    item.project,
    item.dueDate && item.dueDate !== 'No due date' ? item.dueDate : null,
  ].filter(Boolean) as string[];

  return (
    <View style={[styles.shadowWrap, completed && styles.shadowWrapCompleted]}>
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View style={styles.topRow}>
            <View style={styles.topLeft}>
              <TouchableOpacity
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ checked: completed }}
                accessibilityLabel={
                  completed ? 'Mark task as not done' : 'Mark task as done'
                }
                style={[styles.radio, completed && styles.radioChecked]}
                onPress={event => {
                  event.stopPropagation();
                  onToggleComplete?.();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {completed ? <View style={styles.radioInner} /> : null}
              </TouchableOpacity>

              <View
                style={[
                  styles.tag,
                  completed ? styles.tagDone : styles.tagPending,
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    completed ? styles.tagTextDone : styles.tagTextPending,
                  ]}
                  numberOfLines={1}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>

            <View style={styles.topRight}>
              {displayDate ? (
                <View style={styles.dateRow}>
                  <CalendarIcon />
                  <Text style={styles.dateText} numberOfLines={1}>
                    {displayDate}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.moreButton}
                onPress={event => {
                  event.stopPropagation();
                  setMenuVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Task options"
              >
                <MoreIcon />
              </TouchableOpacity>
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={[styles.title, completed && styles.titleCompleted]}
          >
            {item.title}
          </Text>

          {item.subtitle ? (
            <Text numberOfLines={2} style={styles.desc}>
              {item.subtitle}
            </Text>
          ) : null}

          {metaPills.length > 0 ? (
            <View style={styles.metaRow}>
              {metaPills.map(pill => (
                <View key={pill} style={styles.pill}>
                  <Text style={styles.pillText} numberOfLines={1}>
                    {pill}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.dashedDivider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Open task</Text>
            <Text style={styles.footerChevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

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
                onPress();
              }}
            >
              <OpenIcon />
              <Text style={styles.menuItemText}>Open task</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onToggleComplete?.();
              }}
            >
              <CheckIcon
                color={completed ? colors.textSecondary : colors.primary}
              />
              <Text style={styles.menuItemText}>
                {completed ? 'Mark as not done' : 'Mark as done'}
              </Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete?.();
              }}
            >
              <TrashIcon />
              <Text style={styles.menuDeleteText}>Delete task</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: layout.listGap,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  shadowWrapCompleted: {
    opacity: 0.78,
  },

  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    maxWidth: '52%',
  },

  radio: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: colors.borderFocus,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    flexShrink: 0,
  },

  radioChecked: {
    borderColor: colors.successBright,
    backgroundColor: colors.successBright,
  },

  radioInner: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(3.5),
    backgroundColor: colors.white,
  },

  tag: {
    flexShrink: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },

  tagPending: {
    backgroundColor: colors.warningSoft,
  },

  tagDone: {
    backgroundColor: colors.successSoft,
  },

  tagText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  tagTextPending: {
    color: colors.warningText,
  },

  tagTextDone: {
    color: colors.successText,
  },

  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: ms(110),
  },

  dateText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  moreButton: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(21),
    letterSpacing: -0.2,
  },

  titleCompleted: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },

  desc: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: ms(17),
    fontWeight: fontWeight.medium,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  pill: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    maxWidth: ms(140),
  },

  pillText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  dashedDivider: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderStyle: 'dashed',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  footerChevron: {
    color: colors.primary,
    fontSize: fontSize.xl,
    lineHeight: ms(20),
    fontWeight: fontWeight.bold,
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

  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(52),
  },

  menuItemText: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  menuDeleteText: {
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
