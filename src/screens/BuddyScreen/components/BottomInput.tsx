import React, { forwardRef, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TextInputProps,
  LayoutAnimation,
  UIManager,
} from 'react-native';

import { MicIcon, UpArrowIcon } from '../../../../styles/icons';
import { COLORS } from '../styles';
import {
  colors,
  fontSize,
  ms,
  radii,
  spacing,
} from '../../../theme';

export const INPUT_BAR_HEIGHT = ms(76);
const COLLAPSED_INPUT_HEIGHT = ms(52);
const EXPANDED_INPUT_HEIGHT = ms(104);
const MAX_INPUT_HEIGHT = ms(148);
const CONTAINER_VERTICAL_PADDING = spacing.sm;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onFocus?: TextInputProps['onFocus'];
  disabled?: boolean;
};

const BottomInput = forwardRef<TextInput, Props>(
  ({ value, onChangeText, onSend, onFocus, disabled = false }, ref) => {
    const canSend = value.trim().length > 0 && !disabled;
    const [focused, setFocused] = useState(false);
    const [hasTypedInFocus, setHasTypedInFocus] = useState(false);
    const [contentHeight, setContentHeight] = useState(ms(24));
    const hasText = value.length > 0;
    const inputHeight = useMemo(() => {
      const shouldExpand = focused && (hasText || !hasTypedInFocus);
      const contentDrivenHeight =
        contentHeight + CONTAINER_VERTICAL_PADDING * 2;
      const targetHeight = shouldExpand
        ? Math.max(EXPANDED_INPUT_HEIGHT, contentDrivenHeight)
        : COLLAPSED_INPUT_HEIGHT;

      return Math.min(MAX_INPUT_HEIGHT, targetHeight);
    }, [contentHeight, focused, hasText, hasTypedInFocus]);

    const animateHeightChange = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    return (
      <View style={styles.wrapper}>
        <View style={[styles.container, { height: inputHeight }]}>
          <View style={styles.inputWrap}>
            <TextInput
              ref={ref}
              placeholder="Ask Buddy anything..."
              placeholderTextColor={colors.muted}
              value={value}
              onChangeText={text => {
                animateHeightChange();
                setHasTypedInFocus(previous => previous || text.length > 0);
                onChangeText(text);
              }}
              onFocus={event => {
                animateHeightChange();
                setHasTypedInFocus(false);
                setFocused(true);
                onFocus?.(event);
              }}
              onBlur={() => {
                animateHeightChange();
                setFocused(false);
                setHasTypedInFocus(false);
              }}
              onContentSizeChange={event => {
                animateHeightChange();
                setContentHeight(event.nativeEvent.contentSize.height);
              }}
              style={styles.input}
              multiline
              maxLength={2000}
              returnKeyType="default"
              blurOnSubmit={false}
              textAlignVertical="top"
              editable={!disabled}
              scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
            />
          </View>

          <TouchableOpacity
            style={styles.micButton}
            activeOpacity={0.75}
            disabled={disabled}
          >
            <MicIcon width={ms(18)} height={ms(18)} color={colors.subText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendButton, canSend && styles.sendButtonActive]}
            onPress={onSend}
            activeOpacity={0.85}
            disabled={!canSend}
          >
            <UpArrowIcon width={ms(16)} height={ms(16)} color={colors.white} />
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
    paddingTop: spacing.sm,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },

  container: {
    minHeight: COLLAPSED_INPUT_HEIGHT,
    backgroundColor: COLORS.inputBg,
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    paddingVertical: CONTAINER_VERTICAL_PADDING,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  inputWrap: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingVertical: spacing.md,
  },

  input: {
    flex: 1,
    fontSize: fontSize.lg,
    lineHeight: ms(20),
    color: COLORS.text,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },

  micButton: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    backgroundColor: colors.inputBg,
  },

  sendButton: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(14),
    backgroundColor: colors.brandBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  sendButtonActive: {
    backgroundColor: COLORS.primary,
  },
});
