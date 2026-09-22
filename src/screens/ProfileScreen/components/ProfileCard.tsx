import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
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
  avatar?: string | null;
  onEditPress: () => void;
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
  avatar,
  onEditPress,
}: ProfileCardProps) => {
  const displayName = name?.trim() || 'Buddy User';
  const shortName = displayName.split(/\s+/)[0];
  const displayEmail = email?.trim() || 'No email added';
  const avatarUri = avatar?.trim();
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const metaLine = `${shortName} • ${displayEmail}`;

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

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.inviteButton}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Edit profile"
      >
        <Text style={styles.inviteButtonText}>Edit Profile</Text>
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

  inviteButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },

  inviteButtonText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
});
