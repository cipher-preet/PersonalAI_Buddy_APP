import React, { useEffect, useRef } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import {
  colors,
  fontWeight,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

const OTP_LENGTH = 4;
const HORIZONTAL_PADDING = ms(48);
const BOX_GAP = spacing.sm;
const BOX_SIZE = Math.min(
  ms(58),
  Math.floor(
    (screenWidth - HORIZONTAL_PADDING - BOX_GAP * (OTP_LENGTH - 1)) /
      OTP_LENGTH,
  ),
);

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
};

const OtpInputBoxes = ({
  value,
  onChange,
  length = OTP_LENGTH,
  autoFocus = true,
}: Props) => {
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputsRef.current[0]?.focus(), 350);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputsRef.current[index]?.focus();
    }
  };

  const updateValue = (nextValue: string) => {
    onChange(nextValue.replace(/\D/g, '').slice(0, length));
  };

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length > 1) {
      updateValue(cleaned);
      focusInput(Math.min(cleaned.length, length) - 1);
      return;
    }

    const chars = digits.slice();
    chars[index] = cleaned;
    const nextValue = chars.join('').replace(/\s/g, '');
    updateValue(nextValue);

    if (cleaned && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const chars = digits.slice();
      chars[index - 1] = '';
      updateValue(chars.join(''));
      focusInput(index - 1);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.boxRow}>
        {digits.map((digit, index) => {
          const isFilled = digit.length > 0;
          const isActive = index === activeIndex;

          return (
            <View
              key={index}
              style={[
                styles.box,
                isFilled && styles.boxFilled,
                isActive && styles.boxActive,
              ]}
            >
              <TextInput
                ref={ref => {
                  inputsRef.current[index] = ref;
                }}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={event => handleKeyPress(event, index)}
                onFocus={() => focusInput(Math.min(value.length, length - 1))}
                keyboardType="number-pad"
                returnKeyType="done"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={index === 0 ? length : 1}
                selectTextOnFocus
                caretHidden={false}
                style={styles.input}
                textAlign="center"
                underlineColorAndroid="transparent"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default OtpInputBoxes;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },

  boxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: BOX_GAP,
    width: '100%',
  },

  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  boxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },

  input: {
    width: '100%',
    height: '100%',
    fontSize: ms(22),
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    ...(Platform.OS === 'android' ? { textAlignVertical: 'center' as const } : null),
  },
});
