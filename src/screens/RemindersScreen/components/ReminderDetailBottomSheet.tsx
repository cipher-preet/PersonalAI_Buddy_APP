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
  Keyboard,
  Platform,
  StyleSheet,
  Switch,
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
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

import ReminderDatePicker from './ReminderDatePicker';
import ReminderPickerPopup from './ReminderPickerPopup';
import ReminderTimePicker from './ReminderTimePicker';
import {
  ReminderItem,
  ReminderRepeat,
} from './mockReminders';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../theme';

export type ReminderDraft = {
  title: string;
  description: string;
  dateKey: string;
  dateLabel: string;
  timeLabel: string;
  repeat: ReminderRepeat;
  aiCalling: boolean;
  notification: boolean;
  beeping: boolean;
  source?: 'ai' | 'manual';
};

type Props = {
  reminder: ReminderItem | null;
  mode?: 'create' | 'edit';
  isSaving?: boolean;
  onSave?: (draft: ReminderDraft) => Promise<void> | void;
};

type IconProps = {
  color?: string;
  size?: number;
};

type PickerMode = 'none' | 'date' | 'time';

const STROKE = 1.7;

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

const BellIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4a5.5 5.5 0 0 1 5.5 5.5v3l1.2 2.2a.9.9 0 0 1-.8 1.3H6.1a.9.9 0 0 1-.8-1.3l1.2-2.2v-3A5.5 5.5 0 0 1 12 4Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <Path
      d="M10.1 19a2 2 0 0 0 3.8 0"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
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

const REPEAT_OPTIONS: ReminderRepeat[] = [
  'once',
  'daily',
  'weekly',
  'weekdays',
  'monthly',
];

const REPEAT_LABELS: Record<ReminderRepeat, string> = {
  once: 'Once',
  daily: 'Daily',
  weekly: 'Weekly',
  weekdays: 'Weekdays',
  monthly: 'Monthly',
};

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

const parseReminderDate = (reminder: ReminderItem) => {
  const base = new Date(`${reminder.dateKey}T12:00:00`);
  if (!Number.isNaN(base.getTime())) {
    return base;
  }
  return new Date();
};

