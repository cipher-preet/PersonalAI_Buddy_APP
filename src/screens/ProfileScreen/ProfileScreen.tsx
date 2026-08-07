import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  Asset,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import ProfileHeader from './components/ProfileHeader';
import ProfileCard from './components/ProfileCard';
import ProfileActionGrid from './components/ProfileActionGrid';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGetProfileSummaryQuery } from '../../store/api/home';
import { useGetPlanStatusQuery } from '../../store/api/payments';
import {
  useUpdateProfileAvatarMutation,
  useUpdateProfileMutation,
} from '../../store/api/auth';
import { updateProfileSuccess } from '../../store/slices/authSlice';
import { useToast } from '../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../theme';

const CloseIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6l12 12M18 6 6 18"
      stroke={colors.textSecondary}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
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
    data: profileSummaryData,
    isFetching: isFetchingSummary,
    isError: isSummaryError,
  } = useGetProfileSummaryQuery({ userId }, { skip: !userId });
  const {
    data: planStatusData,
    isFetching: isFetchingPlanStatus,
    isError: isPlanStatusError,
  } = useGetPlanStatusQuery({ userId }, { skip: !userId });
  const currentPlanName = planStatusData?.plan?.name;

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
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.white]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ProfileHeader />
          <ProfileCard
            name={name}
            email={email}
            phone={phone}
            avatar={avatar}
            planName={currentPlanName}
            isPlanLoading={isFetchingPlanStatus}
            isPlanError={isPlanStatusError}
            onEditPress={() => setIsEditOpen(true)}
          />
          <ProfileActionGrid
            summary={profileSummaryData?.data}
            isLoading={isFetchingSummary}
            isError={isSummaryError}
            planName={currentPlanName}
            isPlanLoading={isFetchingPlanStatus}
            isPlanError={isPlanStatusError}
          />
        </ScrollView>

        <Modal
          visible={isEditOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditOpen(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalSubtitle}>
                    Keep your Buddy profile up to date.
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.closeButton}
                  onPress={() => setIsEditOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <CloseIcon />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalScroll}
              >
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Your name"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="words"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Profile image</Text>
                <View style={styles.photoEditor}>
                  {formAvatar ? (
                    <Image
                      source={{ uri: formAvatar }}
                      style={styles.photoPreview}
                    />
                  ) : (
                    <View style={styles.photoFallback}>
                      <Text style={styles.photoFallbackText}>
                        {(formName.trim() || 'B').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.photoButton}
                      onPress={handleChoosePhoto}
                    >
                      <Text style={styles.photoButtonText}>Upload Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={styles.photoButton}
                      onPress={handleTakePhoto}
                    >
                      <Text style={styles.photoButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="Add email address"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!hasEmail}
                  keyboardType="email-address"
                  style={[styles.input, hasEmail && styles.inputDisabled]}
                />

                <Text style={styles.inputLabel}>Mobile number</Text>
                <TextInput
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="Add mobile number"
                  placeholderTextColor={colors.muted}
                  editable={!hasPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={[styles.input, hasPhone && styles.inputDisabled]}
                />

                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isUpdatingProfile || isUpdatingAvatar}
                  style={[
                    styles.saveButton,
                    (isUpdatingProfile || isUpdatingAvatar) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveProfile}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryMid]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.saveGradient}
                  >
                    {isUpdatingProfile || isUpdatingAvatar ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    paddingBottom: layout.tabBarClearance,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: layout.screenPadding,
    backgroundColor: colors.backdrop,
  },

  modalCard: {
    maxHeight: '92%',
    borderRadius: radii['3xl'],
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing['3xl'],
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalScroll: {
    paddingBottom: spacing.md,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing['2xl'],
    gap: spacing.xl,
  },

  modalHeaderText: {
    flex: 1,
  },

  modalTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  modalSubtitle: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: ms(18),
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: colors.border,
  },

  inputLabel: {
    marginBottom: spacing.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.subText,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },

  input: {
    minHeight: ms(48),
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  inputDisabled: {
    color: colors.subText,
    backgroundColor: colors.lightGray,
  },

  photoEditor: {
    minHeight: ms(96),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },

  photoPreview: {
    width: ms(78),
    height: ms(78),
    borderRadius: ms(24),
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.inputBg,
  },

  photoFallback: {
    width: ms(78),
    height: ms(78),
    borderRadius: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primary,
  },

  photoFallbackText: {
    color: colors.white,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },

  photoActions: {
    flex: 1,
    gap: spacing.md,
  },

  photoButton: {
    minHeight: ms(42),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderFocus,
  },

  photoButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  saveButton: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },

  saveButtonDisabled: {
    opacity: 0.75,
  },

  saveGradient: {
    minHeight: ms(50),
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
});
