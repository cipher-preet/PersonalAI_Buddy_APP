import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
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
import Svg, { Path } from 'react-native-svg';

import type {
  StagedNoteCard,
  StagedTaskCard,
} from '../../../store/api/home';
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
  spaceName: string;
  tasks: StagedTaskCard[];
  notes: StagedNoteCard[];
  summary: string;
  isSharing?: boolean;
  onChangeSummary: (value: string) => void;
  onShare: () => void;
};

const ShareIcon = () => (
  <Svg width={ms(17)} height={ms(17)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 14.5v4A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5v-4"
      stroke={colors.white}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SparkleIcon = () => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3.8c.7 4.1 2.4 5.8 6.5 6.5-4.1.7-5.8 2.4-6.5 6.5-.7-4.1-2.4-5.8-6.5-6.5C9.6 9.6 11.3 7.9 12 3.8Z"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
  </Svg>
);

const SharePreviewBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    { spaceName, tasks, notes, summary, isSharing, onChangeSummary, onShare },
    ref,
  ) => {
    const snapPoints = useMemo(() => ['72%', '92%'], []);
    const [isOpen, setIsOpen] = useState(false);

    const closeSheet = useCallback(() => {
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
          opacity={0.42}
          pressBehavior="close"
        />
      ),
      [],
    );

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

    const total = tasks.length + notes.length;

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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        onChange={index => setIsOpen(index >= 0)}
        onDismiss={() => setIsOpen(false)}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.topRow}>
            <View style={styles.previewBadge}>
              <SparkleIcon />
              <Text style={styles.previewBadgeText}>SHARE PREVIEW</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.75}
              onPress={closeSheet}
              accessibilityRole="button"
              accessibilityLabel="Close preview"
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetTitle}>Ready to share</Text>
          <Text style={styles.sheetSubtitle}>
            Review the selected content before opening the share menu.
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.cardHeader}>
              <View style={styles.buddyMark}>
                <SparkleIcon />
              </View>
              <View style={styles.cardHeaderCopy}>
                <Text style={styles.spaceName}>{spaceName}</Text>
                <Text style={styles.workspaceLabel}>BUDDY UPDATE</Text>
              </View>
              <View style={styles.totalPill}>
                <Text style={styles.totalPillText}>{total} selected</Text>
              </View>
            </View>

            <Text style={styles.summaryLabel}>SUMMARY · OPTIONAL</Text>
            <BottomSheetTextInput
              value={summary}
              onChangeText={onChangeSummary}
              placeholder="Add a short message for the recipient..."
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              style={styles.summaryInput}
            />

            {tasks.length ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tasks</Text>
                  <Text style={styles.sectionCount}>{tasks.length} selected</Text>
                </View>
                {tasks.map(task => (
                  <View key={task.id} style={styles.previewRow}>
                    <View style={styles.taskDot} />
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{task.title}</Text>
                      {task.dueDate ? (
                        <Text style={styles.rowDetail}>{task.dueDate}</Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {notes.length ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Notes</Text>
                  <Text style={styles.sectionCount}>{notes.length} selected</Text>
                </View>
                {notes.map(note => (
                  <View key={note.id} style={styles.previewRow}>
                    <View style={styles.noteDot} />
                    <View style={styles.rowCopy}>
                      <Text style={styles.rowTitle}>{note.title}</Text>
                      {note.bodyPreview ? (
                        <Text numberOfLines={2} style={styles.rowDetail}>
                          {note.bodyPreview}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isSharing}
            style={[styles.shareButton, isSharing && styles.shareButtonBusy]}
            onPress={onShare}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? 'Opening share menu' : 'Share update'}
            </Text>
            {isSharing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <ShareIcon />
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

SharePreviewBottomSheet.displayName = 'SharePreviewBottomSheet';

export default SharePreviewBottomSheet;

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
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
  },
  previewBadgeText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
  },
  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },
  closeIcon: {
    color: colors.muted,
    fontSize: fontSize['2xl'] + ms(4),
    lineHeight: ms(24),
    marginTop: -1,
  },
  sheetTitle: {
    marginTop: spacing.xl,
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },
  sheetSubtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  previewCard: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii['2xl'],
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  buddyMark: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  cardHeaderCopy: {
    flex: 1,
    marginLeft: spacing.md,
  },
  spaceName: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  workspaceLabel: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
  },
  totalPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  totalPillText: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  summaryLabel: {
    marginBottom: spacing.sm,
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
  },
  summaryInput: {
    minHeight: mvs(76),
    padding: spacing.md,
    borderRadius: radii.lg,
    color: colors.text,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(19),
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  previewRow: {
    minHeight: ms(52),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  taskDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    marginRight: spacing.md,
    backgroundColor: colors.success,
  },
  noteDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    marginRight: spacing.md,
    backgroundColor: colors.primaryPurple,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  rowDetail: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(17),
  },
  shareButton: {
    minHeight: ms(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
  },
  shareButtonBusy: {
    opacity: 0.7,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
