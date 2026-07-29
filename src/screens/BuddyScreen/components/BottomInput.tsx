import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
} from 'react-native';

import { MicIcon, UpArrowIcon } from '../../../../styles/icons';
import { COLORS } from '../styles';

export const INPUT_BAR_HEIGHT = 76;

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onFocus?: TextInputProps['onFocus'];
};

const BottomInput = forwardRef<TextInput, Props>(
  ({ value, onChangeText, onSend, onFocus }, ref) => {
    const canSend = value.trim().length > 0;

    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <TextInput
            ref={ref}
            placeholder="Ask Buddy anything..."
            placeholderTextColor="#9CA3AF"
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            style={styles.input}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="center"
          />

          <TouchableOpacity style={styles.micButton} activeOpacity={0.75}>
            <MicIcon width={18} height={18} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            onPress={onSend}
            activeOpacity={0.85}
            disabled={!canSend}
          >
            <UpArrowIcon width={16} height={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

BottomInput.displayName = 'BottomInput';

export default BottomInput;

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },

  container: {
    height: 52,
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.text,
    paddingTop: Platform.OS === 'ios' ? 16 : 0,
    paddingBottom: Platform.OS === 'ios' ? 16 : 0,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },

  micButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    backgroundColor: '#F8FAFC',
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },

  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
