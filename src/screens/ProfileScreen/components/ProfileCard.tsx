import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  radii,
  spacing,
} from '../../../theme';

type ProfileCardProps = {
  name?: string | null;
  email?: string | null;
  phone?: string | number | null;
  avatar?: string | null;
  planName?: string;
  isPlanLoading?: boolean;
  isPlanError?: boolean;
  onEditPress: () => void;
};

const PencilIcon = ({ color = colors.white }: { color?: string }) => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20h9M4.5 17.5 17 5l2 2L6.5 19.5 3 21l1.5-3.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MailIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 6.5h16v11H4v-11Z"
      stroke={colors.muted}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
    <Path
      d="m4 7 8 6 8-6"
      stroke={colors.muted}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={ms(14)} height={ms(14)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8.2 4.8c.4-.8 1.4-1.1 2.1-.6l1.6 1.1c.7.5.9 1.4.4 2.1l-.8 1.2a1.6 1.6 0 0 0 .2 2l2.7 2.7c.5.5 1.3.6 2 .2l1.2-.8c.7-.5 1.6-.3 2.1.4l1.1 1.6c.5.7.2 1.7-.6 2.1l-1.5.8c-1 .5-2.2.4-3.2-.2-2.3-1.4-4.4-3.5-5.8-5.8-.6-1-.7-2.2-.2-3.2l.8-1.5Z"
      stroke={colors.muted}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileCard = ({
  name,
  email,
  phone,
  avatar,
  planName,
  isPlanLoading,
  isPlanError,
  onEditPress,
}: ProfileCardProps) => {
  const displayName = name?.trim() || 'Buddy User';
  const displayEmail = email?.trim() || 'No email added';
  const displayPhone = phone
    ? `+91 ${String(phone)}`
    : 'No mobile number added';
  const avatarUri = avatar?.trim();
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const displayPlan = isPlanLoading
    ? 'Loading'
    : isPlanError
      ? 'Unavailable'
      : planName?.trim() || 'Free';

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <LinearGradient
          colors={[colors.primary, colors.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardAccent}
        />

        <View style={styles.body}>
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.avatarFrame}
              activeOpacity={0.85}
              onPress={onEditPress}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.image} />
              ) : (
                <View style={styles.fallbackAvatar}>
                  <Text style={styles.fallbackAvatarText}>{avatarInitial}</Text>
                </View>
              )}
              <View style={styles.editPhotoBadge}>
                <PencilIcon />
              </View>
            </TouchableOpacity>

            <View style={styles.identity}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>

              <View style={styles.planBadge}>
                <View style={styles.planDot} />
                <Text style={styles.planLabel}>Plan</Text>
                <Text style={styles.planValue}>{displayPlan}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <MailIcon />
              <Text style={styles.metaText} numberOfLines={1}>
                {displayEmail}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <PhoneIcon />
              <Text style={styles.metaText} numberOfLines={1}>
                {displayPhone}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.editButton}
            onPress={onEditPress}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <PencilIcon color={colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing['3xl'],
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radii['3xl'],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  cardAccent: {
    height: ms(4),
    width: '100%',
  },

  body: {
    padding: spacing['2xl'],
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xl'],
  },

  avatarFrame: {
    position: 'relative',
  },

  image: {
    width: ms(76),
    height: ms(76),
    borderRadius: ms(24),
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
  },

  fallbackAvatar: {
    width: ms(76),
    height: ms(76),
    borderRadius: ms(24),
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fallbackAvatarText: {
    color: colors.white,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },

  editPhotoBadge: {
    position: 'absolute',
    right: -ms(2),
    bottom: -ms(2),
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },

  identity: {
    flex: 1,
    gap: spacing.md,
    minWidth: 0,
  },

  name: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },

  planBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },

  planDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primary,
  },

  planLabel: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },

  planValue: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },

  metaList: {
    marginTop: spacing['2xl'],
    gap: spacing.md,
    paddingTop: spacing['2xl'],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  metaText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.subText,
    fontWeight: fontWeight.medium,
  },

  editButton: {
    marginTop: spacing['2xl'],
    minHeight: ms(42),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.borderFocus,
  },

  editButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
