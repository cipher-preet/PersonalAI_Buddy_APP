import React, { memo, useMemo, useState } from 'react';
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

const ACCENTS = [
  colors.primary,
  colors.brandBlue,
  colors.brandPink,
  colors.success,
  colors.primaryPurpleDark,
  colors.info,
] as const;

const accentFor = (key: string) => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 1000003;
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

const NoteIcon = () => (
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
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
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-9 2.5 2.5 4.5-5"
      stroke={colors.subText}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpaceCompactTile = ({
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
  const accent = isListening ? colors.accentCyan : accentFor(spaceId);
  const wellTint = useMemo(() => ({ backgroundColor: `${accent}14` }), [accent]);
  const processingLabel = !isListening ? statusLabel : undefined;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        style={[
          styles.card,
          isListening && styles.cardLive,
          isDeleting && styles.cardDeleting,
        ]}
        onPress={onPress}
        onLongPress={() => {
          if (!isDeleting) {
            setMenuVisible(true);
          }
        }}
        delayLongPress={320}
        disabled={isDeleting}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${notesCount} notes, ${tasksCount} tasks${
          isListening ? ', listening' : processingLabel ? `, ${processingLabel}` : ''
        }`}
      >
        <View style={styles.topRow}>
          <View style={[styles.well, wellTint]}>
            {isDeleting ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <SpaceFolderIcon size={ms(22)} color={accent} />
            )}
          </View>

          {isListening ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {processingLabel ? (
          <View style={[styles.metaRow, styles.processingRow]}>
            <View style={styles.processingDot} />
            <Text style={styles.processingText} numberOfLines={1}>
              {processingLabel}
            </Text>
          </View>
        ) : (
          <View style={styles.metaRow}>
            <View style={styles.stat}>
              <NoteIcon />
              <Text style={styles.statText}>{notesCount}</Text>
            </View>
            <View style={styles.stat}>
              <TaskIcon />
              <Text style={styles.statText}>{tasksCount}</Text>
            </View>
          </View>
        )}
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

export default memo(SpaceCompactTile);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  cardLive: {
    backgroundColor: colors.inputBg,
    borderColor: colors.accentCyan,
  },

  cardDeleting: {
    opacity: 0.6,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  well: {
    width: ms(38),
    height: ms(38),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    paddingHorizontal: spacing.sm,
    paddingVertical: ms(3),
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accentCyan,
  },

  liveDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: colors.successBright,
  },

  liveText: {
    fontSize: ms(8),
    fontWeight: fontWeight.extrabold,
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },

  title: {
    marginTop: spacing.xl,
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
    minHeight: ms(14),
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

  processingRow: {
    gap: spacing.xs,
  },

  processingDot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: colors.primary,
  },

  processingText: {
    flex: 1,
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
});
