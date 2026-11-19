import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import EditProfileSheet from './components/EditProfileSheet';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  useLazyCheckAuthQuery,
  useUpdateProfileAvatarMutation,
  useUpdateProfileMutation,
} from '../../store/api/auth';
import { updateProfileSuccess } from '../../store/slices/authSlice';
import { useToast } from '../../store/context/ToastContext';
import { colors, fonts } from '../../theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tabBarClearance } = useResponsiveLayout();
  const { userId: storedUserId, name, email, phone, avatar } = useAppSelector(
    state => state.auth,
  );
  const [assistantOn, setAssistantOn] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [selectedAvatarAsset, setSelectedAvatarAsset] = useState<Asset | null>(
    null,
  );
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateProfileAvatar, { isLoading: isUpdatingAvatar }] =
    useUpdateProfileAvatarMutation();
  const userId = storedUserId ?? '';
  const hasEmail = Boolean(email?.trim());
  const hasPhone = Boolean(phone);

  const [fetchProfile] = useLazyCheckAuthQuery();

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }

      fetchProfile()
        .unwrap()
        .then(profile => {
          dispatch(
            updateProfileSuccess({
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              avatar: profile.avatar,
            }),
          );
        })
        .catch(() => undefined);
    }, [dispatch, fetchProfile, userId]),
  );

  useEffect(() => {
    if (!isEditOpen) {
      return;
    }

    setFormName(name?.trim() || '');
    setFormAvatar(avatar?.trim() || '');
    setFormEmail(email?.trim() || '');
    setFormPhone(phone ? String(phone) : '');
    setSelectedAvatarAsset(null);
  }, [avatar, email, isEditOpen, name, phone]);

  const hasProfileChanges =
    formName.trim() !== (name?.trim() || '') ||
    Boolean(selectedAvatarAsset) ||
    (!hasEmail && formEmail.trim() !== '') ||
    (!hasPhone && formPhone.trim() !== '');

  const getApiErrorMessage = (error: any, fallback: string) =>
    error?.data?.message || error?.message || fallback;

  const applySelectedAvatar = (asset?: Asset) => {
    if (!asset) {
      return;
    }

    if (!asset.uri) {
      showToast({ message: 'Unable to read selected image', type: 'error' });
      return;
    }

    setSelectedAvatarAsset(asset);
    setFormAvatar(asset.uri);
  };

  const showPickerUnavailableMessage = () => {
    showToast({
      message: 'Photo picker is not ready. Rebuild the app and try again.',
      type: 'error',
    });
  };

  const handleChoosePhoto = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: false,
        includeExtra: false,
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.5,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        showToast({
          message: result.errorMessage || 'Unable to choose photo',
          type: 'error',
        });
        return;
      }

      applySelectedAvatar(result.assets?.[0]);
    } catch (error: any) {
      if (error?.message?.includes('launchImageLibrary')) {
        showPickerUnavailableMessage();
        return;
      }

      showToast({ message: 'Unable to choose photo', type: 'error' });
    }
  };

  const handleTakePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          showToast({ message: 'Camera permission denied', type: 'error' });
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        saveToPhotos: false,
        includeBase64: false,
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.5,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        showToast({
          message: result.errorMessage || 'Unable to open camera',
          type: 'error',
        });
        return;
      }

      applySelectedAvatar(result.assets?.[0]);
    } catch (error: any) {
      if (error?.message?.includes('launchCamera')) {
        showPickerUnavailableMessage();
        return;
      }

      showToast({ message: 'Unable to open camera', type: 'error' });
    }
  };

  const handleSaveProfile = async () => {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();
    const nextPhone = formPhone.replace(/\D/g, '');

    if (nextName.length < 2) {
      showToast({ message: 'Enter a valid name', type: 'error' });
      return;
    }

    if (
      !hasEmail &&
      nextEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)
    ) {
      showToast({ message: 'Enter a valid email', type: 'error' });
      return;
    }

    if (!hasPhone && nextPhone && nextPhone.length < 10) {
      showToast({ message: 'Enter a valid mobile number', type: 'error' });
      return;
    }

    try {
      const result = await updateProfile({
        name: nextName,
        email: hasEmail ? undefined : nextEmail,
        phone: hasPhone ? undefined : nextPhone,
      }).unwrap();

      let updatedAvatar = result.avatar;

      if (selectedAvatarAsset?.uri) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: selectedAvatarAsset.uri,
          type: selectedAvatarAsset.type || 'image/jpeg',
          name: selectedAvatarAsset.fileName || `profile-${Date.now()}.jpg`,
        } as unknown as Blob);

        const avatarResult = await updateProfileAvatar(formData).unwrap();
        updatedAvatar = avatarResult.avatar;
      }

      dispatch(
        updateProfileSuccess({
          name: result.name,
          email: result.email,
          phone: result.phone,
          avatar: updatedAvatar,
        }),
      );
      setIsEditOpen(false);
      showToast({ message: 'Profile updated', type: 'success' });
    } catch (error: any) {
      showToast({
        message: getApiErrorMessage(error, 'Unable to update profile'),
        type: 'error',
      });
    }
  };

  const displayName = name?.trim() || 'You';
  const displayPhone = phone ? String(phone) : '';
  const initial = (displayName.charAt(0) || 'Y').toUpperCase();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: tabBarClearance },
          ]}
        >
          <View style={styles.header}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
            <View style={styles.headerCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                <Pressable
                  onPress={() => setIsEditOpen(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Edit profile"
                >
                  <PencilIcon />
                </Pressable>
              </View>
              {displayPhone ? (
                <Text style={styles.phone}>{displayPhone}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionLabel}>TELL EQUAL</Text>
          <View style={styles.card}>
            <LinearGradient
              colors={['#F6F3FF', '#E4D8FF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.assistantBanner}
            >
              <RobotIcon />
              <View style={styles.assistantCopy}>
                <Text style={styles.assistantTitle}>
                  {assistantOn ? 'AI Assistant is On' : 'AI Assistant is Off'}
                </Text>
                <Text style={styles.assistantSubtitle}>
                  {assistantOn
                    ? 'Equal is managing your unknown calls!'
                    : 'Turn it on to manage unknown calls.'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: assistantOn }}
                accessibilityLabel="AI Assistant"
                onPress={() => setAssistantOn(on => !on)}
                style={[styles.switchTrack, assistantOn && styles.switchTrackOn]}
              >
                <View style={styles.switchThumb} />
              </Pressable>
            </LinearGradient>

            {TELL_ROWS.map((row, index) => (
              <MenuRow
                key={row.title}
                row={row}
                divider={index < TELL_ROWS.length - 1}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>ABOUT YOU</Text>
          <View style={styles.card}>
            <MenuRow row={ADDRESS_ROW} divider={false} />
          </View>

          <Text style={styles.sectionLabel}>SETTINGS & SUPPORT</Text>
        </ScrollView>

        <EditProfileSheet
          visible={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          name={formName}
          onChangeName={setFormName}
          email={formEmail}
          onChangeEmail={setFormEmail}
          phone={formPhone}
          onChangePhone={setFormPhone}
          avatarUri={formAvatar}
          isEmailLocked={hasEmail}
          isPhoneLocked={hasPhone}
          hasChanges={hasProfileChanges}
          isSaving={isUpdatingProfile || isUpdatingAvatar}
          onChoosePhoto={handleChoosePhoto}
          onTakePhoto={handleTakePhoto}
          onSave={handleSaveProfile}
        />
      </SafeAreaView>
    </View>
  );
};

type MenuItem = {
  title: string;
  subtitle: string;
  badge?: boolean;
  icon: 'doc' | 'health' | 'silent' | 'globe' | 'mic' | 'pin';
};

const TELL_ROWS: MenuItem[] = [
  {
    title: 'Your Instructions',
    subtitle: 'Tell Equal what to do',
    badge: true,
    icon: 'doc',
  },
  {
    title: 'Assistant Health Check',
    subtitle: 'Check Real-Time Assistant Connectivity',
    icon: 'health',
  },
  {
    title: 'Silent Mode',
    subtitle: 'Mute unwanted calls automatically',
    icon: 'silent',
  },
  {
    title: 'Call Handling',
    subtitle: 'Choose whose calls I answer',
    badge: true,
    icon: 'globe',
  },
  {
    title: 'Voice & Language',
    subtitle: 'Choose how Equal speaks.',
    icon: 'mic',
  },
];

const ADDRESS_ROW: MenuItem = {
  title: 'Your Addresses',
  subtitle: 'Add addresses your assistant should know',
  badge: true,
  icon: 'pin',
};

const MenuRow = ({ row, divider }: { row: MenuItem; divider: boolean }) => (
  <View style={[styles.menuRow, divider && styles.menuDivider]}>
    <View style={styles.menuIcon}>
      <RowIcon name={row.icon} />
    </View>
    <View style={styles.menuCopy}>
      <View style={styles.menuTitleRow}>
        <Text style={styles.menuTitle}>{row.title}</Text>
        {row.badge ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.menuSubtitle}>{row.subtitle}</Text>
    </View>
    <ChevronIcon />
  </View>
);

const iconStroke = '#2A2A2A';

const RowIcon = ({ name }: { name: MenuItem['icon'] }) => {
  if (name === 'doc') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M7 3.8h7.2L19 8.6V20a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 20V5A1.2 1.2 0 0 1 7 3.8Z"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <Path
          d="M14 3.8V8.4h5.2M8.4 12.2h7.2M8.4 15.6h7.2"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'health') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.2 4.2h7.6A2.2 2.2 0 0 1 18 6.4v11.2a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 17.6V6.4a2.2 2.2 0 0 1 2.2-2.2Z"
          stroke={iconStroke}
          strokeWidth={1.6}
        />
        <Path
          d="M12 8.2v6.2M8.9 11.3h6.2"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'silent') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6.2 9.4a5.8 5.8 0 0 1 9.4-4.5M17.6 9.4V10a5.6 5.6 0 0 1-.7 2.7M10.2 18.4a2 2 0 0 0 3.6 0M5 5.2l14 14"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'globe') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="8" stroke={iconStroke} strokeWidth={1.6} />
        <Path
          d="M4 12h16M12 4c2.2 2.4 3.2 5.1 3.2 8S14.2 17.6 12 20c-2.2-2.4-3.2-5.1-3.2-8S9.8 6.4 12 4Z"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (name === 'mic') {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.2a2.8 2.8 0 0 0-2.8 2.8v4.2a2.8 2.8 0 0 0 5.6 0V7A2.8 2.8 0 0 0 12 4.2Z"
          stroke={iconStroke}
          strokeWidth={1.6}
        />
        <Path
          d="M7.2 11.2a4.8 4.8 0 0 0 9.6 0M12 16v3.2"
          stroke={iconStroke}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s6.2-5.1 6.2-9.2A6.2 6.2 0 0 0 12 5.6a6.2 6.2 0 0 0-6.2 6.2C5.8 15.9 12 21 12 21Z"
        stroke={iconStroke}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="11.6" r="1.8" stroke={iconStroke} strokeWidth={1.6} />
    </Svg>
  );
};

const PencilIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 16.8V20h3.2L18.6 8.6 15.4 5.4 4 16.8Z"
      stroke="#8A8A8A"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="m13.8 7 3.2 3.2"
      stroke="#8A8A8A"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
      stroke="#B0B0B0"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RobotIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
    <Path d="M16 4.2v2.4" stroke="#7C3AED" strokeWidth={1.6} strokeLinecap="round" />
    <Circle cx="16" cy="3.6" r="1.2" fill="#7C3AED" />
    <Path
      d="M8.2 12.2h15.6a3 3 0 0 1 3 3v7.2a3 3 0 0 1-3 3H8.2a3 3 0 0 1-3-3v-7.2a3 3 0 0 1 3-3Z"
      fill="#7C3AED"
    />
    <Circle cx="12.4" cy="17.2" r="1.5" fill="#FFFFFF" />
    <Circle cx="19.6" cy="17.2" r="1.5" fill="#FFFFFF" />
    <Path
      d="M12.2 21.2h7.6"
      stroke="#FFFFFF"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6F3FF',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingTop: 8,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E4D8FF',
  },

  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarInitial: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
    includeFontPadding: false,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  name: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.6,
    color: colors.equalInk,
    includeFontPadding: false,
  },

  phone: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    color: '#8A8A8A',
    includeFontPadding: false,
  },

  sectionLabel: {
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 20,
    fontFamily: fonts.semibold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1.1,
    color: '#6A6A6A',
    includeFontPadding: false,
  },

  card: {
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: colors.white,
    overflow: 'hidden',
    paddingBottom: 4,
  },

  assistantBanner: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 4,
    minHeight: 72,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  assistantCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  assistantTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.equalInk,
    includeFontPadding: false,
  },

  assistantSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#6E6E6E',
    includeFontPadding: false,
  },

  switchTrack: {
    width: 50,
    height: 30,
    borderRadius: 999,
    backgroundColor: '#D5D5D5',
    padding: 3,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  switchTrackOn: {
    backgroundColor: colors.primary,
    alignItems: 'flex-end',
  },

  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },

  menuRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  menuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },

  menuIcon: {
    width: 28,
    alignItems: 'center',
  },

  menuCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },

  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  menuTitle: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
    color: colors.equalInk,
    includeFontPadding: false,
  },

  menuSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A8A8A',
    includeFontPadding: false,
  },

  newBadge: {
    minHeight: 18,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  newBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.4,
    color: colors.white,
    includeFontPadding: false,
  },
});
