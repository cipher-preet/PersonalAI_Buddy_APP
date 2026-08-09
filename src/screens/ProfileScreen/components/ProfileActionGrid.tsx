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
import { ProfileSummary } from '../../../store/api/home';
import {
  useDeleteAccountMutation,
  useLogoutUserMutation,
} from '../../../store/api/auth';
import LogoutConfirmationModal from '../../../components/LogoutConfirmationModal';
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

type MetricItem = {
  id: string;
  title: string;
  value: string;
  accent: string;
  surface: string;
  icon: (props: IconProps) => React.ReactNode;
  onPress: () => void;
};

type ProfileActionGridProps = {
  summary?: ProfileSummary;
  isLoading?: boolean;
  isError?: boolean;
  planName?: string;
  isPlanLoading?: boolean;
  isPlanError?: boolean;
};

const PlanIcon = ({ color = colors.primary }: IconProps) => (
  <Svg width={ms(20)} height={ms(20)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 8h7M8.5 12h7M8.5 16h4"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const LogoutIcon = ({ color = colors.error }: IconProps) => (
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

const DeleteAccountIcon = ({ color = colors.error }: IconProps) => (
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

const TaskGridIcon = ({ color = colors.primary }: IconProps) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
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

const NotesGridIcon = ({ color = colors.primary }: IconProps) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
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

const SpacesGridIcon = ({ color = colors.primary }: IconProps) => (
  <Svg width={ms(18)} height={ms(18)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7.5V6.2A2.2 2.2 0 0 1 6.2 4h1.3M4 16.5v1.3A2.2 2.2 0 0 0 6.2 20h1.3M15.5 4h1.3A2.2 2.2 0 0 1 19 6.2v1.3M15.5 20h1.3A2.2 2.2 0 0 0 19 17.8v-1.3M8.5 12h7M12 8.5v7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronIcon = ({ color = colors.muted }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
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

const ProfileActionGrid = ({
  summary,
  isLoading,
  isError,
  planName,
  isPlanLoading,
  isPlanError,
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
  const planValue = isPlanLoading
    ? '...'
    : isPlanError
      ? '-'
      : planName?.trim() || 'Free';

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

  const metrics: MetricItem[] = [
    {
      id: 'notes',
      title: 'Notes',
      value: formatMetric(summary?.notesCount, isLoading, isError),
      accent: colors.success,
      surface: '#ECFDF5',
      icon: NotesGridIcon,
      onPress: () => navigation.navigate('Notes'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      value: formatMetric(summary?.tasksCount, isLoading, isError),
      accent: '#2563EB',
      surface: '#EFF6FF',
      icon: TaskGridIcon,
      onPress: () => navigation.navigate('Tasks'),
    },
    {
      id: 'spaces',
      title: 'Spaces',
      value: formatMetric(summary?.spacesCount, isLoading, isError),
      accent: colors.primaryPurpleDark,
      surface: colors.primarySoft,
      icon: SpacesGridIcon,
      onPress: () => navigation.navigate('Home'),
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
      <Text style={styles.sectionLabel}>Overview</Text>
      <View style={styles.metricsRow}>
        {metrics.map(item => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            style={styles.metricCard}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.value}`}
          >
            <View
              style={[styles.metricIcon, { backgroundColor: item.surface }]}
            >
              {item.icon({ color: item.accent })}
            </View>
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionLabel, styles.sectionSpacer]}>Account</Text>
      <View style={styles.listCard}>
        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.listRow}
          onPress={() => navigation.navigate('Plans')}
          accessibilityRole="button"
          accessibilityLabel={`Plan, ${planValue}`}
        >
          <View
            style={[styles.listIcon, { backgroundColor: colors.primaryLight }]}
          >
            <PlanIcon color={colors.primary} />
          </View>
          <View style={styles.listContent}>
            <Text style={styles.listTitle}>Plan</Text>
            <Text style={styles.listSubtitle}>View and manage subscription</Text>
          </View>
          <View style={styles.listTrailing}>
            <Text style={styles.listValue}>{planValue}</Text>
            <ChevronIcon />
          </View>
        </TouchableOpacity>

        <View style={styles.listDivider} />

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.listRow}
          onPress={openDeleteSheet}
          accessibilityRole="button"
          accessibilityLabel="Delete account"
        >
          <View style={[styles.listIcon, { backgroundColor: '#FEF2F2' }]}>
            <DeleteAccountIcon color={colors.error} />
          </View>
          <View style={styles.listContent}>
            <Text style={[styles.listTitle, styles.deleteTitle]}>
              Delete Account
            </Text>
            <Text style={styles.listSubtitle}>
              Permanently erase your account and data
            </Text>
          </View>
          <ChevronIcon color={colors.error} />
        </TouchableOpacity>

        <View style={styles.listDivider} />

        <TouchableOpacity
          activeOpacity={0.82}
          style={styles.listRow}
          onPress={() => setIsLogoutConfirmVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <View style={[styles.listIcon, { backgroundColor: '#FEF2F2' }]}>
            <LogoutIcon color={colors.error} />
          </View>
          <View style={styles.listContent}>
            <Text style={[styles.listTitle, styles.logoutTitle]}>Logout</Text>
            <Text style={styles.listSubtitle}>Sign out of your account</Text>
          </View>
          <ChevronIcon color={colors.error} />
        </TouchableOpacity>
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

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },

  sectionSpacer: {
    marginTop: spacing['3xl'],
  },

  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },

  metricIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  metricValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    lineHeight: ms(22),
  },

  metricTitle: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  listCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.xl,
  },

  listIcon: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  listContent: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs,
  },

  listTitle: {
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },

  logoutTitle: {
    color: colors.error,
  },

  deleteTitle: {
    color: colors.error,
  },

  listSubtitle: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
  },

  listTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  listValue: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
  },

  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: ms(70),
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
    backgroundColor: '#FEE2E2',
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
