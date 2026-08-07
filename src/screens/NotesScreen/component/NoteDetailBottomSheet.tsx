import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
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
import { NoteItem } from '../types/note';
import { COLORS } from './styles/color';
import { StagedNoteDetail } from '../../../store/api/home';
import {
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  note: NoteItem | null;
  detail: StagedNoteDetail | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

type IconProps = {
  size?: number;
  color?: string;
};

const EvidenceIcon = ({
  size = ms(18),
  color = COLORS.primaryDark,
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

const EyeIcon = ({
  size = ms(14),
  color = COLORS.primaryDark,
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = ({ size = ms(14), color = COLORS.white }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m3 3 18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.3A10.7 10.7 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-2.3 3.2M6.6 6.9C3.9 8.7 2.5 12 2.5 12s3.5 7 9.5 7c1.5 0 2.8-.4 4-.9"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronDownIcon = ({
  size = ms(16),
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

const NoteDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ note, detail, isLoading, isError, onRetry }, ref) => {
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
    }, [note?.id]);

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

    if (!note) {
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

    const currentDetail = detail?.id === note.id ? detail : null;
    const title = currentDetail?.title || note.title;
    const body = currentDetail?.body || note.body;
    const evidence = currentDetail?.evidence;
    const evidenceItems = Array.isArray(evidence)
      ? evidence
      : evidence
        ? [evidence]
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
            <View style={styles.tag}>
              <Text style={styles.tagText}>{note.tag}</Text>
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

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.meta}>
            Updated {note.updatedAt} · {note.time}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{note.workspace}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>{note.readTime}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipText}>Created {note.createdAt}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator size="small" color={COLORS.primaryDark} />
              <Text style={styles.stateText}>Loading note details...</Text>
            </View>
          ) : isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.errorTitle}>Unable to load note</Text>
              <Text style={styles.stateText}>
                Please check your connection and try again.
              </Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.retryButton}
                onPress={onRetry}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Full note</Text>
                <Text style={styles.bodyText}>
                  {body || 'No note body available.'}
                </Text>
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
                    {isEvidenceOpen ? (
                      <EyeOffIcon size={14} color={COLORS.white} />
                    ) : (
                      <EyeIcon size={14} color={COLORS.primaryDark} />
                    )}
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
                        color={
                          isEvidenceOpen ? COLORS.white : COLORS.primaryDark
                        }
                      />
                    </Animated.View>
                  </View>
                </TouchableOpacity>

                {isEvidenceOpen ? (
                  evidenceTexts.length > 0 ? (
                    evidenceTexts.map((item, index) => (
                      <View key={`${item}-${index}`} style={styles.evidenceCard}>
                        <View style={styles.evidenceIndex}>
                          <Text style={styles.evidenceIndexText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={styles.evidenceText}>{item}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No evidence available.</Text>
                  )
                ) : null}
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsRow}>
              {note.tags.map(tag => (
                <View key={tag} style={styles.pill}>
                  <Text style={styles.pillText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footerSpace} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

NoteDetailBottomSheet.displayName = 'NoteDetailBottomSheet';

export default NoteDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },

  indicator: {
    backgroundColor: COLORS.border,
    width: ms(48),
    height: ms(5),
    borderRadius: radii.pill,
  },

  scrollContent: {
    paddingHorizontal: ms(22),
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? mvs(40) : mvs(32),
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ms(14),
  },

  tag: {
    backgroundColor: COLORS.purpleLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(5),
    borderRadius: ms(8),
  },

  tagText: {
    color: COLORS.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeIcon: {
    fontSize: fontSize['2xl'] + ms(4),
    lineHeight: ms(24),
    color: COLORS.muted,
    marginTop: -1,
  },

  title: {
    fontSize: fontSize['2xl'] + ms(4),
    fontWeight: fontWeight.extrabold,
    color: COLORS.black,
    lineHeight: ms(30),
    letterSpacing: -0.3,
  },

  meta: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: COLORS.gray,
  },

  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },

  infoChip: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  infoChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: COLORS.subText,
  },

  summaryCard: {
    backgroundColor: COLORS.purpleLight,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    marginBottom: spacing['3xl'],
    borderWidth: 1,
    borderColor: COLORS.borderFocus,
  },

  section: {
    marginBottom: spacing['3xl'],
  },

  sectionLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: COLORS.black,
    marginBottom: spacing.lg,
    letterSpacing: 0.2,
  },

  summaryText: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.medium,
  },

  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },

  bullet: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: COLORS.primary,
    marginTop: spacing.md,
    marginRight: spacing.lg,
  },

  highlightText: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.medium,
  },

  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: ms(14),
    padding: ms(14),
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },

  detailTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: COLORS.black,
    marginBottom: spacing.sm,
  },

  detailText: {
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.regular,
  },

  bodyText: {
    fontSize: fontSize.lg,
    lineHeight: ms(24),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.regular,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    backgroundColor: COLORS.inputBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  actionCheck: {
    width: ms(16),
    height: ms(16),
    borderRadius: ms(5),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginRight: spacing.lg,
    marginTop: spacing.xxs,
  },

  actionText: {
    flex: 1,
    fontSize: fontSize.base,
    lineHeight: ms(20),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.medium,
  },

  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: COLORS.lightGray,
    borderRadius: radii.sm,
  },

  relatedDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: COLORS.primaryDark,
    marginRight: spacing.lg,
  },

  relatedText: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: COLORS.textSecondary,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  pill: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },

  pillText: {
    color: COLORS.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  footerSpace: {
    height: spacing['2xl'],
  },

  stateBox: {
    minHeight: mvs(180),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(18),
    marginTop: spacing['2xl'],
    marginBottom: spacing['3xl'],
    borderRadius: radii.lg,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  stateText: {
    marginTop: spacing.md,
    color: COLORS.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
    lineHeight: ms(18),
  },

  errorTitle: {
    color: COLORS.errorDark,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },

  retryButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: COLORS.purpleLight,
  },

  retryText: {
    color: COLORS.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  evidenceHeader: {
    minHeight: mvs(66),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: ms(11),
    borderRadius: ms(14),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderFocus,
    shadowColor: COLORS.shadow,
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
    paddingRight: spacing.xl,
  },

  evidenceIconWrap: {
    width: ms(38),
    height: ms(38),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: ms(11),
    backgroundColor: COLORS.purpleLight,
  },

  evidenceCopy: {
    flex: 1,
  },

  evidenceTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    color: COLORS.black,
  },

  evidenceSubtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: COLORS.subText,
  },

  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(7),
    borderRadius: radii.pill,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },

  evidenceToggleOpen: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },

  evidenceToggleText: {
    color: COLORS.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
  },

  evidenceToggleTextOpen: {
    color: COLORS.white,
  },

  chevron: {
    color: COLORS.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(14),
  },

  chevronOpen: {
    color: COLORS.white,
  },

  evidenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: ms(14),
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  evidenceIndex: {
    width: ms(24),
    height: ms(24),
    borderRadius: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    backgroundColor: COLORS.primaryLight,
  },

  evidenceIndexText: {
    color: COLORS.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },

  evidenceText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: ms(20),
    color: COLORS.textSecondary,
    fontWeight: fontWeight.medium,
  },

  emptyText: {
    fontSize: fontSize.md,
    lineHeight: ms(20),
    color: COLORS.gray,
    fontWeight: fontWeight.semibold,
  },
});
