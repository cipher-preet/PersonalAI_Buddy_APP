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
import { COLORS } from './styles/color';

type Props = {
  task: TaskItem | null;
};

type IconProps = {
  size?: number;
  color?: string;
};

const EvidenceIcon = ({ size = 18, color = COLORS.primaryDark }: IconProps) => (
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
  size = 16,
  color = COLORS.primaryDark,
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
                  <EvidenceIcon size={18} color={COLORS.primaryDark} />
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
                    color={isEvidenceOpen ? COLORS.white : COLORS.primaryDark}
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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 48,
    height: 5,
    borderRadius: 999,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statusBadge: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: 22,
    lineHeight: 24,
    color: '#6B7280',
    marginTop: -1,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 30,
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
    lineHeight: 20,
  },

  meta: {
    marginTop: 8,
    marginBottom: 4,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 20,
  },

  infoChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  infoChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  priorityChip: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },

  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },

  section: {
    marginBottom: 20,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  subtaskCheck: {
    width: 16,
    height: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: 10,
    marginTop: 2,
  },

  subtaskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 6,
  },

  detailText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
    fontWeight: '400',
  },

  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    fontWeight: '400',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  actionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 8,
    marginRight: 10,
  },

  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '500',
  },

  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },

  relatedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryDark,
    marginRight: 10,
  },

  relatedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  pill: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  pillText: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
  },

  evidenceHeader: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 1,
  },

  evidenceHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },

  evidenceIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    backgroundColor: COLORS.purpleLight,
  },

  evidenceCopy: {
    flex: 1,
  },

  evidenceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.black,
  },

  evidenceSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },

  evidenceToggleOpen: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },

  evidenceToggleText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  evidenceToggleTextOpen: {
    color: COLORS.white,
  },

  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  evidenceIndex: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#EEF2FF',
  },

  evidenceIndexText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '800',
  },

  evidenceText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },

  emptyText: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.gray,
    fontWeight: '600',
  },

  createdText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray,
    marginTop: 4,
  },

  footerSpace: {
    height: 16,
  },
});
