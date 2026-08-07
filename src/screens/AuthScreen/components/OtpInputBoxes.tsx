import React, { useEffect, useRef } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { AUTH_COLORS } from '../styles/colors';
import {
  fontWeight,
  ms,
  radii,
  screenWidth,
  spacing,
} from '../../../theme';

const OTP_LENGTH = 4;
const HORIZONTAL_PADDING = ms(84);
const BOX_GAP = spacing.md;
const BOX_SIZE = Math.min(
  ms(48),
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
                onFocus={() => focusInput(index)}
                keyboardType="number-pad"
                returnKeyType="done"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                maxLength={index === 0 ? length : 1}
                selectTextOnFocus
                caretHidden={false}
                style={styles.input}
                textAlign="center"
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
    alignItems: 'center',
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
    height: BOX_SIZE + ms(8),
    borderRadius: radii.sm,
    backgroundColor: AUTH_COLORS.white,
    borderWidth: 1.5,
    borderColor: AUTH_COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  boxFilled: {
    borderColor: AUTH_COLORS.primary,
    backgroundColor: AUTH_COLORS.primarySoft,
  },

  boxActive: {
    borderColor: AUTH_COLORS.borderFocus,
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: ms(8),
    elevation: 3,
  },

  input: {
    width: '100%',
    height: '100%',
    fontSize: ms(22),
    fontWeight: fontWeight.bold,
    color: AUTH_COLORS.text,
    padding: 0,
    margin: 0,
  },
});
