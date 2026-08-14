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
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../../../store/context/ToastContext';
import { useAppSelector } from '../../../../store/hooks';
import { useCreateSpaceMutation } from '../../../../store/api/home';
import UpgradePlanPromptModal from '../../../../components/UpgradePlanPromptModal';
import { isPlanLimitError } from '../../../../utils/planLimitError';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../../theme';

const KEYBOARD_BUTTON_GAP = ms(32);
const MIN_SPACE_NAME_LENGTH = 3;

const getCreateSpaceErrorMessage = (error: any) => {
  const message = error?.data?.message || error?.message;

  return typeof message === 'string' ? message : '';
};

const CreateSpaceBottomSheet = forwardRef((_props: any, ref: any) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const { showToast } = useToast();
  const [spaceName, setSpaceName] = useState('');
  const [spaceNameError, setSpaceNameError] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [createSpace, { isLoading }] = useCreateSpaceMutation();

  const showPlanLimitPrompt = useCallback(() => {
    Keyboard.dismiss();
    setTimeout(() => {
      setShowUpgradePrompt(true);
    }, Platform.OS === 'ios' ? 250 : 120);
  }, []);

  const handleClose = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

  const handleSpaceNameChange = (value: string) => {
    setSpaceName(value);

    if (spaceNameError) {
      setSpaceNameError('');
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
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

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });

    return () => subscription.remove();
  }, [isSheetOpen, handleClose]);

  const handleCreate = async () => {
    const trimmedName = spaceName.trim();

    if (!trimmedName) {
      setSpaceNameError('Enter a space name to continue.');
      return;
    }

    if (trimmedName.length < MIN_SPACE_NAME_LENGTH) {
      setSpaceNameError(
        `Space name must be at least ${MIN_SPACE_NAME_LENGTH} characters.`,
      );
      return;
    }

    setSpaceNameError('');

    try {
      const response = await createSpace({
        spacename: trimmedName,
        userId,
      }).unwrap();

      if (response?.success) {
        showToast({
          message: response.data?.message || 'Space created successfully',
          type: 'success',
        });
        setSpaceName('');
        Keyboard.dismiss();
        ref?.current?.dismiss();
      } else {
        showToast({
          message: 'Unable to create space',
          type: 'error',
        });
      }
    } catch (error: any) {
      if (isPlanLimitError(error)) {
        showPlanLimitPrompt();
        return;
      }

      const errorMessage = getCreateSpaceErrorMessage(error);

      if (errorMessage) {
        setSpaceNameError(errorMessage);
        return;
      }

      showToast({
        message: 'Create space failed. Please try again.',
        type: 'error',
      });
      console.log('Create space failed:', error);
    }
  };

  const bottomPadding =
    keyboardHeight > 0
      ? keyboardHeight - insets.bottom + KEYBOARD_BUTTON_GAP
      : spacing.md;

  return (
    <>
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
      onDismiss={() => {
        setIsSheetOpen(false);
        setSpaceName('');
        setSpaceNameError('');
        setKeyboardHeight(0);
      }}
    >
      <BottomSheetView
        style={[styles.container, { paddingBottom: bottomPadding }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Create New Space</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Give your space a name</Text>

        <View style={styles.inputContainer}>
          <BottomSheetTextInput
            value={spaceName}
            onChangeText={handleSpaceNameChange}
            placeholder="Enter space name"
            placeholderTextColor={colors.muted}
            style={[styles.input, spaceNameError && styles.inputError]}
            autoFocus={isSheetOpen}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
          {spaceNameError ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorIcon}>!</Text>
              <Text style={styles.errorText}>{spaceNameError}</Text>
            </View>
          ) : (
            <Text style={styles.helperText}>
              Use at least {MIN_SPACE_NAME_LENGTH} characters.
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isLoading && styles.buttonDisabled,
            keyboardHeight > 0 && styles.buttonKeyboardOpen,
          ]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Create Space'}
          </Text>
        </TouchableOpacity>

      </BottomSheetView>
      </BottomSheetModal>

      <UpgradePlanPromptModal
        visible={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        onUpgrade={() => {
          setShowUpgradePrompt(false);
          ref?.current?.dismiss();
          navigation.navigate('Plans');
        }}
      />
    </>
  );
});

export default CreateSpaceBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(32),
    borderTopRightRadius: ms(32),
  },

  indicator: {
    backgroundColor: colors.muted,
    width: ms(70),
    height: ms(6),
    borderRadius: radii.pill,
  },

  container: {
    paddingHorizontal: ms(20),
    paddingTop: spacing.xs,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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

  title: {
    flex: 1,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    color: colors.black,
    paddingRight: spacing.xl,
  },

  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },

  inputContainer: {
    marginBottom: spacing.xl,
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
  },

  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FFF7F7',
  },

  helperText: {
    marginTop: spacing.sm,
    marginLeft: spacing.md,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  errorIcon: {
    width: ms(18),
    height: ms(18),
    borderRadius: ms(9),
    marginRight: spacing.sm,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: ms(18),
    color: colors.white,
    backgroundColor: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },

  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: fontSize.sm,
    lineHeight: ms(18),
    fontWeight: fontWeight.bold,
  },

  button: {
    height: mvs(52),
    borderRadius: ms(16),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonKeyboardOpen: {
    marginBottom: spacing.xs,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
});
