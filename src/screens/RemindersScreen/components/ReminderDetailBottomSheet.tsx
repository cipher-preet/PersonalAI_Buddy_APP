import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  BackHandler,
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

import ReminderDatePicker from './ReminderDatePicker';
import ReminderTimePicker from './ReminderTimePicker';
import {
  REPEAT_LABELS,
  ReminderItem,
  ReminderRepeat,
} from './mockReminders';
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
  reminder: ReminderItem | null;
};

type IconProps = {
  color?: string;
  size?: number;
};

type PickerMode = 'none' | 'date' | 'time';

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

const RepeatIcon = ({ color = colors.primary, size = ms(18) }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 1l4 4-4 4"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 11V9a4 4 0 0 1 4-4h14"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
    />
    <Path
      d="m7 23-4-4 4-4"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 13v2a4 4 0 0 1-4 4H3"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
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

const ReminderDetailBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ reminder }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [pickerMode, setPickerMode] = useState<PickerMode>('none');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [repeat, setRepeat] = useState<ReminderRepeat>('once');
    const [aiCalling, setAiCalling] = useState(false);
    const [notification, setNotification] = useState(true);
    const [beeping, setBeeping] = useState(false);

    useEffect(() => {
      if (!reminder) {
        return;
      }

      setName(reminder.title);
      setDescription(reminder.description);
      setSelectedDate(parseReminderDate(reminder));
      setSelectedTime(parseReminderTime(reminder));
      setRepeat(reminder.repeat);
      setAiCalling(reminder.aiCalling);
      setNotification(reminder.notification);
      setBeeping(reminder.beeping);
      setPickerMode('none');
    }, [reminder]);

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

    const togglePicker = (mode: PickerMode) => {
      LayoutAnimation.configureNext(PICKER_TRANSITION);
      setPickerMode(prev => (prev === mode ? 'none' : mode));
    };

    const closePicker = () => {
      LayoutAnimation.configureNext(PICKER_TRANSITION);
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

    if (!reminder) {
      return (
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}
          handleIndicatorStyle={styles.indicator}
          onChange={index => setIsSheetOpen(index >= 0)}
        >
          <View />
        </BottomSheetModal>
      );
    }

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => {
          setIsSheetOpen(index >= 0);
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
                {reminder.source === 'ai' ? 'AI Reminder' : 'Manual'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetTitle}>Edit reminder</Text>
          <Text style={styles.sheetHint}>
            Tap any field to update details, schedule, or alerts
          </Text>

          <View style={styles.section}>
            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Reminder name</Text>
              <BottomSheetTextInput
                value={name}
                onChangeText={setName}
                placeholder="Reminder name"
                placeholderTextColor={colors.muted}
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldCard}>
              <Text style={styles.fieldLabel}>Description</Text>
              <BottomSheetTextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add a short description"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.multilineInput]}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.metaRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.fieldCard,
                  styles.metaCard,
                  pickerMode === 'time' && styles.metaCardActive,
                ]}
                onPress={() => togglePicker('time')}
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
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.fieldCard,
                  styles.metaCard,
                  pickerMode === 'date' && styles.metaCardActive,
                ]}
                onPress={() => togglePicker('date')}
              >
                <View style={styles.metaIcon}>
                  <CalendarIcon color={colors.primary} />
                </View>
                <View style={styles.metaCopy}>
                  <Text style={styles.fieldLabel}>Date</Text>
                  <Text style={styles.fieldValue}>
                    {formatDateLabel(selectedDate)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {pickerMode === 'time' ? (
              <ReminderTimePicker
                value={selectedTime}
                onChange={handleTimeChange}
                onComplete={closePicker}
              />
            ) : null}

            {pickerMode === 'date' ? (
              <ReminderDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                onComplete={closePicker}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <RepeatIcon color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.sectionLabel, styles.sectionLabelInline]}>
                  Repeat
                </Text>
                <Text style={styles.sectionHint}>
                  Choose how often this reminder repeats
                </Text>
              </View>
            </View>

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
            <Text style={styles.sectionLabel}>Smart features</Text>

            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, styles.featureIconCall]}>
                  <PhoneIcon color="#7C3AED" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>AI Calling</Text>
                  <Text style={styles.featureSubtitle}>
                    Buddy can call you for this reminder
                  </Text>
                </View>
              </View>
              <Switch
                value={aiCalling}
                onValueChange={setAiCalling}
                trackColor={{ false: colors.border, true: '#C4B5FD' }}
                thumbColor={aiCalling ? '#7C3AED' : colors.white}
              />
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, styles.featureIconNotify]}>
                  <BellIcon color="#2563EB" />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>Notification</Text>
                  <Text style={styles.featureSubtitle}>
                    Push alert when it’s time
                  </Text>
                </View>
              </View>
              <Switch
                value={notification}
                onValueChange={setNotification}
                trackColor={{ false: colors.border, true: '#93C5FD' }}
                thumbColor={notification ? '#2563EB' : colors.white}
              />
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureLeft}>
                <View style={[styles.featureIcon, styles.featureIconBeep]}>
                  <BeepIcon color="#0D9488" />
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
                trackColor={{ false: colors.border, true: '#5EEAD4' }}
                thumbColor={beeping ? '#0D9488' : colors.white}
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.saveButton}
            onPress={handleClose}
          >
            <Text style={styles.saveButtonText}>Done</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

ReminderDetailBottomSheet.displayName = 'ReminderDetailBottomSheet';

export default ReminderDetailBottomSheet;

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

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  sectionIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(11),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionLabel: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },

  sectionLabelInline: {
    marginBottom: spacing.xxs,
  },

  sectionHint: {
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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

  input: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    padding: 0,
    margin: 0,
    minHeight: ms(22),
  },

  multilineInput: {
    minHeight: ms(72),
    lineHeight: ms(20),
    fontWeight: fontWeight.medium,
  },

  metaRow: {
    flexDirection: 'row',
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
    borderRadius: ms(11),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: ms(34),
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },

  chipText: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  chipTextActive: {
    color: colors.white,
  },

  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },

  featureLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
  },

  featureIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureIconCall: {
    backgroundColor: '#F3EEFF',
  },

  featureIconNotify: {
    backgroundColor: '#E8F1FE',
  },

  featureIconBeep: {
    backgroundColor: '#E3F8F5',
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
    minHeight: ms(52),
    borderRadius: radii.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
