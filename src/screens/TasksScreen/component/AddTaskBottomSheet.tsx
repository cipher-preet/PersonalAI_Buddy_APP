import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
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
  isSaving?: boolean;
  onSave: (title: string, description: string) => Promise<void> | void;
};

const KEYBOARD_BUTTON_GAP = ms(24);

const AddTaskBottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ dateLabel, isSaving = false, onSave }, ref) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const handleClose = useCallback(() => {
      if (isSaving) {
        return;
      }

      if (ref && 'current' in ref) {
        ref.current?.dismiss();
      }
    }, [isSaving, ref]);

    const resetForm = useCallback(() => {
      setTitle('');
      setDescription('');
      setTitleError('');
      setDescriptionError('');
      setKeyboardHeight(0);
    }, []);

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

    const handleDescriptionChange = (value: string) => {
      setDescription(value);
      if (descriptionError) {
        setDescriptionError('');
      }
    };

    const handleSave = async () => {
      if (isSaving) {
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      let hasError = false;

      if (!trimmedTitle) {
        setTitleError('Enter a title to save this task.');
        hasError = true;
      }

      if (!trimmedDescription) {
        setDescriptionError('Enter a description to save this task.');
        hasError = true;
      }

      if (hasError) {
        return;
      }

      Keyboard.dismiss();

      try {
        await onSave(trimmedTitle, trimmedDescription);
        resetForm();
        if (ref && 'current' in ref) {
          ref.current?.dismiss();
        }
      } catch {
        // Parent surfaces the error; keep the sheet open.
      }
    };

    const bottomPadding =
      keyboardHeight > 0
        ? keyboardHeight - insets.bottom + KEYBOARD_BUTTON_GAP
        : spacing['2xl'] + insets.bottom;

    const canSave =
      title.trim().length > 0 && description.trim().length > 0 && !isSaving;

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose={!isSaving}
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
              <Text style={styles.title}>New task</Text>
              <Text style={styles.subtitle}>{dateLabel}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.75}
              disabled={isSaving}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Title</Text>
          <BottomSheetTextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Task title"
            placeholderTextColor={colors.muted}
            style={[styles.input, titleError && styles.inputError]}
            autoFocus={isSheetOpen}
            returnKeyType="next"
            maxLength={80}
            editable={!isSaving}
          />
          {titleError ? (
            <Text style={styles.errorText}>{titleError}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, styles.descriptionLabel]}>
            Description
          </Text>
          <BottomSheetTextInput
            value={description}
            onChangeText={handleDescriptionChange}
            placeholder="Write a short description..."
            placeholderTextColor={colors.muted}
            style={[
              styles.descriptionInput,
              descriptionError && styles.inputError,
            ]}
            multiline
            textAlignVertical="top"
            maxLength={500}
            editable={!isSaving}
          />
          {descriptionError ? (
            <Text style={styles.errorText}>{descriptionError}</Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.button, !canSave && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Save task</Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddTaskBottomSheet.displayName = 'AddTaskBottomSheet';

export default AddTaskBottomSheet;

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
