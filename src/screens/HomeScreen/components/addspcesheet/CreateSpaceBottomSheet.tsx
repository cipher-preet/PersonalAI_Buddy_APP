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
import { useToast } from '../../../../store/context/ToastContext';
import { useAppSelector } from '../../../../store/hooks';
import { useCreateSpaceMutation } from '../../../../store/api/home';

const KEYBOARD_BUTTON_GAP = 32;

const CreateSpaceBottomSheet = forwardRef((_props: any, ref: any) => {
  const insets = useSafeAreaInsets();
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const { showToast } = useToast();
  const [spaceName, setSpaceName] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [createSpace, { isLoading }] = useCreateSpaceMutation();

  const handleClose = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

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
      showToast({
        message: 'Space name is required',
        type: 'error',
      });
      return;
    }

    try {
      const response = await createSpace({
        spacename: trimmedName,
        userId,
      }).unwrap();

      if (response?.success) {
        showToast({
          message: response.data || 'Space created successfully',
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
    } catch (error) {
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
      : 8;

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
      onDismiss={() => {
        setIsSheetOpen(false);
        setSpaceName('');
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
            onChangeText={setSpaceName}
            placeholder="Enter space name"
            placeholderTextColor="#8E8E93"
            style={styles.input}
            autoFocus={isSheetOpen}
            returnKeyType="done"
            onSubmitEditing={handleCreate}
          />
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
  );
});

export default CreateSpaceBottomSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 70,
    height: 6,
    borderRadius: 999,
  },

  container: {
    paddingHorizontal: 22,
    paddingTop: 6,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },

  closeIcon: {
    fontSize: 22,
    lineHeight: 24,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: -1,
  },

  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingRight: 12,
  },

  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
  },

  inputContainer: {
    marginBottom: 20,
  },

  input: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FD',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    fontSize: 16,
  },

  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4338CA',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonKeyboardOpen: {
    marginBottom: 4,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
