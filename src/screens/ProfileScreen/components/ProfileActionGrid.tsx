import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { useToast } from '../../../store/context/ToastContext';
import {
  useDeleteAccountMutation,
  useLogoutUserMutation,
} from '../../../store/api/auth';
import type { PlanStatus } from '../../../store/api/payments';
import LogoutConfirmationModal from '../../../components/LogoutConfirmationModal';
import {
  getRecordingUsedMs,
  isUnlimitedLimit,
} from '../../../utils/planUsage';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type IconProps = {
  color?: string;
};

const KEYBOARD_BUTTON_GAP = ms(32);

type ProfileActionGridProps = {
  planStatus?: PlanStatus;
  isPlanLoading?: boolean;
  isPlanError?: boolean;
  onEditProfile: () => void;
};

const SettingsIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
      stroke={color}
      strokeWidth={1.6}
    />
    <Path
      d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.1.7.6 1.2 1.5 1.3H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

const NotesGridIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 3v5h5M8.5 13h7M8.5 17h4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaskGridIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6h10M9 12h10M9 18h10"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpacesGridIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7.5V6.2A2.2 2.2 0 0 1 6.2 4h1.3M4 16.5v1.3A2.2 2.2 0 0 0 6.2 20h1.3M15.5 4h1.3A2.2 2.2 0 0 1 19 6.2v1.3M15.5 20h1.3A2.2 2.2 0 0 0 19 17.8v-1.3M8.5 12h7M12 8.5v7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const FeedbackIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 5.5h14a2.5 2.5 0 0 1 2.5 2.5v6.5A2.5 2.5 0 0 1 19 17H10l-5.5 3v-3.6A2.5 2.5 0 0 1 2.5 14V8A2.5 2.5 0 0 1 5 5.5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const HelpSupportIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0-9-9 9 9 0 0 0 9 9Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <Path
      d="M9.8 9.6a2.2 2.2 0 0 1 4.3.7c0 1.5-2.15 2-2.15 3.3"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M12 16.8h.01"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const LogoutIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 12H4M7.5 8.5 4 12l3.5 3.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DeleteAccountIcon = ({ color = colors.text }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 3h6M5 7h14M18 7l-.7 12.1A2 2 0 0 1 15.31 21H8.69a2 2 0 0 1-1.99-1.9L6 7M10 11v6M14 11v6"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WarningIcon = ({ color = colors.error }: IconProps) => (
  <Svg width={ms(22)} height={ms(22)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const formatMetric = (
  value: number | undefined,
  isLoading?: boolean,
  isError?: boolean,
) => {
  if (isLoading) {
    return '...';
  }

  if (isError) {
    return '-';
  }

  return String(value ?? 0);
};

export { formatMetric };

const msToMinutes = (valueMs: number) =>
  Math.max(0, Math.round(valueMs / 60000));

const ProfileActionGrid = ({
  planStatus,
  isPlanLoading,
  isPlanError,
  onEditProfile,
}: ProfileActionGridProps) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const deleteSheetRef = useRef<BottomSheetModal>(null);
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [deleteAccount, { isLoading: isDeletingAccount }] =
    useDeleteAccountMutation();
  const [logoutUser, { isLoading: isLoggingOut }] = useLogoutUserMutation();

  const planName = isPlanLoading
    ? '...'
    : isPlanError
      ? 'Unavailable'
      : planStatus?.plan?.name?.trim() || 'Free';

  const usedMs = getRecordingUsedMs(planStatus);
  const limitHours = planStatus?.plan?.limits?.recordingHours;
  const usedMinutes = msToMinutes(usedMs);
  const limitMinutes =
    typeof limitHours === 'number' && !isUnlimitedLimit(limitHours)
      ? Math.max(0, Math.round(limitHours * 60))
      : null;
  const usageProgress =
    limitMinutes && limitMinutes > 0
      ? Math.min(1, usedMinutes / limitMinutes)
      : 0;
  const usageLabel =
    isPlanLoading
      ? 'Loading usage...'
      : isPlanError
        ? 'Usage unavailable'
        : limitMinutes == null
          ? isUnlimitedLimit(limitHours)
            ? 'Unlimited monthly minutes'
            : 'Recording usage unavailable'
          : `${usedMinutes} of ${limitMinutes} monthly minutes used`;

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      const response = await logoutUser().unwrap();
      setIsLogoutConfirmVisible(false);
      dispatch(logout());
      showToast({
        message: response?.message || 'Signed out successfully',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Unable to log out'),
        type: 'error',
      });
    }
  };

  const closeDeleteSheet = useCallback(() => {
    if (isDeletingAccount) {
      return;
    }

    Keyboard.dismiss();
    deleteSheetRef.current?.dismiss();
  }, [isDeletingAccount]);

  const openDeleteSheet = useCallback(() => {
    setDeleteConfirmation('');
    deleteSheetRef.current?.present();
  }, []);

  const handleDeleteConfirmationChange = (value: string) => {
    setDeleteConfirmation(value.toUpperCase());
  };

  const renderDeleteBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={isDeletingAccount ? 'none' : 'close'}
      />
    ),
    [isDeletingAccount],
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
    if (!isDeleteSheetOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDeleteSheet();
      return true;
    });

    return () => subscription.remove();
  }, [closeDeleteSheet, isDeleteSheetOpen]);

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE' || isDeletingAccount) {
      return;
    }

    try {
      const response = await deleteAccount({
        confirmation: deleteConfirmation,
      }).unwrap();

      deleteSheetRef.current?.dismiss();
      setDeleteConfirmation('');
      dispatch(logout());
      showToast({
        message: response?.message || 'Account deleted successfully',
        type: 'success',
      });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Unable to delete account'),
        type: 'error',
      });
    }
  };

  const menuItems = [
    {
      id: 'settings',
      title: 'Account Settings',
      icon: SettingsIcon,
      onPress: onEditProfile,
    },
    {
      id: 'notes',
      title: 'Notes',
      icon: NotesGridIcon,
      onPress: () => navigation.navigate('Notes'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: TaskGridIcon,
      onPress: () => navigation.navigate('Tasks'),
    },
    {
      id: 'spaces',
      title: 'Spaces',
      icon: SpacesGridIcon,
      onPress: () => navigation.navigate('Home'),
    },
    {
      id: 'feedback',
      title: 'Feedback',
      icon: FeedbackIcon,
      onPress: () => navigation.navigate('Feedback'),
    },
    {
      id: 'help',
      title: 'Help Center',
      icon: HelpSupportIcon,
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogoutIcon,
      onPress: () => setIsLogoutConfirmVisible(true),
    },
    {
      id: 'delete',
      title: 'Delete Account',
      icon: DeleteAccountIcon,
      onPress: openDeleteSheet,
    },
  ];

  const bottomPadding =
    keyboardHeight > 0
      ? keyboardHeight - insets.bottom + KEYBOARD_BUTTON_GAP
      : Platform.OS === 'ios'
        ? spacing['4xl']
        : spacing['3xl'];

  return (
    <View style={styles.wrapper}>
      <View style={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={item.id}>
            {index > 0 ? <View style={styles.listDivider} /> : null}
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.listRow}
              onPress={item.onPress}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.listIcon}>
                {item.icon({ color: colors.text })}
              </View>
              <Text style={styles.listTitle}>{item.title}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.planCard}>
        <View style={styles.planTopRow}>
          <View style={styles.planCopy}>
            <Text style={styles.planName}>{planName}</Text>
            <Text style={styles.planUsage}>{usageLabel}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Plans')}
            accessibilityRole="button"
            accessibilityLabel="Upgrade plan"
          >
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.round(usageProgress * 100)}%` },
            ]}
          />
        </View>
      </View>

      <LogoutConfirmationModal
        visible={isLogoutConfirmVisible}
        loading={isLoggingOut}
        onCancel={() => {
          if (!isLoggingOut) {
            setIsLogoutConfirmVisible(false);
          }
        }}
        onConfirm={handleLogout}
      />

      <BottomSheetModal
        ref={deleteSheetRef}
        enableDynamicSizing
        enablePanDownToClose={!isDeletingAccount}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderDeleteBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.indicator}
        onChange={index => setIsDeleteSheetOpen(index >= 0)}
        onDismiss={() => {
          setIsDeleteSheetOpen(false);
          setDeleteConfirmation('');
          setKeyboardHeight(0);
        }}
      >
        <BottomSheetView
          style={[styles.deleteSheet, { paddingBottom: bottomPadding }]}
        >
          <Text style={styles.sheetTitle}>Delete Account</Text>

          <View style={styles.warningBox}>
            <View style={styles.warningIconWrap}>
              <WarningIcon color={colors.error} />
            </View>
            <Text style={styles.warningText}>
              Warning! Please read carefully before deleting.
            </Text>
          </View>

          <Text style={styles.deleteMessage}>
            This will erase your account, spaces, notes, and tasks from our
            servers. It cannot be undone.
          </Text>

          <Text style={styles.confirmLabel}>
            Type <Text style={styles.confirmStrong}>"DELETE"</Text> to confirm
          </Text>
          <BottomSheetTextInput
            value={deleteConfirmation}
            onChangeText={handleDeleteConfirmationChange}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeletingAccount}
            placeholder="DELETE"
            placeholderTextColor={colors.muted}
            style={styles.confirmInput}
            returnKeyType="done"
            onSubmitEditing={handleDeleteAccount}
          />

          <Text style={styles.permanentHint}>Permanent deletion ahead.</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={deleteConfirmation !== 'DELETE' || isDeletingAccount}
            style={[
              styles.deleteAccountButton,
              keyboardHeight > 0 && styles.deleteAccountButtonKeyboardOpen,
              (deleteConfirmation !== 'DELETE' || isDeletingAccount) &&
                styles.deleteAccountButtonDisabled,
            ]}
            onPress={handleDeleteAccount}
          >
            {isDeletingAccount ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.deleteAccountButtonText}>
                Delete my account
              </Text>
            )}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
};

export default ProfileActionGrid;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xs,
  },

  menuList: {
    marginHorizontal: -spacing.xs,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xs,
  },

  listIcon: {
    width: ms(24),
    height: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  listTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  planCard: {
    marginTop: spacing['2xl'],
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  planTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  planCopy: {
    flex: 1,
    minWidth: 0,
  },

  planName: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  planUsage: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    minHeight: ms(34),
    alignItems: 'center',
    justifyContent: 'center',
  },

  upgradeButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  progressTrack: {
    marginTop: spacing.lg,
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.lightGray,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: ms(3),
    backgroundColor: colors.primary,
  },

  sheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(30),
    borderTopRightRadius: ms(30),
  },

  indicator: {
    backgroundColor: colors.border,
    width: ms(34),
    height: ms(4),
    borderRadius: ms(2),
  },

  deleteSheet: {
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing.sm,
  },

  sheetTitle: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },

  warningBox: {
    minHeight: ms(64),
    borderRadius: radii.xl,
    backgroundColor: colors.errorSoftBorder,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing['2xl'],
  },

  warningIconWrap: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  warningText: {
    flex: 1,
    color: colors.error,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    lineHeight: ms(20),
  },

  deleteMessage: {
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(22),
    marginBottom: spacing['2xl'],
  },

  confirmLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },

  confirmStrong: {
    color: colors.text,
  },

  confirmInput: {
    minHeight: ms(48),
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    marginBottom: spacing.md,
  },

  permanentHint: {
    color: colors.error,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    marginBottom: spacing['2xl'],
  },

  deleteAccountButton: {
    minHeight: ms(54),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
  },

  deleteAccountButtonKeyboardOpen: {
    marginBottom: spacing.xs,
  },

  deleteAccountButtonDisabled: {
    opacity: 0.55,
  },

  deleteAccountButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
  },
});
