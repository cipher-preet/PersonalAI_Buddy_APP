import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BackHandler,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Pressable as SheetPressable } from 'react-native-gesture-handler';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import ReminderDatePicker from '../../RemindersScreen/components/ReminderDatePicker';
import ReminderPickerPopup from '../../RemindersScreen/components/ReminderPickerPopup';
import ReminderTimePicker from '../../RemindersScreen/components/ReminderTimePicker';
import type {
  CalendarEventCard,
  CalendarEventWritePayload,
} from '../../../store/api/calendar';
import {
  createDefaultEnd,
  createDefaultStart,
  formatDateLabel,
  formatTimeLabel,
  parseTimeLabelToDate,
  toDateKey,
} from '../calendarUtils';
import {
  SheetPrimaryButton,
  SheetSegmentedControl,
  SheetTextField,
  SheetToggleRow,
  sheetFormStyles,
} from '../../../components/sheet/SheetFormControls';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

export type EventDraft = CalendarEventWritePayload;

type Props = {
  event: CalendarEventCard | null;
  mode?: 'create' | 'edit';
  initialDate?: Date;
  isSaving?: boolean;
  onSave?: (draft: EventDraft) => Promise<void> | void;
  onDelete?: () => void;
};

type IconProps = {
  color?: string;
  size?: number;
};

type PickerMode = 'none' | 'date' | 'start' | 'end';
type RemindBeforeMode = 'atStart' | '5' | '10' | 'custom';

const STROKE = 1.7;

const REMIND_BEFORE_OPTIONS: { id: RemindBeforeMode; label: string }[] = [
  { id: 'atStart', label: 'At start' },
  { id: '5', label: '5 min' },
  { id: '10', label: '10 min' },
  { id: 'custom', label: 'Custom' },
];

const CalendarIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3.5}
      y={5.5}
      width={17}
      height={15}
      rx={2.5}
      stroke={color}
      strokeWidth={STROKE}
    />
    <Path
      d="M8 3.5v3M16 3.5v3M3.5 10h17"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const ClockIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={STROKE} />
    <Path
      d="M12 8v4.5l3 2"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = ({ color = colors.muted, size = ms(16) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 18 6-6-6-6"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.2 2 2 0 0 1 4.11 1h2.2a2 2 0 0 1 2 1.72c.13.96.35 1.9.67 2.8a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.32 1.84.54 2.8.67A2 2 0 0 1 22 16.92Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BeepIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 5 6 9H3v6h3l5 4V5Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <Path
      d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
  </Svg>
);

const CloseIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={colors.subText}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const EventBottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    { event, mode = 'create', initialDate, isSaving = false, onSave, onDelete },
    ref,
  ) => {
    const isCreateMode = mode === 'create';
    const snapPoints = useMemo(() => ['92%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<PickerMode>('none');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [titleError, setTitleError] = useState('');
    const [timeError, setTimeError] = useState('');
    const [selectedDate, setSelectedDate] = useState(
      () => initialDate || new Date(),
    );
    const [startTime, setStartTime] = useState(() =>
      createDefaultStart(initialDate || new Date()),
    );
    const [endTime, setEndTime] = useState(() =>
      createDefaultEnd(createDefaultStart(initialDate || new Date())),
    );
    const [aiCalling, setAiCalling] = useState(false);
    const [beeping, setBeeping] = useState(true);
    const [customBeforeText, setCustomBeforeText] = useState('15');
    const [remindBeforeMode, setRemindBeforeMode] =
      useState<RemindBeforeMode>('5');

    const resetCreateForm = useCallback(() => {
      const baseDate = initialDate || new Date();
      const start = createDefaultStart(baseDate);
      setTitle('');
      setDescription('');
      setLocation('');
      setTitleError('');
      setTimeError('');
      setSelectedDate(baseDate);
      setStartTime(start);
      setEndTime(createDefaultEnd(start));
      setAiCalling(false);
      setBeeping(true);
      setCustomBeforeText('15');
      setRemindBeforeMode('5');
      setPickerMode('none');
    }, [initialDate]);

    useEffect(() => {
      if (isCreateMode) {
        return;
      }

      if (!event) {
        return;
      }

      setTitle(event.title);
      setDescription(event.description);
      setLocation(event.location);
      setTitleError('');
      setTimeError('');
      setSelectedDate(new Date(`${event.dateKey}T12:00:00`));
      setStartTime(parseTimeLabelToDate(event.dateKey, event.startTimeLabel));
      setEndTime(parseTimeLabelToDate(event.dateKey, event.endTimeLabel));
      setAiCalling(event.aiCalling);
      setBeeping(
        event.aiReminder
          ? event.beeping || (!event.aiCalling && event.notification)
          : true,
      );
      const before = event.aiReminder
        ? Math.max(0, Number(event.remindBeforeMinutes) || 0)
        : 5;
      if (before === 0) {
        setRemindBeforeMode('atStart');
      } else if (before === 5) {
        setRemindBeforeMode('5');
      } else if (before === 10) {
        setRemindBeforeMode('10');
      } else {
        setRemindBeforeMode('custom');
        setCustomBeforeText(String(before));
      }
      setPickerMode('none');
    }, [event, isCreateMode]);

    const handleClose = useCallback(() => {
      if (isSaving) {
        return;
      }

      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [isSaving, ref]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={isSaving ? 'none' : 'close'}
          opacity={0.45}
        />
      ),
      [isSaving],
    );

    useEffect(() => {
      if (!isSheetOpen) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (pickerMode !== 'none') {
            setPickerMode('none');
            return true;
          }
          handleClose();
          return true;
        },
      );

      return () => subscription.remove();
    }, [handleClose, isSheetOpen, pickerMode]);

    const togglePicker = (next: PickerMode) => {
      Keyboard.dismiss();
      setPickerMode(prev => (prev === next ? 'none' : next));
    };

    const closePicker = () => {
      setPickerMode('none');
    };

    const applyDateToTimes = (date: Date) => {
      const nextStart = new Date(startTime);
      nextStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      const nextEnd = new Date(endTime);
      nextEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(date);
      setStartTime(nextStart);
      setEndTime(nextEnd);
    };

    const handleStartChange = (date: Date) => {
      const next = new Date(selectedDate);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setStartTime(next);
      if (next.getTime() >= endTime.getTime()) {
        setEndTime(createDefaultEnd(next));
      }
      setTimeError('');
    };

    const handleEndChange = (date: Date) => {
      const next = new Date(selectedDate);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setEndTime(next);
      setTimeError('');
    };

    const applyRemindBeforeMode = (mode: RemindBeforeMode) => {
      setRemindBeforeMode(mode);
      setTimeError('');
    };

    const effectiveBeeping = beeping || !aiCalling;
    const aiReminder = aiCalling || effectiveBeeping;

    const resolvedRemindBeforeMinutes = (() => {
      if (remindBeforeMode === 'atStart') {
        return 0;
      }
      if (remindBeforeMode === '5') {
        return 5;
      }
      if (remindBeforeMode === '10') {
        return 10;
      }
      const parsed = Number.parseInt(customBeforeText, 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return 15;
      }
      return Math.min(1440, parsed);
    })();

    const handleSave = async () => {
      if (isSaving) {
        return;
      }

      const trimmedTitle = title.trim();
      let hasError = false;

      if (!trimmedTitle) {
        setTitleError('Enter a meeting title.');
        hasError = true;
      }

      if (endTime.getTime() <= startTime.getTime()) {
        setTimeError('End time must be after the start time.');
        hasError = true;
      }

      if (
        remindBeforeMode === 'custom' &&
        (!Number.isFinite(Number.parseInt(customBeforeText, 10)) ||
          Number.parseInt(customBeforeText, 10) < 1)
      ) {
        setTimeError('Enter custom minutes between 1 and 1440.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      Keyboard.dismiss();

      try {
        await onSave?.({
          title: trimmedTitle,
          description: description.trim(),
          location: location.trim(),
          dateKey: toDateKey(selectedDate),
          dateLabel: formatDateLabel(selectedDate),
          startTimeLabel: formatTimeLabel(startTime),
          endTimeLabel: formatTimeLabel(endTime),
          aiReminder,
          aiCalling,
          notification: false,
          beeping: effectiveBeeping,
          remindBeforeMinutes: resolvedRemindBeforeMinutes,
        });
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
      } catch {
        // Parent surfaces the error; keep the sheet open.
      }
    };

    return (
      <>
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={!isSaving && pickerMode === 'none'}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.indicator}
          animateOnMount
          onChange={index => {
            const open = index >= 0;
            if (open && !isSheetOpen && isCreateMode) {
              resetCreateForm();
            }
            setIsSheetOpen(open);
            if (index < 0) {
              setPickerMode('none');
            }
          }}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerRow}>
              <Text style={styles.sheetTitle}>
                {isCreateMode ? 'Add event' : 'Event details'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.75}
                disabled={isSaving}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <CloseIcon />
              </TouchableOpacity>
            </View>

            <View style={sheetFormStyles.section}>
              <SheetTextField
                label="Title"
                value={title}
                onChangeText={value => {
                  setTitle(value);
                  if (titleError) {
                    setTitleError('');
                  }
                }}
                placeholder="Product review, standup…"
                error={titleError}
                returnKeyType="next"
                containerStyle={styles.fieldSpacing}
              />

              <SheetTextField
                label="Description"
                value={description}
                onChangeText={setDescription}
                placeholder="Agenda, notes, or context"
                multiline
                containerStyle={styles.fieldSpacing}
              />

              <SheetTextField
                label="Location"
                value={location}
                onChangeText={setLocation}
                placeholder="Office, Zoom, or leave blank"
                returnKeyType="done"
                containerStyle={styles.fieldSpacingLast}
              />
            </View>

            <View style={sheetFormStyles.section}>
              <Text style={sheetFormStyles.sectionTitle}>Schedule</Text>

              <View style={sheetFormStyles.groupCard}>
                <SheetPressable
                  style={[
                    styles.scheduleRow,
                    pickerMode === 'date' && styles.scheduleRowActive,
                  ]}
                  onPress={() => togglePicker('date')}
                  accessibilityRole="button"
                  accessibilityLabel="Set event date"
                >
                  <View style={styles.metaIcon}>
                    <CalendarIcon />
                  </View>
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaValue}>
                      {formatDateLabel(selectedDate)}
                    </Text>
                  </View>
                  <ChevronIcon />
                </SheetPressable>

                <View style={sheetFormStyles.groupDivider} />

                <SheetPressable
                  style={[
                    styles.scheduleRow,
                    pickerMode === 'start' && styles.scheduleRowActive,
                  ]}
                  onPress={() => togglePicker('start')}
                  accessibilityRole="button"
                  accessibilityLabel="Set start time"
                >
                  <View style={styles.metaIcon}>
                    <ClockIcon />
                  </View>
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Starts</Text>
                    <Text style={styles.metaValue}>
                      {formatTimeLabel(startTime)}
                    </Text>
                  </View>
                  <ChevronIcon />
                </SheetPressable>

                <View style={sheetFormStyles.groupDivider} />

                <SheetPressable
                  style={[
                    styles.scheduleRow,
                    pickerMode === 'end' && styles.scheduleRowActive,
                  ]}
                  onPress={() => togglePicker('end')}
                  accessibilityRole="button"
                  accessibilityLabel="Set end time"
                >
                  <View style={[styles.metaIcon, styles.metaIconAlt]}>
                    <ClockIcon color={colors.primaryPurple} />
                  </View>
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Ends</Text>
                    <Text style={styles.metaValue}>
                      {formatTimeLabel(endTime)}
                    </Text>
                  </View>
                  <ChevronIcon />
                </SheetPressable>
              </View>
              {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}
            </View>

            <View style={sheetFormStyles.section}>
              <SheetSegmentedControl
                label="Remind before"
                options={REMIND_BEFORE_OPTIONS}
                value={remindBeforeMode}
                onChange={applyRemindBeforeMode}
              />
              {remindBeforeMode === 'custom' ? (
                <View style={styles.customBeforeRow}>
                  <SheetTextField
                    label="Minutes"
                    value={customBeforeText}
                    onChangeText={value => {
                      const digits = value.replace(/[^0-9]/g, '').slice(0, 4);
                      setCustomBeforeText(digits);
                    }}
                    keyboardType="number-pad"
                    placeholder="15"
                    containerStyle={styles.customBeforeField}
                  />
                  <Text style={styles.customBeforeSuffix}>before start</Text>
                </View>
              ) : null}
            </View>

            <View style={sheetFormStyles.section}>
              <Text style={sheetFormStyles.sectionTitle}>
                How Buddy should reach you
              </Text>

              <View style={sheetFormStyles.toggleStack}>
                <SheetToggleRow
                  title="Alarm sound"
                  subtitle="Alarm-style sound with the alert"
                  value={beeping}
                  onValueChange={setBeeping}
                  icon={<BeepIcon color={colors.success} />}
                  iconTone="success"
                />
                <SheetToggleRow
                  title="Buddy call"
                  subtitle="Buddy can call you for this meeting"
                  value={aiCalling}
                  onValueChange={setAiCalling}
                  icon={<PhoneIcon color={colors.primary} />}
                  iconTone="brand"
                />
              </View>
            </View>

            <SheetPrimaryButton
              label={isCreateMode ? 'Save event' : 'Save changes'}
              onPress={handleSave}
              loading={isSaving}
            />

            {!isCreateMode && onDelete ? (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.deleteButton}
                onPress={onDelete}
                disabled={isSaving}
              >
                <Text style={styles.deleteButtonText}>Delete event</Text>
              </TouchableOpacity>
            ) : null}
          </BottomSheetScrollView>
        </BottomSheetModal>

        <ReminderPickerPopup
          visible={pickerMode === 'date'}
          title="Select date"
          onClose={closePicker}
          onDone={closePicker}
        >
          <ReminderDatePicker
            embedded
            value={selectedDate}
            onChange={applyDateToTimes}
          />
        </ReminderPickerPopup>

        <ReminderPickerPopup
          visible={pickerMode === 'start'}
          title="Start time"
          onClose={closePicker}
          onDone={closePicker}
        >
          <ReminderTimePicker
            embedded
            value={startTime}
            onChange={handleStartChange}
          />
        </ReminderPickerPopup>

        <ReminderPickerPopup
          visible={pickerMode === 'end'}
          title="End time"
          onClose={closePicker}
          onDone={closePicker}
        >
          <ReminderTimePicker
            embedded
            value={endTime}
            onChange={handleEndChange}
          />
        </ReminderPickerPopup>
      </>
    );
  },
);

EventBottomSheet.displayName = 'EventBottomSheet';

export default EventBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(28),
    borderTopRightRadius: ms(28),
  },
  indicator: {
    backgroundColor: colors.border,
    width: ms(44),
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
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  fieldSpacing: {
    marginBottom: spacing.md,
  },
  fieldSpacingLast: {
    marginBottom: 0,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: ms(52),
  },
  scheduleRowActive: {
    backgroundColor: colors.primarySoft,
  },
  metaIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaIconAlt: {
    backgroundColor: colors.purpleLight,
  },
  metaCopy: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  metaValue: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  errorText: {
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  customBeforeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  customBeforeField: {
    flex: 1,
    marginBottom: 0,
  },
  customBeforeSuffix: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    paddingBottom: spacing.lg,
  },
  deleteButton: {
    minHeight: ms(48),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
