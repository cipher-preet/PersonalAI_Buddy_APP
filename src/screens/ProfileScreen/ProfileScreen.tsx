import React, { useCallback, useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import ProfileCard from './components/ProfileCard';
import ProfileActionGrid from './components/ProfileActionGrid';
import EditProfileSheet from './components/EditProfileSheet';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import {
  useLazyCheckAuthQuery,
  useUpdateProfileAvatarMutation,
  useUpdateProfileMutation,
} from '../../store/api/auth';
import { updateProfileSuccess } from '../../store/slices/authSlice';
import { useToast } from '../../store/context/ToastContext';
import { colors, ms, spacing } from '../../theme';
import BrandLogo from '../../components/BrandLogo';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { tabBarClearance, screenPadding, contentMaxWidth, isTablet } =
    useResponsiveLayout();
  const { userId: storedUserId, name, email, phone, avatar } = useAppSelector(
    state => state.auth,
  );
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
  const {
    data: planStatusData,
    isLoading: isLoadingPlanStatus,
    isError: isPlanStatusError,
    refetch: refetchPlanStatus,
  } = useGetPlanStatusQuery({ userId }, { skip: !userId });

  const [fetchProfile] = useLazyCheckAuthQuery();

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        return;
      }

      refetchPlanStatus();

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
    }, [dispatch, fetchProfile, refetchPlanStatus, userId]),
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

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: tabBarClearance,
              paddingHorizontal: screenPadding,
              maxWidth: isTablet ? contentMaxWidth : undefined,
              width: '100%',
              alignSelf: 'center',
            },
          ]}
        >
          <ProfileCard
            name={name}
            email={email}
            phone={phone}
            avatar={avatar}
            planName={planStatusData?.plan?.name}
            onEditPress={() => setIsEditOpen(true)}
          />
          <ProfileActionGrid
            planStatus={planStatusData}
            isPlanLoading={isLoadingPlanStatus}
            isPlanError={isPlanStatusError}
            onEditProfile={() => setIsEditOpen(true)}
          />
          <BrandLogo
            size={ms(36)}
            showWordmark
            showTagline
            style={styles.brandFooter}
          />
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

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingTop: spacing.sm,
  },

  brandFooter: {
    alignSelf: 'center',
    marginTop: spacing['4xl'],
    opacity: 0.9,
  },
});
