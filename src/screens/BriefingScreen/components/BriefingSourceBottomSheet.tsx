import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
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
} from '@gorhom/bottom-sheet';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';
import type { InsightItem } from './mockBriefing';

type Props = {
  insight: InsightItem | null;
};

const SparkleIcon = ({
  color = colors.primary,
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const BriefingSourceBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ insight }, ref) => {
    const snapPoints = useMemo(() => ['62%', '84%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
          opacity={0.42}
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

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
        onDismiss={() => setIsSheetOpen(false)}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerRow}>
            <View style={styles.sourceBadge}>
              <SparkleIcon size={14} />
              <Text style={styles.sourceBadgeText}>SOURCE</Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close source"
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          {insight ? (
            <>
              <Text style={styles.title}>{insight.title}</Text>
              <Text style={styles.summary}>{insight.body}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{insight.sourceType}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{insight.capturedAt}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{insight.space}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Original capture</Text>
                <View style={styles.quoteCard}>
                  <Text style={styles.quoteText}>{insight.excerpt}</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Why it matters</Text>
                <Text style={styles.sectionBody}>{insight.whyItMatters}</Text>
              </View>

              {insight.tags.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Tags</Text>
                  <View style={styles.tagsRow}>
                    {insight.tags.map(tag => (
                      <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.primaryButton}
                onPress={handleClose}
              >
                <Text style={styles.primaryButtonText}>Got it</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No source selected</Text>
              <Text style={styles.emptyBody}>
                Choose an insight to view what Buddy captured.
              </Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

BriefingSourceBottomSheet.displayName = 'BriefingSourceBottomSheet';

export default BriefingSourceBottomSheet;

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
  content: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? mvs(36) : mvs(28),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  sourceBadgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
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
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
    lineHeight: ms(28),
  },
  summary: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  metaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  metaChipText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  quoteCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    padding: spacing.xl,
  },
  quoteText: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },
  sectionBody: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
  },
  tagText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  primaryButton: {
    minHeight: ms(50),
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    minHeight: mvs(160),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyBody: {
    marginTop: spacing.sm,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});
