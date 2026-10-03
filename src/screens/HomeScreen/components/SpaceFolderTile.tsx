import React, { memo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Svg, { Path } from 'react-native-svg';

import SpaceFolderIcon from './SpaceFolderIcon';
import SpaceTileMenu from './SpaceTileMenu';
import { useGetSpaceStatsQuery } from '../../../store/api/home';
import { useAppSelector } from '../../../store/hooks';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  spaceId: string;
  title: string;
  statusLabel?: string;
  notesCount?: number;
  tasksCount?: number;
  isListening?: boolean;
  isDeleting?: boolean;
  onPress: () => void;
  onDelete?: () => void;
};

const countLabel = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`;

const NoteIcon = () => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3.5h7l4.5 4.5v11A1.5 1.5 0 0 1 17 20.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5ZM9 12h6M9 16h4"
      stroke={colors.subText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaskIcon = () => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-9 2.5 2.5 4.5-5"
      stroke={colors.subText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpaceFolderTile = ({
  spaceId,
  title,
  statusLabel,
  notesCount: initialNotesCount,
  tasksCount: initialTasksCount,
  isListening = false,
  isDeleting = false,
  onPress,
  onDelete,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const hasListCounts =
    typeof initialNotesCount === 'number' &&
    typeof initialTasksCount === 'number';

  const { data: statsData } = useGetSpaceStatsQuery(
    { userId, spaceId },
    { skip: !userId || !spaceId || hasListCounts },
  );

  const notesCount = statsData?.data?.notesCount ?? initialNotesCount ?? 0;
  const tasksCount = statsData?.data?.tasksCount ?? initialTasksCount ?? 0;
  const badgeLabel = isListening ? 'Live' : statusLabel;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          isDeleting && styles.cardDeleting,
        ]}
        onPress={onPress}
        onLongPress={() => {
          if (onDelete && !isDeleting) {
            setMenuVisible(true);
          }
        }}
        delayLongPress={320}
        disabled={isDeleting}
        accessibilityRole="button"
        accessibilityLabel={title}
      >
        <View
          style={[
            styles.preview,
            isListening && styles.previewLive,
            Boolean(badgeLabel) && styles.previewWithBadge,
          ]}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <SpaceFolderIcon
              size={ms(48)}
              color={isListening ? colors.accentCyan : colors.primary}
            />
          )}
          {badgeLabel ? (
            <View style={[styles.badge, isListening && styles.badgeLive]}>
              <View style={[styles.badgeDot, isListening && styles.badgeDotLive]} />
              <Text style={styles.badgeText} numberOfLines={1}>
                {badgeLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View
            style={styles.metaRow}
            accessible
            accessibilityLabel={`${countLabel(notesCount, 'note', 'notes')}, ${countLabel(tasksCount, 'task', 'tasks')}`}
          >
            <View style={styles.stat}>
              <NoteIcon />
              <Text style={styles.statText}>{notesCount}</Text>
            </View>
            <View style={styles.stat}>
              <TaskIcon />
              <Text style={styles.statText}>{tasksCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <SpaceTileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onOpen={onPress}
        onDelete={onDelete}
      />
    </>
  );
};

export default memo(SpaceFolderTile);
const styles = StyleSheet.create({
  card: {
    width: '100%',
  },

  cardDeleting: {
    opacity: 0.6,
  },

  preview: {
    width: '100%',
    aspectRatio: 1.3,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewLive: {
    backgroundColor: colors.inputBg,
  },

  previewWithBadge: {
    paddingTop: ms(10),
  },

  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },

  badgeLive: {
    borderColor: colors.accentCyan,
  },

  badgeDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: colors.primary,
  },

  badgeDotLive: {
    backgroundColor: colors.successBright,
  },

  badgeText: {
    flexShrink: 1,
    fontSize: ms(9),
    fontWeight: fontWeight.extrabold,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  footer: {
    paddingHorizontal: spacing.xxs,
    paddingTop: spacing.lg,
  },

  title: {
    color: colors.black,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  metaRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
  },

  statText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
});
