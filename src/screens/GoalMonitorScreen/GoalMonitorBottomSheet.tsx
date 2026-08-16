import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  BackHandler,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import Svg, { Circle, Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../theme';

export type GoalSheetMode = 'create' | 'progress';

type Props = {
  mode: GoalSheetMode;
  spaceName: string;
  goal: string;
  onSave: (goal: string) => void;
};

const TargetIcon = ({ size = 18 }: { size?: number }) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={8.2}
      stroke={colors.primary}
      strokeWidth={1.7}
    />
    <Circle
      cx={12}
      cy={12}
      r={4.6}
      stroke={colors.primary}
      strokeWidth={1.7}
    />
    <Circle cx={12} cy={12} r={1.5} fill={colors.primary} />
  </Svg>
);

const SparkleIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={colors.primary}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const GoalMonitorBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ mode, spaceName, goal, onSave }, ref) => {
    const [draft, setDraft] = useState(goal);
    const [isOpen, setIsOpen] = useState(false);
    const finishedProgress = useRef(new Animated.Value(0)).current;
    const ongoingProgress = useRef(new Animated.Value(0)).current;
    const snapPoints = useMemo(
      () => (mode === 'create' ? ['64%', '86%'] : ['70%', '88%']),
      [mode],
    );

    const closeSheet = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    useEffect(() => {
      if (mode === 'create') {
        setDraft(goal);
        return;
      }
      finishedProgress.setValue(0);
      ongoingProgress.setValue(0);
      Animated.stagger(110, [
        Animated.timing(finishedProgress, {
          toValue: 65,
          duration: 650,
          useNativeDriver: false,
        }),
        Animated.timing(ongoingProgress, {
          toValue: 38,
          duration: 560,
          useNativeDriver: false,
        }),
      ]).start();
    }, [finishedProgress, goal, mode, ongoingProgress]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          closeSheet();
          return true;
        },
      );
      return () => subscription.remove();
    }, [closeSheet, isOpen]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.42}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleSave = () => {
      const cleanGoal = draft.trim();
      if (!cleanGoal) {
        return;
      }
      onSave(cleanGoal);
      closeSheet();
    };

    const finishedWidth = finishedProgress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });
    const ongoingWidth = ongoingProgress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    });

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsOpen(index >= 0)}
        onDismiss={() => setIsOpen(false)}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.topRow}>
            <View style={styles.badge}>
              {mode === 'create' ? <SparkleIcon /> : <TargetIcon size={16} />}
              <Text style={styles.badgeText}>
                {mode === 'create' ? 'NEW GOAL' : 'GOAL PROGRESS'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.closeButton}
              onPress={closeSheet}
              accessibilityLabel="Close goal monitor"
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          {mode === 'create' ? (
            <>
              <Text style={styles.title}>What do you want to achieve?</Text>
              <Text style={styles.subtitle}>
                Describe the outcome in your own words. Buddy will break it down
                and keep watch inside {spaceName}.
              </Text>

              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>YOUR GOAL</Text>
                <BottomSheetTextInput
                  value={draft}
                  onChangeText={setDraft}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                  placeholder="For example: Launch the first version of my app by the end of September..."
                  placeholderTextColor={colors.muted}
                  style={styles.goalInput}
                />
                <Text style={styles.characterCount}>{draft.length}/500</Text>
              </View>

              <View style={styles.buddyNote}>
                <SparkleIcon />
                <Text style={styles.buddyNoteText}>
                  Buddy will connect relevant tasks, notes, and reminders to this
                  goal automatically.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!draft.trim()}
                style={[
                  styles.primaryButton,
                  !draft.trim() && styles.primaryButtonDisabled,
                ]}
                onPress={handleSave}
              >
                <Text style={styles.primaryButtonText}>Save goal</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Your progress</Text>
              <Text style={styles.subtitle}>
                A clear view of the activity Buddy has connected to this goal.
              </Text>

              <View style={styles.goalSummary}>
                <View style={styles.targetWrap}>
                  <TargetIcon size={22} />
                </View>
                <View style={styles.goalSummaryCopy}>
                  <Text style={styles.goalSummaryLabel}>{spaceName}</Text>
                  <Text numberOfLines={3} style={styles.goalSummaryTitle}>
                    {goal}
                  </Text>
                </View>
              </View>

              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressTitle}>Goal progress</Text>
                    <Text style={styles.progressSubtitle}>
                      This month’s connected activity
                    </Text>
                  </View>
                  <View style={styles.periodPill}>
                    <Text style={styles.periodText}>Month</Text>
                  </View>
                </View>

                <View style={styles.progressBlock}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Finished steps</Text>
                    <Text style={styles.progressValue}>65/100%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        styles.finishedFill,
                        { width: finishedWidth },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.progressBlock}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Ongoing steps</Text>
                    <Text style={styles.progressValue}>38/100%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        styles.ongoingFill,
                        { width: ongoingWidth },
                      ]}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>12</Text>
                  <Text style={styles.metricLabel}>Active days</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>8</Text>
                  <Text style={styles.metricLabel}>Linked items</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricValue}>+14%</Text>
                  <Text style={styles.metricLabel}>Momentum</Text>
                </View>
              </View>

              <View style={styles.buddyUpdate}>
                <View style={styles.buddyUpdateHeader}>
                  <SparkleIcon />
                  <Text style={styles.buddyUpdateTitle}>Buddy update</Text>
                </View>
                <Text style={styles.buddyUpdateText}>
                  You are moving steadily. Finishing the two ongoing steps this
                  week will keep the goal on track.
                </Text>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

GoalMonitorBottomSheet.displayName = 'GoalMonitorBottomSheet';

export default GoalMonitorBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },
  indicator: {
    width: ms(46),
    height: ms(5),
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  content: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? mvs(38) : mvs(28),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  closeText: {
    color: colors.muted,
    fontSize: fontSize['2xl'] + ms(4),
    lineHeight: ms(24),
    marginTop: -1,
  },
  title: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
    lineHeight: ms(28),
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  inputCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  inputLabel: {
    marginBottom: spacing.sm,
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  goalInput: {
    minHeight: mvs(142),
    padding: spacing.xl,
    borderRadius: radii.lg,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderFocus,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  buddyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  buddyNoteText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  primaryButton: {
    minHeight: ms(52),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  goalSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primarySoft,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  targetWrap: {
    width: ms(46),
    height: ms(46),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.white,
  },
  goalSummaryCopy: {
    flex: 1,
  },
  goalSummaryLabel: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  goalSummaryTitle: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(20),
  },
  progressCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  progressTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  progressSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  periodPill: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  periodText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  progressBlock: {
    marginTop: spacing.xl,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  progressValue: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  progressTrack: {
    height: ms(34),
    overflow: 'hidden',
    borderRadius: radii.md,
    backgroundColor: colors.lightGray,
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.md,
  },
  finishedFill: {
    backgroundColor: colors.accentIndigo,
  },
  ongoingFill: {
    backgroundColor: colors.primaryPurple,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  metricCard: {
    flex: 1,
    minHeight: ms(76),
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },
  metricLabel: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  buddyUpdate: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  buddyUpdateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buddyUpdateTitle: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  buddyUpdateText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
});