const parseReminderTime = (reminder: ReminderItem) => {
  const base = parseReminderDate(reminder);
  const match = reminder.timeLabel.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour < 12) {
      hour += 12;
    }
    if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    base.setHours(hour, minute, 0, 0);
    return base;
  }

  if (/morning/i.test(reminder.timeLabel)) {
    base.setHours(8, 0, 0, 0);
    return base;
  }

  base.setHours(9, 0, 0, 0);
  return base;
};

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const formatTimeLabel = (date: Date) => {
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createDefaultTime = () => {
  const next = new Date();
  next.setMinutes(next.getMinutes() + 30, 0, 0);
  return next;
};

const formatRelativeDate = (date: Date) => {
  const todayKey = toDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (toDateKey(date) === todayKey) {
    return 'Today';
  }

  if (toDateKey(date) === toDateKey(tomorrow)) {
    return 'Tomorrow';
  }

  return formatDateLabel(date);
};

const ReminderDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ reminder, mode = 'edit', isSaving = false, onSave }, ref) => {
    const isCreateMode = mode === 'create';
    const snapPoints = useMemo(() => ['92%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<PickerMode>('none');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [nameError, setNameError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(createDefaultTime);
    const [repeat, setRepeat] = useState<ReminderRepeat>('once');
    const [aiCalling, setAiCalling] = useState(false);
    const [notification, setNotification] = useState(true);
    const [beeping, setBeeping] = useState(false);

    const resetCreateForm = useCallback(() => {
      const now = new Date();
      setName('');
      setDescription('');
      setNameError('');
      setSelectedDate(now);
      setSelectedTime(createDefaultTime());
      setRepeat('once');
      setAiCalling(false);
      setNotification(true);
      setBeeping(false);
      setPickerMode('none');
    }, []);

    useEffect(() => {
      if (isCreateMode) {
        return;
      }

      if (!reminder) {
        return;
      }

      setName(reminder.title);
      setDescription(reminder.description);
      setNameError('');
      setSelectedDate(parseReminderDate(reminder));
      setSelectedTime(parseReminderTime(reminder));
      setRepeat(reminder.repeat);
      setAiCalling(reminder.aiCalling);
      setNotification(reminder.notification);
      setBeeping(reminder.beeping);
      setPickerMode('none');
    }, [isCreateMode, reminder]);

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

    const togglePicker = (mode: PickerMode) => {
      Keyboard.dismiss();
      setPickerMode(prev => (prev === mode ? 'none' : mode));
    };

    const closePicker = () => {
      setPickerMode('none');
    };

    const handleDateChange = (date: Date) => {
      const next = new Date(selectedTime);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDate(date);
      setSelectedTime(next);
    };

    const handleTimeChange = (date: Date) => {
      const next = new Date(selectedDate);
      next.setHours(date.getHours(), date.getMinutes(), 0, 0);
      setSelectedTime(next);
    };

    const handleSave = async () => {
      if (isSaving) {
        return;
      }

      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      let hasError = false;

      if (!trimmedName) {
        setNameError('Give this reminder a name.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      Keyboard.dismiss();

      try {
        await onSave?.({
          title: trimmedName,
          description: trimmedDescription,
          dateKey: toDateKey(selectedDate),
          dateLabel: formatDateLabel(selectedDate),
          timeLabel: formatTimeLabel(selectedTime),
          repeat,
          aiCalling,
          notification,
          beeping,
        });
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
      } catch {
        // Parent surfaces the error; keep the sheet open.
      }
    };

    const hasAnyAlert = notification || beeping || aiCalling;

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
              {isCreateMode ? 'Add reminder' : 'Edit reminder'}
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

          <View style={styles.section}>
            <View
              style={[styles.fieldCard, nameError ? styles.fieldCardError : null]}
            >
              <Text style={styles.fieldLabel}>Name</Text>
              <BottomSheetTextInput
                value={name}
                onChangeText={value => {
                  setName(value);
                  if (nameError) {
                    setNameError('');
                  }
                }}
                placeholder="Take medicine, call mom..."
                placeholderTextColor={colors.muted}
                style={styles.input}
                returnKeyType="next"
              />
            </View>
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <BottomSheetTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add extra context if you need it"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.multilineInput]}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>When</Text>

            <View style={styles.scheduleCard}>
              <SheetPressable
                style={[
                  styles.scheduleRow,
                  pickerMode === 'date' && styles.scheduleRowActive,
                ]}
                onPress={() => togglePicker('date')}
                accessibilityRole="button"
                accessibilityLabel="Set reminder date"
              >
                <View style={styles.metaIcon}>
                  <CalendarIcon color={colors.primary} />
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <Text style={styles.fieldValue}>
                    {formatRelativeDate(selectedDate)}
                  </Text>
                </View>
                <ChevronIcon />
              </SheetPressable>

              <View style={styles.scheduleDivider} />

              <SheetPressable
                style={[
                  styles.scheduleRow,
                  pickerMode === 'time' && styles.scheduleRowActive,
                ]}
                onPress={() => togglePicker('time')}
                accessibilityRole="button"
                accessibilityLabel="Set reminder time"
              >
                <View style={styles.metaIcon}>
                  <ClockIcon color={colors.primary} />
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.fieldLabel}>Time</Text>
                  <Text style={styles.fieldValue}>
                    {formatTimeLabel(selectedTime)}
                  </Text>
                </View>
                <ChevronIcon />
              </SheetPressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Repeat</Text>

            <View style={styles.chipGrid}>
              {REPEAT_OPTIONS.map(option => {
                const isActive = repeat === option;

                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.85}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setRepeat(option)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {REPEAT_LABELS[option]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How Buddy should reach you</Text>

            <View style={styles.alertCard}>
              <View style={styles.alertRow}>
                <View style={[styles.featureIcon, styles.featureIconNotify]}>
                  <BellIcon color={colors.primary} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Notification</Text>
                  <Text style={styles.featureSubtitle}>
                    A banner on your phone at the scheduled time.
                  </Text>
                </View>
                <Switch
                  value={notification}
                  onValueChange={setNotification}
                  trackColor={{ false: colors.border, true: colors.brandBorder }}
                  thumbColor={notification ? colors.primary : colors.white}
                />
              </View>

              <View style={styles.alertDivider} />

              <View style={styles.alertRow}>
                <View style={[styles.featureIcon, styles.featureIconBeep]}>
                  <BeepIcon color={colors.success} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Alarm sound</Text>
                  <Text style={styles.featureSubtitle}>
                    Play a sound with the reminder so it is harder to miss.
                  </Text>
                </View>
                <Switch
                  value={beeping}
                  onValueChange={setBeeping}
                  trackColor={{ false: colors.border, true: colors.successSoft }}
                  thumbColor={beeping ? colors.success : colors.white}
                />
              </View>

              <View style={styles.alertDivider} />

              <View style={styles.alertRow}>
                <View style={[styles.featureIcon, styles.featureIconCall]}>
                  <PhoneIcon color={colors.primaryMid} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Buddy call</Text>
                  <Text style={styles.featureSubtitle}>
                    Buddy calls you and reads the reminder aloud.
                  </Text>
                </View>
                <Switch
                  value={aiCalling}
                  onValueChange={setAiCalling}
                  trackColor={{ false: colors.border, true: colors.brandBorder }}
                  thumbColor={aiCalling ? colors.primaryMid : colors.white}
                />
              </View>
            </View>

            {hasAnyAlert ? null : (
              <Text style={styles.alertWarning}>
                No alert is on. Turn on at least one so you do not miss this.
              </Text>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                {isCreateMode ? 'Save reminder' : 'Save changes'}
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <ReminderPickerPopup
        visible={pickerMode === 'time'}
        title="Set time"
        onClose={closePicker}
        onDone={closePicker}
      >
        <ReminderTimePicker
          embedded
          value={selectedTime}
          onChange={handleTimeChange}
        />
      </ReminderPickerPopup>

      <ReminderPickerPopup
        visible={pickerMode === 'date'}
        title="Select date"
        onClose={closePicker}
        onDone={closePicker}
      >
        <ReminderDatePicker
          embedded
          value={selectedDate}
          onChange={handleDateChange}
        />
      </ReminderPickerPopup>
      </>
    );
  },
);

ReminderDetailBottomSheet.displayName = 'ReminderDetailBottomSheet';

export default ReminderDetailBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
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
    marginBottom: spacing.lg,
  },

  closeButton: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheetTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  section: {
    marginBottom: spacing['2xl'],
  },

  sectionLabel: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },

  fieldCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },

  fieldCardError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },

  errorText: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    marginLeft: spacing.md,
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  fieldLabel: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },

  fieldValue: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },

  scheduleCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: ms(64),
  },

  scheduleRowActive: {
    backgroundColor: colors.primarySoft,
  },

  scheduleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(58),
  },

  metaIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(11),
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    padding: 0,
    margin: 0,
    minHeight: ms(22),
  },

  multilineInput: {
    minHeight: ms(56),
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
  },

  metaCopy: {
    flex: 1,
    minWidth: 0,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    minHeight: layout.chipHeight,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  chipTextActive: {
    color: colors.white,
  },

  alertCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  alertDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(62),
  },

  alertWarning: {
    marginTop: spacing.md,
    color: colors.warningText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(18),
  },

  featureIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureIconCall: {
    backgroundColor: colors.purpleLight,
  },

  featureIconNotify: {
    backgroundColor: colors.primarySoft,
  },

  featureIconBeep: {
    backgroundColor: colors.successSoft,
  },

  featureCopy: {
    flex: 1,
    minWidth: 0,
  },

  featureTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },

  featureSubtitle: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },

  saveButton: {
    minHeight: layout.buttonHeight,
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  saveButtonDisabled: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
