import React, { memo, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';

type FieldProps = {
  label: string;
  error?: string;
  multiline?: boolean;
  containerStyle?: ViewStyle;
} & Omit<TextInputProps, 'style' | 'multiline'>;

/**
 * Floating-label style text field used in Reminder / Calendar sheets.
 * Soft fill, clear focus ring, generous tap height — tuned for low-end devices
 * (no shadows, hairline borders only).
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
        <Text style={styles.eyebrow}>{label}</Text>
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
            placeholderTextColor={colors.muted}
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

type ToggleRowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon: React.ReactNode;
  iconTone?: 'brand' | 'success';
  showDivider?: boolean;
};

/**
 * Settings-style toggle row (iOS / Material pattern): icon badge + copy + switch.
 */
export const SheetToggleRow = memo(
  ({
    title,
    subtitle,
    value,
    onValueChange,
    icon,
    iconTone = 'brand',
    showDivider = false,
  }: ToggleRowProps) => (
    <View>
      <View style={styles.toggleRow}>
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
        <View style={styles.toggleCopy}>
          <Text style={styles.toggleTitle}>{title}</Text>
          <Text style={styles.toggleSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.border,
            true:
              iconTone === 'success' ? colors.successSoft : colors.brandBorder,
          }}
          thumbColor={
            value
              ? iconTone === 'success'
                ? colors.success
                : colors.primary
              : colors.white
          }
          ios_backgroundColor={colors.border}
          style={styles.switch}
        />
      </View>
      {showDivider ? <View style={styles.toggleDivider} /> : null}
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
 * Compact segmented control — one track, selected pill. Avoids wrap-chip clutter.
 */
export function SheetSegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentProps<T>) {
  return (
    <View>
      {label ? <Text style={styles.eyebrow}>{label}</Text> : null}
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

export const sheetFormStyles = StyleSheet.create({
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  groupCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  groupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(58),
  },
});

const styles = StyleSheet.create({
  fieldWrap: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  fieldSurface: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    minHeight: layout.inputHeight,
    justifyContent: 'center',
  },
  fieldSurfaceMultiline: {
    minHeight: ms(96),
    paddingVertical: spacing.md,
    justifyContent: 'flex-start',
  },
  fieldSurfaceFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  fieldSurfaceError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  fieldInput: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    padding: 0,
    margin: 0,
    minHeight: ms(24),
  },
  fieldInputMultiline: {
    minHeight: ms(72),
    lineHeight: ms(22),
    fontWeight: fontWeight.medium,
  },
  errorText: {
    marginTop: spacing.sm,
    marginLeft: spacing.xs,
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    minHeight: ms(72),
  },
  toggleIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
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
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  toggleSubtitle: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  toggleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(68),
  },
  switch: Platform.select({
    ios: {
      transform: [{ scaleX: 0.92 }, { scaleY: 0.92 }],
    },
    default: {},
  }),
  segmentTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.lightGray,
    borderRadius: radii.lg,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentItem: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: ms(40),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  segmentItemActive: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
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
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
});
