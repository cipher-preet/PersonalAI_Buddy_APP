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
  LayoutAnimation,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';

import ReminderDatePicker from '../../RemindersScreen/components/ReminderDatePicker';
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

const STROKE = 1.7;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PICKER_TRANSITION = {
  duration: 240,
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
};

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

const PinIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={10} r={2.2} stroke={color} strokeWidth={STROKE} />
  </Svg>
);

const SparkIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3v4M12 17v4M4.2 6.2l2.8 2.8M17 15l2.8 2.8M3 12h4M17 12h4M4.2 17.8 7 15M17 9l2.8-2.8"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={12} r={2.4} stroke={color} strokeWidth={STROKE} />
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
    const [aiReminder, setAiReminder] = useState(false);
    const [aiCalling, setAiCalling] = useState(false);
    const [notification, setNotification] = useState(true);
    const [beeping, setBeeping] = useState(false);

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
      setAiReminder(false);
      setAiCalling(false);
      setNotification(true);
      setBeeping(false);
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
      setAiReminder(event.aiReminder);
      setAiCalling(event.aiCalling);
      setNotification(event.notification);
      setBeeping(event.beeping);
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
            LayoutAnimation.configureNext(PICKER_TRANSITION);
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
      LayoutAnimation.configureNext(PICKER_TRANSITION);
      setPickerMode(prev => (prev === next ? 'none' : next));
    };

    const closePicker = () => {
      LayoutAnimation.configureNext(PICKER_TRANSITION);
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

    const handleAiReminderToggle = (value: boolean) => {
      LayoutAnimation.configureNext(PICKER_TRANSITION);
      setAiReminder(value);
      if (value) {
        setNotification(true);
      }
    };

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
          aiCalling: aiReminder ? aiCalling : false,
          notification: aiReminder ? notification : true,
          beeping: aiReminder ? beeping : false,
        });
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
      } catch {
        // Parent surfaces the error; keep the sheet open.
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={!isSaving}
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
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>
                {isCreateMode ? 'New event' : 'Meeting'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              disabled={isSaving}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetTitle}>
            {isCreateMode ? 'Add event' : 'Event details'}
          </Text>
          <Text style={styles.sheetHint}>
            {isCreateMode
              ? 'Schedule a meeting and optionally let Buddy remind you.'
              : 'Update the schedule, location, or AI reminder for this meeting.'}
          </Text>

          <View style={styles.section}>
            <View
              style={[styles.fieldCard, titleError ? styles.fieldCardError : null]}
            >
              <Text style={styles.fieldLabel}>Title</Text>
              <BottomSheetTextInput
                value={title}
                onChangeText={value => {
                  setTitle(value);
                  if (titleError) {
                    setTitleError('');
                  }
                }}
                placeholder="Product review, standup…"
                placeholderTextColor={colors.muted}
                style={styles.input}
                returnKeyType="next"
              />
            </View>
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Description</Text>
              <BottomSheetTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Agenda, notes, or context"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.multilineInput]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.fieldCard}>
              <View style={styles.inlineLabelRow}>
                <PinIcon size={ms(15)} />
                <Text style={styles.fieldLabelInline}>Location</Text>
              </View>
              <BottomSheetTextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Office, Zoom, or leave blank"
                placeholderTextColor={colors.muted}
                style={styles.input}
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={[
                styles.fieldCard,
                styles.metaRowCard,
                pickerMode === 'date' && styles.metaCardActive,
              ]}
              onPress={() => togglePicker('date')}
            >
              <View style={styles.metaIcon}>
                <CalendarIcon />
              </View>
              <View style={styles.metaCopy}>
                <Text style={styles.fieldLabel}>Date</Text>
                <Text style={styles.fieldValue}>
                  {formatDateLabel(selectedDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.metaRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.fieldCard,
                  styles.metaCard,
                  pickerMode === 'start' && styles.metaCardActive,
                ]}
                onPress={() => togglePicker('start')}
              >
                <View style={styles.metaIcon}>
                  <ClockIcon />
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.fieldLabel}>Starts</Text>
                  <Text style={styles.fieldValue}>
                    {formatTimeLabel(startTime)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.fieldCard,
                  styles.metaCard,
                  pickerMode === 'end' && styles.metaCardActive,
                ]}
                onPress={() => togglePicker('end')}
              >
                <View style={styles.metaIcon}>
                  <ClockIcon color={colors.primaryPurple} />
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.fieldLabel}>Ends</Text>
                  <Text style={styles.fieldValue}>
                    {formatTimeLabel(endTime)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {timeError ? <Text style={styles.errorText}>{timeError}</Text> : null}

            {pickerMode === 'date' ? (
              <ReminderDatePicker
                value={selectedDate}
                onChange={applyDateToTimes}
                onComplete={closePicker}
              />
            ) : null}

            {pickerMode === 'start' ? (
              <ReminderTimePicker
                value={startTime}
                onChange={handleStartChange}
                onComplete={closePicker}
              />
            ) : null}

            {pickerMode === 'end' ? (
              <ReminderTimePicker
                value={endTime}
                onChange={handleEndChange}
                onComplete={closePicker}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, styles.featureIconAi]}>
                  <SparkIcon color={colors.primaryMid} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>AI reminder</Text>
                  <Text style={styles.featureSubtitle}>
                    Buddy will remind you when this meeting starts
                  </Text>
                </View>
              </View>
              <Switch
                value={aiReminder}
                onValueChange={handleAiReminderToggle}
                trackColor={{ false: colors.border, true: colors.brandBorder }}
                thumbColor={aiReminder ? colors.primaryMid : colors.white}
              />
            </View>

            {aiReminder ? (
              <>
                <View style={styles.featureCard}>
                  <View style={styles.featureLeft}>
                    <View style={[styles.featureIcon, styles.featureIconCall]}>
                      <PhoneIcon color={colors.primaryPurple} />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>AI calling</Text>
                      <Text style={styles.featureSubtitle}>
                        Buddy can call you for this meeting
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={aiCalling}
                    onValueChange={setAiCalling}
                    trackColor={{
                      false: colors.border,
                      true: colors.brandBorder,
                    }}
                    thumbColor={aiCalling ? colors.primaryPurple : colors.white}
                  />
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureLeft}>
                    <View style={[styles.featureIcon, styles.featureIconNotify]}>
                      <BellIcon color={colors.info} />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>Notification</Text>
                      <Text style={styles.featureSubtitle}>
                        Push alert at the start time
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notification}
                    onValueChange={setNotification}
                    trackColor={{
                      false: colors.border,
                      true: colors.brandBorder,
                    }}
                    thumbColor={notification ? colors.info : colors.white}
                  />
                </View>

                <View style={styles.featureCard}>
                  <View style={styles.featureLeft}>
                    <View style={[styles.featureIcon, styles.featureIconBeep]}>
                      <BeepIcon color={colors.success} />
                    </View>
                    <View style={styles.featureCopy}>
                      <Text style={styles.featureTitle}>Beeping</Text>
                      <Text style={styles.featureSubtitle}>
                        Gentle sound cue with the alert
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={beeping}
                    onValueChange={setBeeping}
                    trackColor={{
                      false: colors.border,
                      true: colors.successSoft,
                    }}
                    thumbColor={beeping ? colors.success : colors.white}
                  />
                </View>
              </>
            ) : null}
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
                {isCreateMode ? 'Save event' : 'Save changes'}
              </Text>
            )}
          </TouchableOpacity>

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
  sourceBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.lg,
    paddingVertical: ms(5),
    borderRadius: ms(8),
  },
  sourceText: {
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
  sheetTitle: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },
  sheetHint: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  section: {
    marginBottom: spacing.xl,
  },
  fieldCard: {
    backgroundColor: colors.inputBg,
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
  fieldLabelInline: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.2,
  },
  inlineLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
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
    minHeight: ms(68),
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metaRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  metaCardActive: {
    borderColor: colors.brandBorder,
    backgroundColor: colors.primarySoft,
  },
  metaIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(10),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  metaCopy: {
    flex: 1,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.inputBg,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  featureLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginRight: spacing.md,
  },
  featureIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconAi: {
    backgroundColor: colors.primarySoft,
  },
  featureIconCall: {
    backgroundColor: colors.purpleLight,
  },
  featureIconNotify: {
    backgroundColor: colors.primaryLight,
  },
  featureIconBeep: {
    backgroundColor: colors.successSoft,
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  featureSubtitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: ms(16),
  },
  saveButton: {
    minHeight: ms(52),
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
  deleteButton: {
    minHeight: ms(48),
    borderRadius: radii.xl,
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
