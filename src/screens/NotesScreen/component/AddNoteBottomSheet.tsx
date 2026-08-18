import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  dateLabel: string;
  onSave: (title: string, description: string) => void;
};

const KEYBOARD_BUTTON_GAP = ms(24);

const AddNoteBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ dateLabel, onSave }, ref) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [titleError, setTitleError] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [ref]);

    const resetForm = useCallback(() => {
      setTitle('');
      setDescription('');
      setTitleError('');
      setKeyboardHeight(0);
    }, []);

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
      const showEvent =
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
      const hideEvent =
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

      const handleKeyboardShow = (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
      };

      const handleKeyboardHide = () => {
        setKeyboardHeight(0);
      };

      const showSubscription = Keyboard.addListener(showEvent, handleKeyboardShow);
      const hideSubscription = Keyboard.addListener(hideEvent, handleKeyboardHide);

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }, []);

    useEffect(() => {
      if (!isSheetOpen) {
        return;
      }

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleClose();
          return true;
        },
      );

      return () => subscription.remove();
    }, [handleClose, isSheetOpen]);

    const handleTitleChange = (value: string) => {
      setTitle(value);
      if (titleError) {
        setTitleError('');
      }
    };

    const handleSave = () => {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      if (!trimmedTitle) {
        setTitleError('Enter a title to save this note.');
        return;
      }

      Keyboard.dismiss();
      onSave(trimmedTitle, trimmedDescription);
      resetForm();
      handleClose();
    };

    const bottomPadding =
      keyboardHeight > 0
        ? keyboardHeight - insets.bottom + KEYBOARD_BUTTON_GAP
        : spacing['2xl'] + insets.bottom;

    const canSave = title.trim().length > 0;

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsSheetOpen(index >= 0)}
        onDismiss={resetForm}
      >
        <BottomSheetView style={[styles.container, { paddingBottom: bottomPadding }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>New note</Text>
              <Text style={styles.subtitle}>{dateLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Title</Text>
          <BottomSheetTextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Note title"
            placeholderTextColor={colors.muted}
            style={[styles.input, titleError && styles.inputError]}
            autoFocus={isSheetOpen}
            returnKeyType="next"
            maxLength={80}
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.descriptionLabel]}>
            Description
          </Text>
          <BottomSheetTextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Write a short description..."
            placeholderTextColor={colors.muted}
            style={styles.descriptionInput}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.button, !canSave && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.buttonText}>Save note</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddNoteBottomSheet.displayName = 'AddNoteBottomSheet';

export default AddNoteBottomSheet;

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

  container: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
  },

  headerCopy: {
    flex: 1,
    paddingRight: spacing.xl,
  },

  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: colors.black,
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },

  closeIcon: {
    fontSize: ms(22),
    lineHeight: ms(24),
    color: colors.subText,
    fontWeight: fontWeight.medium,
    marginTop: -ms(1),
  },

  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.black,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },

  descriptionLabel: {
    marginTop: spacing.xl,
  },

  input: {
    height: mvs(52),
    borderRadius: ms(16),
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    color: colors.black,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },

  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },

  errorText: {
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    color: colors.error,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  descriptionInput: {
    minHeight: mvs(112),
    borderRadius: ms(16),
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    color: colors.black,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },

  button: {
    height: mvs(52),
    marginTop: spacing['2xl'],
    borderRadius: ms(16),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.45,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});
