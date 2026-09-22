import React, { memo, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../theme';

/** Reference accent (poll settings purple) */
const ACCENT = '#6E62E5';
const BORDER = '#E8E8EC';
const BORDER_ACTIVE = ACCENT;
const TRACK_OFF = '#E5E7EB';
const LABEL = '#6B7280';
const PLACEHOLDER = '#A1A1AA';

const SWITCH_WIDTH = ms(51);
const SWITCH_HEIGHT = ms(31);
const SWITCH_THUMB = ms(27);
const SWITCH_PAD = ms(2);

type FieldProps = {
  label: string;
  error?: string;
  multiline?: boolean;
  containerStyle?: ViewStyle;
} & Omit<TextInputProps, 'style' | 'multiline'>;

/**
 * Poll-style text field: white surface, soft gray border, rounded corners.
 */
export const SheetTextField = memo(
  ({
    label,
    error,
    multiline = false,
    containerStyle,
    onFocus,
    onBlur,
    ...inputProps
  }: FieldProps) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={[styles.fieldWrap, containerStyle]}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View
          style={[
            styles.fieldSurface,
            multiline && styles.fieldSurfaceMultiline,
            focused && styles.fieldSurfaceFocused,
            error ? styles.fieldSurfaceError : null,
          ]}
        >
          <BottomSheetTextInput
            {...inputProps}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor={PLACEHOLDER}
            style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
            onFocus={event => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={event => {
              setFocused(false);
              onBlur?.(event);
            }}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  },
);

SheetTextField.displayName = 'SheetTextField';

type SheetSwitchProps = {
  value: boolean;
  onValueChange?: (next: boolean) => void;
  interactive?: boolean;
};

/**
 * Custom switch: gray track off, solid purple on, white thumb.
 */
const SheetSwitch = memo(
  ({ value, onValueChange, interactive = true }: SheetSwitchProps) => {
    const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
      Animated.timing(progress, {
        toValue: value ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }, [progress, value]);

    const translateX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, SWITCH_WIDTH - SWITCH_THUMB - SWITCH_PAD * 2],
    });

    const trackColor = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [TRACK_OFF, ACCENT],
    });

    const track = (
      <Animated.View
        style={[styles.switchTrack, { backgroundColor: trackColor }]}
      >
        <Animated.View
          style={[styles.switchThumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    );

    if (!interactive || !onValueChange) {
      return track;
    }

    return (
      <Pressable
        onPress={() => onValueChange(!value)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        {track}
      </Pressable>
    );
  },
);

SheetSwitch.displayName = 'SheetSwitch';

type ToggleRowProps = {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon?: React.ReactNode;
  iconTone?: 'brand' | 'success';
  /** @deprecated Cards are spaced; divider is ignored. */
  showDivider?: boolean;
  containerStyle?: ViewStyle;
};

/**
 * Settings switch card. Only the switch toggles — card border stays neutral.
 */
export const SheetToggleRow = memo(
  ({
    title,
    subtitle,
    value,
    onValueChange,
    icon,
    iconTone = 'brand',
    containerStyle,
  }: ToggleRowProps) => (
    <View style={[styles.toggleCard, containerStyle]}>
      {icon ? (
        <View
          style={[
            styles.toggleIcon,
            iconTone === 'success'
              ? styles.toggleIconSuccess
              : styles.toggleIconBrand,
          ]}
        >
          {icon}
        </View>
      ) : null}
      <View style={styles.toggleCopy} pointerEvents="none">
        <Text style={styles.toggleTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.toggleSubtitle} numberOfLines={3}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <SheetSwitch value={value} onValueChange={onValueChange} />
    </View>
  ),
);

SheetToggleRow.displayName = 'SheetToggleRow';

type ChipOption<T extends string> = {
  id: T;
  label: string;
};

type SegmentProps<T extends string> = {
  label?: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (next: T) => void;
};

/**
 * Compact segmented control — soft track, selected pill with accent border.
 */
export function SheetSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentProps<T>) {
  return (
    <View>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.segmentTrack}>
        {options.map(option => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              style={({ pressed }) => [
                styles.segmentItem,
                selected && styles.segmentItemActive,
                pressed && !selected && styles.segmentItemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export const SheetPrimaryButton = memo(
  ({ label, onPress, disabled, loading, style }: PrimaryButtonProps) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={[
        styles.primaryButton,
        (disabled || loading) && styles.primaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </TouchableOpacity>
  ),
);

SheetPrimaryButton.displayName = 'SheetPrimaryButton';

export const sheetFormStyles = StyleSheet.create({
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    color: LABEL,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: ms(52),
  },
  toggleStack: {
    gap: spacing.sm,
  },
});

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    color: LABEL,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  fieldSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: spacing.lg,
    minHeight: ms(48),
    justifyContent: 'center',
  },
  fieldSurfaceMultiline: {
    minHeight: ms(80),
    paddingVertical: spacing.md,
    justifyContent: 'flex-start',
  },
  fieldSurfaceFocused: {
    borderColor: BORDER_ACTIVE,
  },
  fieldSurfaceError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  fieldInput: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    padding: 0,
    margin: 0,
    minHeight: ms(22),
  },
  fieldInputMultiline: {
    minHeight: ms(56),
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
  },
  errorText: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: ms(58),
    backgroundColor: '#FFFFFF',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: BORDER,
  },
  toggleIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconBrand: {
    backgroundColor: colors.primarySoft,
  },
  toggleIconSuccess: {
    backgroundColor: colors.successSoft,
  },
  toggleCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  toggleTitle: {
    color: colors.black,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  toggleSubtitle: {
    marginTop: 2,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(16),
  },
  switchTrack: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    padding: SWITCH_PAD,
    justifyContent: 'center',
  },
  switchThumb: {
    width: SWITCH_THUMB,
    height: SWITCH_THUMB,
    borderRadius: SWITCH_THUMB / 2,
    backgroundColor: '#FFFFFF',
  },
  segmentTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.lightGray,
    borderRadius: radii.lg,
    padding: spacing.xs,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: BORDER,
  },
  segmentItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: ms(36),
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  segmentItemActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: ACCENT,
  },
  segmentItemPressed: {
    opacity: 0.7,
  },
  segmentText: {
    textAlign: 'center',
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  segmentTextActive: {
    color: ACCENT,
    fontWeight: fontWeight.bold,
  },
  primaryButton: {
    minHeight: ms(48),
    borderRadius: radii.lg,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
