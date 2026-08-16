import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useGetUserSpacesQuery, type Space } from '../../store/api/home';
import { useToast } from '../../store/context/ToastContext';
import { useAppSelector } from '../../store/hooks';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  listPerf,
  ms,
  radii,
  spacing,
} from '../../theme';
import GoalMonitorBottomSheet, {
  type GoalSheetMode,
} from './GoalMonitorBottomSheet';

const SPACE_CARD_TONES = [
  {
    colors: [colors.primarySoft, colors.primaryLight, '#FFFFFF'],
    accent: colors.primary,
    border: colors.brandBorder,
    button: [colors.primaryDark, colors.primary, colors.primaryMid],
  },
  {
    colors: ['#EEF6FF', '#E0EAFF', '#FFFFFF'],
    accent: colors.info,
    border: '#BFDBFE',
    button: ['#1D4ED8', colors.info, '#38BDF8'],
  },
  {
    colors: [colors.purpleLight, colors.primarySoft, '#FFFFFF'],
    accent: colors.primaryPurple,
    border: '#DDD6FE',
    button: [colors.primaryPurpleDark, colors.primaryPurple, colors.primaryMid],
  },
  {
    colors: ['#ECFDF5', '#E0F2FE', '#FFFFFF'],
    accent: colors.success,
    border: '#A7F3D0',
    button: ['#047857', colors.success, '#14B8A6'],
  },
] as const;

const BackIcon = () => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18 9 12l6-6"
      stroke={colors.text}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TargetIcon = ({
  color = colors.primary,
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8.2} stroke={color} strokeWidth={1.7} />
    <Circle cx={12} cy={12} r={4.7} stroke={color} strokeWidth={1.7} />
    <Circle cx={12} cy={12} r={1.5} fill={color} />
  </Svg>
);

