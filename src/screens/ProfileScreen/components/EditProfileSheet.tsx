import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type IconProps = { color?: string; size?: number };

const CloseIcon = ({ color = colors.textSecondary, size = 14 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 6l12 12M18 6 6 18"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
    />
  </Svg>
);

const UserIcon = ({ color = colors.subText, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
    <Path
      d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const MailIcon = ({ color = colors.subText, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={5}
      width={18}
      height={14}
      rx={3}
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="m4 7 8 6 8-6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({ color = colors.subText, size = 18 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={6}
      y={2.5}
      width={12}
      height={19}
      rx={3}
      stroke={color}
      strokeWidth={1.8}
    />
    <Path
      d="M10.5 18h3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const LockIcon = ({ color = colors.success, size = 12 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={5}
      y={10}
      width={14}
      height={11}
      rx={2.5}
      stroke={color}
      strokeWidth={2}
    />
    <Path
      d="M8 10V7a4 4 0 1 1 8 0v3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const CameraIcon = ({ color = colors.primary, size = 16 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-9Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={13} r={3.5} stroke={color} strokeWidth={1.8} />
  </Svg>
);

const GalleryIcon = ({ color = colors.primary, size = 16 }: IconProps) => (
  <Svg width={ms(size)} height={ms(size)} viewBox="0 0 24 24" fill="none">
    <Rect
      x={3}
      y={4}
      width={18}
      height={16}
      rx={3}
      stroke={color}
      strokeWidth={1.8}
    />
    <Circle cx={9} cy={9.5} r={1.8} stroke={color} strokeWidth={1.6} />
    <Path
      d="m4 17 5-4.5 3.5 3 3-2.5L20 17"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

type FieldProps = {
  label: string;
  icon: React.ComponentType<IconProps>;
  locked?: boolean;
  helper?: string;
} & Omit<TextInputProps, 'style' | 'editable'>;

const ProfileField = ({
  label,
  icon: Icon,
  locked = false,
  helper,
  onFocus,
  onBlur,
  ...inputProps
}: FieldProps) => {
  const [focused, setFocused] = useState(false);
  const iconColor = focused ? colors.primary : colors.muted;

  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {locked ? (
          <View style={styles.verifiedBadge}>
            <LockIcon />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.fieldSurface,
          focused && styles.fieldSurfaceFocused,
          locked && styles.fieldSurfaceLocked,
        ]}
      >
        <View style={styles.fieldIcon}>
          <Icon color={iconColor} />
        </View>
        <TextInput
          {...inputProps}
          editable={!locked}
          placeholderTextColor={colors.muted}
          style={[styles.fieldInput, locked && styles.fieldInputLocked]}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
      </View>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
    </View>
  );
};

type Props = {
  visible: boolean;
  onClose: () => void;
  name: string;
  onChangeName: (value: string) => void;
  email: string;
  onChangeEmail: (value: string) => void;
  phone: string;
  onChangePhone: (value: string) => void;
  avatarUri: string;
  isEmailLocked: boolean;
  isPhoneLocked: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onChoosePhoto: () => void;
  onTakePhoto: () => void;
  onSave: () => void;
};

const EditProfileSheet = ({
  visible,
  onClose,
  name,
  onChangeName,
  email,
  onChangeEmail,
  phone,
  onChangePhone,
  avatarUri,
  isEmailLocked,
  isPhoneLocked,
  hasChanges,
  isSaving,
  onChoosePhoto,
  onTakePhoto,
  onSave,
}: Props) => {
  const insets = useSafeAreaInsets();
  const initial = (name.trim() || 'B').charAt(0).toUpperCase();
  const saveDisabled = isSaving || !hasChanges;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Edit profile</Text>
              <Text style={styles.subtitle}>
                Update your photo and personal details.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.body}
          >
            <View style={styles.avatarSection}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onChoosePhoto}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <View style={styles.avatarRing}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  ) : (
                    <LinearGradient
                      colors={[colors.primary, colors.primaryMid]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarInitial}>{initial}</Text>
                    </LinearGradient>
                  )}
                </View>
                <View style={styles.avatarBadge}>
                  <CameraIcon color={colors.white} size={14} />
                </View>
              </TouchableOpacity>

              <View style={styles.photoActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.photoButton}
                  onPress={onChoosePhoto}
                >
                  <GalleryIcon />
                  <Text style={styles.photoButtonText}>Upload</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.photoButton}
                  onPress={onTakePhoto}
                >
                  <CameraIcon />
                  <Text style={styles.photoButtonText}>Take photo</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.photoHint}>JPG or PNG, square works best</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Personal information</Text>

            <ProfileField
              label="Full name"
              icon={UserIcon}
              value={name}
              onChangeText={onChangeName}
              placeholder="Your name"
              autoCapitalize="words"
              returnKeyType="next"
            />

            <ProfileField
              label="Email address"
              icon={MailIcon}
              value={email}
              onChangeText={onChangeEmail}
              placeholder="name@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              locked={isEmailLocked}
              helper={
                isEmailLocked
                  ? 'Linked to your sign-in and cannot be changed.'
                  : undefined
              }
            />

            <ProfileField
              label="Mobile number"
              icon={PhoneIcon}
              value={phone}
              onChangeText={onChangePhone}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              locked={isPhoneLocked}
              helper={
                isPhoneLocked
                  ? 'Linked to your sign-in and cannot be changed.'
                  : undefined
              }
            />
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing['2xl']) },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={saveDisabled}
              style={[styles.saveButton, saveDisabled && styles.saveDisabled]}
              onPress={onSave}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryMid]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveGradient}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.saveText}>Save changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfileSheet;

