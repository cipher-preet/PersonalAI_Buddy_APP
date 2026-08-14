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
  Easing,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { TaskItem } from '../types/task';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing
} from '../../../theme';

type Props = {
  task: TaskItem | null;
};

type IconProps = {
  size?: number;
  color?: string;
};

const EvidenceIcon = ({
  size = ms(18),
  color = colors.primaryDark,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v5h5M9 13h6M9 17h4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon = ({
  size = ms(16),
  color = colors.primaryDark,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const evidenceTextKeys = [
  'text',
  'quote',
  'content',
  'body',
  'transcript',
  'snippet',
  'message',
  'value',
  'sourceText',
  'source_text',
];

const getEvidenceText = (item: unknown): string => {
  if (typeof item === 'string') {
    return item.trim();
  }

  if (!item || typeof item !== 'object') {
    return '';
  }

  const record = item as Record<string, unknown>;

  for (const key of evidenceTextKeys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  for (const value of Object.values(record)) {
    const nestedText = getEvidenceText(value);

    if (nestedText) {
      return nestedText;
    }
  }

  return '';
};

const TaskDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ task }, ref) => {
    const snapPoints = useMemo(() => ['88%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const chevronRotation = useRef(new Animated.Value(0)).current;

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          opacity={0.45}
        />
      ),
      [],
    );

    useEffect(() => {
      if (!isSheetOpen) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleClose();
          return true;
        },
      );

      return () => subscription.remove();
    }, [isSheetOpen, handleClose]);

    useEffect(() => {
      if (
        Platform.OS === 'android' &&
        UIManager.setLayoutAnimationEnabledExperimental
      ) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }, []);

    useEffect(() => {
      setIsEvidenceOpen(false);
    }, [task?.id]);

    useEffect(() => {
      Animated.timing(chevronRotation, {
        toValue: isEvidenceOpen ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, [chevronRotation, isEvidenceOpen]);

    const toggleEvidence = useCallback(() => {
      LayoutAnimation.configureNext({
        duration: 220,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      setIsEvidenceOpen(prev => !prev);
    }, []);

    if (!task) {
      return (
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.indicator}
          onChange={index => setIsSheetOpen(index >= 0)}
        >
          <View />
        </BottomSheetModal>
      );
    }

    const evidenceItems = Array.isArray(task.evidence)
      ? task.evidence
      : task.evidence
        ? [task.evidence]
        : [];
    const evidenceTexts = evidenceItems
      .map(getEvidenceText)
      .filter(item => item.length > 0);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.headerRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{task.status}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{task.title}</Text>
          {task.subtitle ? (
            <Text style={styles.subtitle}>{task.subtitle}</Text>
          ) : null}

          <Text style={styles.meta}>
            Due {task.dueDate} · Updated {task.updatedAt}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{task.project}</Text>
            </View>
            <View style={[styles.infoChip, styles.priorityChip]}>
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{task.assignee}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.evidenceHeader}
              onPress={toggleEvidence}
            >
              <View style={styles.evidenceHeaderLeft}>
                <View style={styles.evidenceIconWrap}>
                  <EvidenceIcon size={18} color={colors.primaryDark} />
                </View>

                <View style={styles.evidenceCopy}>
                  <Text style={styles.evidenceTitle}>Evidence</Text>
                  <Text style={styles.evidenceSubtitle}>
                    {evidenceTexts.length > 0
                      ? `${evidenceTexts.length} source ${
                          evidenceTexts.length === 1 ? 'line' : 'lines'
                        }`
                      : 'No source text available'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.evidenceToggle,
                  isEvidenceOpen && styles.evidenceToggleOpen,
                ]}
              >
                <Text
                  style={[
                    styles.evidenceToggleText,
                    isEvidenceOpen && styles.evidenceToggleTextOpen,
                  ]}
                >
                  {isEvidenceOpen ? 'Hide' : 'Show'}
                </Text>
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: chevronRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <ChevronDownIcon
                    size={16}
                    color={isEvidenceOpen ? colors.white : colors.primaryDark}
                  />
                </Animated.View>
              </View>
            </TouchableOpacity>

            {isEvidenceOpen ? (
              evidenceTexts.length > 0 ? (
                evidenceTexts.map((item, index) => (
                  <View key={`${item}-${index}`} style={styles.evidenceCard}>
                    <View style={styles.evidenceIndex}>
                      <Text style={styles.evidenceIndexText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.evidenceText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No evidence available.</Text>
              )
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Labels</Text>
            <View style={styles.tagsRow}>
              {task.tags.map(tag => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.createdText}>Created {task.createdAt}</Text>

          <View style={styles.footerSpace} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

TaskDetailBottomSheet.displayName = 'TaskDetailBottomSheet';

export default TaskDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },

  indicator: {
    backgroundColor: colors.border,
    width: ms(48),
    height: ms(5),
    borderRadius: radii.pill,
  },

  scrollContent: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? mvs(32) : mvs(24),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  statusBadge: {
    backgroundColor: colors.purpleLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(5),
    borderRadius: ms(8),
  },

  statusText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.3,
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: fontSize['2xl'] + ms(4),
    lineHeight: ms(24),
    color: colors.muted,
    marginTop: -1,
  },

  title: {
    fontSize: fontSize['2xl'] + ms(4),
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    lineHeight: ms(30),
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.gray,
    lineHeight: ms(20),
  },

  meta: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gray,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  infoChip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
  },

  infoChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  priorityChip: {
    backgroundColor: colors.warningSoft,
    borderColor: '#FDE68A',
  },

  priorityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: '#B45309',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },

  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  subtaskCheck: {
    width: ms(16),
    height: ms(16),
    borderRadius: ms(5),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    marginRight: spacing.md,
    marginTop: spacing.xxs,
  },

  subtaskText: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: ms(20),
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },

  detailCard: {
    backgroundColor: colors.white,
    borderRadius: ms(14),
    padding: ms(12),
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.lightGray,
  },

  detailTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.black,
    marginBottom: spacing.xs,
  },

  detailText: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.textSecondary,
    fontWeight: fontWeight.regular,
  },

  bodyText: {
    fontSize: fontSize.lg,
    lineHeight: ms(24),
    color: colors.textSecondary,
    fontWeight: fontWeight.regular,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  actionDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primary,
    marginTop: spacing.md,
    marginRight: spacing.md,
  },

  actionText: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },

  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.lightGray,
    borderRadius: radii.sm,
  },

  relatedDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primaryDark,
    marginRight: spacing.md,
  },

  relatedText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  pill: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },

  pillText: {
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  evidenceHeader: {
    minHeight: mvs(58),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(10),
    borderRadius: ms(14),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderFocus,
  },

  evidenceHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
  },

  evidenceIconWrap: {
    width: ms(36),
    height: ms(36),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(10),
    backgroundColor: colors.purpleLight,
  },

  evidenceCopy: {
    flex: 1,
  },

  evidenceTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: colors.black,
  },

  evidenceSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: ms(6),
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primaryLight,
  },

  evidenceToggleOpen: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },

  evidenceToggleText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  evidenceToggleTextOpen: {
    color: colors.white,
  },

  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: ms(14),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  evidenceIndex: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    backgroundColor: colors.primaryLight,
  },

  evidenceIndexText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },

  evidenceText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: ms(20),
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },

  emptyText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    lineHeight: ms(20),
    color: colors.gray,
    fontWeight: fontWeight.semibold,
  },

  createdText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.gray,
    marginTop: spacing.xs,
  },

  footerSpace: {
    height: spacing.lg,
  },
});