const ArrowIcon = ({ color = colors.white }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14m-5-5 5 5-5 5"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CalendarMiniIcon = ({ color = colors.subText }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3.8v2.4M17 3.8v2.4M3.8 9.2h16.4M5.4 5.2h13.2A1.6 1.6 0 0 1 20.2 6.8v12A1.6 1.6 0 0 1 18.6 20.4H5.4A1.6 1.6 0 0 1 3.8 18.8v-12A1.6 1.6 0 0 1 5.4 5.2Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const formatSpaceDate = (value?: string) => {
  if (!value) {
    return 'Ready to monitor';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ready to monitor';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const GoalMonitorScreen = () => {
  const navigation = useNavigation();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { showToast } = useToast();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const [activeSpaceId, setActiveSpaceId] = useState('');
  const [goalsBySpace, setGoalsBySpace] = useState<Record<string, string>>({});
  const [sheetMode, setSheetMode] = useState<GoalSheetMode>('create');

  const { data: spacesData, isFetching } = useGetUserSpacesQuery(
    { userId, limit: 50 },
    { skip: !userId },
  );
  const spaces = useMemo(
    () => spacesData?.data?.data?.spaces ?? [],
    [spacesData],
  );
  const activeSpace = spaces.find(space => space._id === activeSpaceId);
  const activeGoal = goalsBySpace[activeSpaceId] ?? '';

  const openSheet = useCallback(
    (space: Space, mode: GoalSheetMode) => {
      const goal = goalsBySpace[space._id] ?? '';
      setActiveSpaceId(space._id);

      if (mode === 'progress' && !goal) {
        showToast({
          message: 'Set your goal first.',
          description: 'Buddy needs an outcome before progress can be tracked.',
          type: 'error',
        });
        setSheetMode('create');
      } else {
        setSheetMode(mode);
      }

      requestAnimationFrame(() => sheetRef.current?.present());
    },
    [goalsBySpace, showToast],
  );

  const saveGoal = (goal: string) => {
    if (!activeSpaceId) {
      return;
    }
    setGoalsBySpace(current => ({ ...current, [activeSpaceId]: goal }));
    showToast({
      message: 'Buddy will take care of it.',
      description: `Your goal is now being monitored in ${
        activeSpace?.spacename ?? 'this space'
      }.`,
      type: 'success',
      duration: 4200,
    });
  };

  const renderSpaceCard = useCallback(
    ({ item: space, index }: { item: Space; index: number }) => {
      const tone = SPACE_CARD_TONES[index % SPACE_CARD_TONES.length];
      const goal = goalsBySpace[space._id] ?? '';
      const hasGoal = Boolean(goal);

      return (
        <LinearGradient
          colors={[...tone.colors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.spaceCard, { borderColor: tone.border }]}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardCopy}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {space.spacename}
              </Text>
              <Text numberOfLines={2} style={styles.cardSubtitle}>
                {hasGoal
                  ? goal
                  : 'Set an outcome for this space and let Buddy track the momentum.'}
              </Text>
            </View>

            <View style={styles.statusButton}>
              <TargetIcon color={tone.accent} size={18} />
            </View>
          </View>

          {hasGoal ? (
            <View style={styles.inlineProgress}>
              <View style={styles.inlineProgressTop}>
                <Text style={styles.inlineProgressLabel}>Progress</Text>
                <Text style={[styles.inlineProgressValue, { color: tone.accent }]}>
                  65%
                </Text>
              </View>
              <View style={styles.inlineProgressTrack}>
                <View
                  style={[
                    styles.inlineProgressFill,
                    { backgroundColor: tone.accent },
                  ]}
                />
              </View>
            </View>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={styles.dateBadge}>
              <CalendarMiniIcon />
              <Text style={styles.dateBadgeText}>
                {formatSpaceDate(space.updatedAt || space.createdAt)}
              </Text>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.secondaryAction}
                onPress={() => openSheet(space, 'progress')}
              >
                <Text style={[styles.secondaryActionText, { color: tone.accent }]}>
                  Track
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openSheet(space, 'create')}
              >
                <LinearGradient
                  colors={[...tone.button]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryAction}
                >
                  <Text style={styles.primaryActionText}>
                    {hasGoal ? 'Update' : 'Set goal'}
                  </Text>
                  <ArrowIcon />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      );
    },
    [goalsBySpace, openSheet],
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.78}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Goal Monitor</Text>
            <Text style={styles.headerSubtitle}>Track every space outcome</Text>
          </View>
          <View style={styles.headerTarget}>
            <TargetIcon size={18} />
          </View>
        </View>

        <FlatList
          data={spaces}
          keyExtractor={item => item._id}
          renderItem={renderSpaceCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <View style={styles.intro}>
              <Text style={styles.introTitle}>Select a space</Text>
              <Text style={styles.introSubtitle}>
                Update goals and track progress for each space.
              </Text>
            </View>
          }
          ListEmptyComponent={
            isFetching ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No spaces available</Text>
                <Text style={styles.emptyText}>
                  Create a space first, then return here to set goals.
                </Text>
              </View>
            )
          }
          {...listPerf}
        />
      </SafeAreaView>

      <GoalMonitorBottomSheet
        ref={sheetRef}
        mode={sheetMode}
        spaceName={activeSpace?.spacename ?? ''}
        goal={activeGoal}
        onSave={saveGoal}
      />
    </View>
  );
};

export default GoalMonitorScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    minHeight: ms(58),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: layout.hairline,
    borderColor: colors.border,
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  headerTarget: {
    width: layout.headerButton,
    height: layout.headerButton,
    borderRadius: layout.headerButton / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  intro: {
    marginBottom: spacing.xl,
  },
  introTitle: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },
  introSubtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  loader: {
    marginTop: spacing['4xl'],
  },
  emptyCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    lineHeight: ms(19),
  },
  spaceCard: {
    minHeight: ms(196),
    marginBottom: layout.listGap,
    padding: layout.cardPadding,
    borderRadius: radii['2xl'],
    borderWidth: layout.hairline,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
    lineHeight: ms(26),
  },
  cardSubtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  statusButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  inlineProgress: {
    marginTop: spacing.xl,
  },
  inlineProgressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  inlineProgressLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  inlineProgressValue: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  inlineProgressTrack: {
    height: ms(8),
    overflow: 'hidden',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  inlineProgressFill: {
    width: '65%',
    height: '100%',
    borderRadius: radii.pill,
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  dateBadgeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryAction: {
    minHeight: ms(40),
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  secondaryActionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  primaryAction: {
    minHeight: ms(40),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  primaryActionText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
});