const AVATAR_SIZE = ms(92);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.backdrop,
  },

  sheet: {
    maxHeight: '92%',
    width: '100%',
    maxWidth: ms(560),
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    paddingTop: spacing.md,
  },

  grabber: {
    alignSelf: 'center',
    width: ms(40),
    height: ms(4),
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xl,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: spacing.xxs,
    fontSize: fontSize.md,
    color: colors.subText,
    lineHeight: ms(18),
  },

  closeButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
  },

  body: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing['2xl'],
  },

  avatarSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },

  avatarRing: {
    width: AVATAR_SIZE + ms(8),
    height: AVATAR_SIZE + ms(8),
    borderRadius: (AVATAR_SIZE + ms(8)) / 2,
    borderWidth: 2,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
  },

  avatarInitial: {
    color: colors.white,
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
  },

  avatarBadge: {
    position: 'absolute',
    right: ms(2),
    bottom: ms(2),
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
  },

  photoActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },

  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: layout.chipHeight,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.brandBorder,
  },

  photoButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  photoHint: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing['3xl'],
  },

  sectionTitle: {
    marginBottom: spacing.xl,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  field: {
    marginBottom: spacing['2xl'],
  },

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  fieldLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
  },

  verifiedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.successText,
  },

  fieldSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ms(50),
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
  },

  fieldSurfaceFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  fieldSurfaceLocked: {
    backgroundColor: colors.inputBg,
  },

  fieldIcon: {
    marginRight: spacing.lg,
  },

  fieldInput: {
    flex: 1,
    paddingVertical: spacing.lg,
    color: colors.text,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },

  fieldInputLocked: {
    color: colors.subText,
  },

  fieldHelper: {
    marginTop: spacing.sm,
    fontSize: fontSize.xs,
    color: colors.muted,
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: layout.screenPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },

  cancelButton: {
    flex: 1,
    minHeight: ms(50),
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  cancelText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },

  saveButton: {
    flex: 1.6,
    borderRadius: radii.md,
    overflow: 'hidden',
  },

  saveDisabled: {
    opacity: 0.5,
  },

  saveGradient: {
    flex: 1,
    minHeight: ms(50),
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
