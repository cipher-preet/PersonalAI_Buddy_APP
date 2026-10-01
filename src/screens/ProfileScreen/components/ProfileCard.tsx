import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
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
  planName?: string | null;
  onEditPress: () => void;
};

const formatPhone = (phone?: string | number | null) => {
  const digits = phone == null ? '' : String(phone).replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  return String(phone);
};

const PencilIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(12)} height={ms(12)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20h9M4.5 17.5 17 5l2 2L6.5 19.5 3 21l1.5-3.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
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
  onEditPress,
}: ProfileCardProps) => {
  const displayName = name?.trim() || 'Buddy User';
  const avatarUri = avatar?.trim();
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const contactParts = [email?.trim(), formatPhone(phone)].filter(Boolean);
  const metaLine = contactParts.length
    ? contactParts.join(' • ')
    : 'Add your email or phone';
  const planLabel = planName?.trim();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.avatarWrap}
        activeOpacity={0.85}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.fallbackAvatar}>
            <Text style={styles.fallbackAvatarText}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <PencilIcon />
        </View>
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {metaLine}
      </Text>
      {planLabel ? (
        <View style={styles.planBadge}>
          <Text style={styles.planBadgeText}>{planLabel} plan</Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.inviteButton}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <LinearGradient
          colors={[
            colors.upgradeGradientStart,
            colors.upgradeGradientMid,
            colors.upgradeGradientEnd,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inviteButtonGradient}
        >
          <Text style={styles.inviteButtonText}>Edit Profile</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  avatarWrap: {
    width: ms(96),
    height: ms(96),
    borderRadius: ms(48),
    marginBottom: spacing.xl,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(48),
    backgroundColor: colors.lightGray,
  },

  fallbackAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(48),
    backgroundColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fallbackAvatarText: {
    color: colors.white,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
  },

  editBadge: {
    position: 'absolute',
    top: ms(2),
    right: ms(2),
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    color: colors.text,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  meta: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  planBadge: {
    marginTop: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: ms(3),
  },

  planBadgeText: {
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },

  inviteButton: {
    marginTop: spacing.xl,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },

  inviteButtonGradient: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
  },

  inviteButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
