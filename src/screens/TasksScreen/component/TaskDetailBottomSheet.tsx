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
  Clipboard,
  Easing,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  Share,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TaskItem } from '../types/task';
import { useToast } from '../../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  task: TaskItem | null;
};

type IconProps = {
  size?: number;
  color?: string;
};

const SHEET_BG = '#FFFFFF';
const INK = '#1C1917';
const MUTED = '#57534E';
const SOFT = '#E7E5E4';
const CHIP_BG = '#FFFFFF';

const MoreIcon = ({ size = ms(18), color = INK }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 12h.01M12 12h.01M18 12h.01"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
    />
  </Svg>
);

const ShareIcon = ({ size = ms(15), color = '#FFFFFF' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CopyIcon = ({ size = ms(16), color = INK }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M5 15V5a1 1 0 0 1 1-1h10"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const FolderIcon = ({ size = ms(14), color = MUTED }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const EvidenceIcon = ({ size = ms(16), color = INK }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v5h5M9 13h6M9 17h4"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronDownIcon = ({ size = ms(15), color = MUTED }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m6 9 6 6 6-6"
      stroke={color}
      strokeWidth={2}
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
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ['88%'], []);
    const topInset = Math.max(insets.top, spacing.md) + spacing.md;
    const { showToast } = useToast();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const chevronRotation = useRef(new Animated.Value(0)).current;

    const handleClose = useCallback(() => {
      setMoreOpen(false);
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
          opacity={0.4}
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
      setMoreOpen(false);
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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsEvidenceOpen(prev => !prev);
    }, []);

    const title = task?.title || '';
    const summaryText = task?.summary?.trim() || '';
    const subtitleText = task?.subtitle?.trim() || '';
    const bodyText =
      summaryText ||
      subtitleText ||
      'No task description available.';
    const showSubtitle =
      subtitleText.length > 0 &&
      summaryText.length > 0 &&
      subtitleText !== summaryText;
    const shareText = [
      title,
      bodyText,
      task?.dueDate ? `Due ${task.dueDate}` : '',
      task?.priority ? `Priority: ${task.priority}` : '',
      task?.assignee ? `Assignee: ${task.assignee}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const handleCopy = useCallback(async () => {
      if (!shareText.trim()) {
        showToast({ message: 'Nothing to copy', type: 'error' });
        return;
      }
      Clipboard.setString(shareText);
      showToast({ message: 'Copied to clipboard', type: 'success' });
    }, [shareText, showToast]);

    const handleShare = useCallback(async () => {
      if (!shareText.trim()) {
        showToast({ message: 'Nothing to share', type: 'error' });
        return;
      }
      try {
        await Share.share({ message: shareText, title });
      } catch {
        showToast({ message: 'Unable to share', type: 'error' });
      }
    }, [shareText, showToast, title]);

    const evidenceItems = Array.isArray(task?.evidence)
      ? task.evidence
      : task?.evidence
        ? [task.evidence]
        : [];
    const evidenceTexts = evidenceItems
      .map(getEvidenceText)
      .filter(item => item.length > 0);
    const folderLabel = task?.updatedAt || task?.createdTime || '';

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        topInset={topInset}
        enablePanDownToClose
        animateOnMount
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
      >
        {!task ? (
          <View style={styles.emptySheet} />
        ) : (
          <>
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.actionRow}>
                <View style={styles.actionLeft}>
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={() => setMoreOpen(true)}
                    activeOpacity={0.8}
                    accessibilityLabel="More options"
                  >
                    <MoreIcon />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={0.88}
                    accessibilityLabel="Share task"
                  >
                    <Text style={styles.shareText}>Share</Text>
                    <ShareIcon />
                  </TouchableOpacity>
                </View>

                <View style={styles.actionRight}>
                  <TouchableOpacity
                    style={styles.circleButton}
                    onPress={handleCopy}
                    activeOpacity={0.8}
                    accessibilityLabel="Copy task"
                  >
                    <CopyIcon />
                  </TouchableOpacity>

                  <View style={styles.folderChip}>
                    <FolderIcon />
                    <Text style={styles.folderChipText} numberOfLines={1}>
                      {folderLabel || task.dueDate}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.title}>{task.title}</Text>

              <View style={styles.metaRow}>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>{task.status}</Text>
                </View>
                <View style={styles.priorityChip}>
                  <Text style={styles.priorityChipText}>{task.priority}</Text>
                </View>
                <Text style={styles.metaText}>Due {task.dueDate}</Text>
              </View>

              {showSubtitle ? (
                <Text style={styles.subtitle}>{task.subtitle}</Text>
              ) : null}
              <Text style={styles.bodyText}>{bodyText}</Text>

              <View style={styles.infoBlock}>
                <Text style={styles.infoLine}>Assignee: {task.assignee}</Text>
                <Text style={styles.infoLine}>Updated {task.updatedAt}</Text>
              </View>

              <View style={styles.block}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.evidenceHeader}
                  onPress={toggleEvidence}
                >
                  <View style={styles.evidenceLeft}>
                    <EvidenceIcon />
                    <View>
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
                    <ChevronDownIcon />
                  </Animated.View>
                </TouchableOpacity>

                {isEvidenceOpen ? (
                  evidenceTexts.length > 0 ? (
                    evidenceTexts.map((item, index) => (
                      <Text
                        key={`${item}-${index}`}
                        style={styles.evidenceLine}
                      >
                        {index + 1}. {item}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No evidence available.</Text>
                  )
                ) : null}
              </View>

              {task.tags.length > 0 ? (
                <View style={styles.block}>
                  <Text style={styles.sectionHeading}>Labels</Text>
                  <View style={styles.tagsRow}>
                    {task.tags.map(tag => (
                      <View key={tag} style={styles.pill}>
                        <Text style={styles.pillText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={styles.createdText}>Created {task.createdAt}</Text>
              <View style={styles.footerSpace} />
            </BottomSheetScrollView>

            <Modal
              visible={moreOpen}
              transparent
              animationType="fade"
              onRequestClose={() => setMoreOpen(false)}
            >
              <Pressable
                style={styles.moreBackdrop}
                onPress={() => setMoreOpen(false)}
              >
                <View style={styles.moreCard}>
                  <TouchableOpacity
                    style={styles.moreItem}
                    onPress={() => {
                      setMoreOpen(false);
                      toggleEvidence();
                    }}
                  >
                    <Text style={styles.moreItemText}>
                      {isEvidenceOpen ? 'Hide evidence' : 'Show evidence'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moreItem}
                    onPress={() => {
                      setMoreOpen(false);
                      handleClose();
                    }}
                  >
                    <Text style={[styles.moreItemText, styles.moreItemDanger]}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Modal>
          </>
        )}
      </BottomSheetModal>
    );
  },
);

TaskDetailBottomSheet.displayName = 'TaskDetailBottomSheet';

export default TaskDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },

  emptySheet: {
    minHeight: ms(80),
    backgroundColor: SHEET_BG,
  },

  indicator: {
    backgroundColor: '#D6D3D1',
    width: ms(42),
    height: ms(4),
    borderRadius: radii.pill,
  },

  scrollContent: {
    backgroundColor: SHEET_BG,
    paddingHorizontal: ms(20),
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? mvs(36) : mvs(28),
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing['2xl'],
  },

  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },

  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },

  circleButton: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(19),
    backgroundColor: CHIP_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  shareButton: {
    minHeight: ms(38),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: INK,
  },

  shareText: {
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  folderChip: {
    maxWidth: ms(148),
    minHeight: ms(38),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: CHIP_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SOFT,
  },

  folderChipText: {
    flexShrink: 1,
    color: MUTED,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  title: {
    color: INK,
    fontSize: fontSize['2xl'] + ms(2),
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(32),
    letterSpacing: -0.4,
    marginBottom: spacing.md,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },

  statusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: CHIP_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SOFT,
  },

  statusChipText: {
    color: MUTED,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.warningSoft,
  },

  priorityChipText: {
    color: '#B45309',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  metaText: {
    color: MUTED,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  subtitle: {
    color: MUTED,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
    marginBottom: spacing.md,
  },

  bodyText: {
    color: MUTED,
    fontSize: fontSize.lg,
    lineHeight: ms(26),
    fontWeight: fontWeight.regular,
    marginBottom: spacing.lg,
  },

  infoBlock: {
    marginBottom: spacing['2xl'],
    gap: spacing.xs,
  },

  infoLine: {
    color: MUTED,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
  },

  block: {
    marginBottom: spacing['2xl'],
  },

  sectionHeading: {
    color: INK,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },

  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },

  evidenceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingRight: spacing.md,
  },

  evidenceTitle: {
    color: INK,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },

  evidenceSubtitle: {
    marginTop: spacing.xxs,
    color: MUTED,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  evidenceLine: {
    marginTop: spacing.md,
    color: MUTED,
    fontSize: fontSize.base,
    lineHeight: ms(22),
  },

  emptyText: {
    marginTop: spacing.md,
    color: MUTED,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  pill: {
    backgroundColor: CHIP_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SOFT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },

  pillText: {
    color: MUTED,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  createdText: {
    color: MUTED,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  footerSpace: {
    height: spacing['2xl'],
  },

  moreBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 25, 23, 0.28)',
    padding: spacing.xl,
  },

  moreCard: {
    borderRadius: radii.xl,
    backgroundColor: CHIP_BG,
    overflow: 'hidden',
  },

  moreItem: {
    minHeight: ms(52),
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SOFT,
  },

  moreItemText: {
    color: INK,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  moreItemDanger: {
    color: colors.errorDark,
  },
});
