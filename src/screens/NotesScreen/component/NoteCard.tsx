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

import { NoteItem } from '../types/note';
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
  item: NoteItem;
  onPress: () => void;
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

const NoteCard = ({ item, onPress, onDelete }: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const displayDate = item.updatedAt || item.createdAt;
  const tags = Array.isArray(item.tags) ? item.tags.slice(0, 2) : [];

  return (
    <View style={styles.shadowWrap}>
      <View style={styles.card}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View style={styles.topRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText} numberOfLines={1}>
                {item.tag || 'NOTE'}
              </Text>
            </View>

            {displayDate ? (
              <View style={styles.dateRow}>
                <CalendarIcon />
                <Text style={styles.dateText} numberOfLines={1}>
                  {displayDate}
                </Text>
              </View>
            ) : (
              <View style={styles.dateSpacer} />
            )}

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.moreButton}
              onPress={event => {
                event.stopPropagation();
                setMenuVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Note options"
            >
              <MoreIcon />
            </TouchableOpacity>
          </View>

          <Text numberOfLines={1} style={styles.title}>
            {item.title}
          </Text>

          {item.desc ? (
            <Text numberOfLines={2} style={styles.desc}>
              {item.desc}
            </Text>
          ) : null}

          {tags.length > 0 ? (
            <View style={styles.metaRow}>
              {tags.map((tag, index) => (
                <View
                  key={tag}
                  style={[styles.pill, index === 0 && styles.pillFixed]}
                >
                  <Text
                    style={styles.pillText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.dashedDivider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {item.readTime ? item.readTime : 'Open note'}
            </Text>
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
              <Text style={styles.menuItemText}>Open note</Text>
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
              <Text style={styles.menuDeleteText}>Delete note</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default memo(NoteCard);

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: layout.listGap,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  card: {
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    overflow: 'hidden',
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  tag: {
    maxWidth: '42%',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    flexShrink: 1,
  },

  tagText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  dateRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginHorizontal: spacing.sm,
    minWidth: 0,
  },

  dateSpacer: {
    flex: 1,
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
    flexShrink: 0,
    marginRight: -spacing.xs,
  },

  title: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: ms(21),
    letterSpacing: -0.2,
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
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  pill: {
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },

  pillFixed: {
    flexShrink: 0,
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
