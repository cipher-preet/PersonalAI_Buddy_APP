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
  phone?: string | number | null;
  avatar?: string | null;
  planName?: string;
  isPlanLoading?: boolean;
  isPlanError?: boolean;
  notesCount?: string;
  tasksCount?: string;
  spacesCount?: string;
  onEditPress: () => void;
};

const PencilIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(13)} height={ms(13)} viewBox="0 0 24 24" fill="none">
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
  isPlanLoading,
  isPlanError,
  notesCount = '0',
  tasksCount = '0',
  spacesCount = '0',
  onEditPress,
}: ProfileCardProps) => {
  const displayName = name?.trim() || 'Buddy User';
  const displayEmail = email?.trim() || 'No email added';
  const displayPhone = phone ? `+91 ${String(phone)}` : null;
  const avatarUri = avatar?.trim();
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const displayPlan = isPlanLoading
    ? 'Loading'
    : isPlanError
      ? 'Unavailable'
      : planName?.trim() || 'Free';

  const stats = [
    { id: 'notes', value: notesCount, label: 'Notes' },
    { id: 'tasks', value: tasksCount, label: 'Tasks' },
    { id: 'spaces', value: spacesCount, label: 'Spaces' },
  ];

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.avatarRing}
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
      <Text style={styles.email} numberOfLines={1}>
        {displayEmail}
      </Text>
      {displayPhone ? (
        <Text style={styles.phone} numberOfLines={1}>
          {displayPhone}
        </Text>
      ) : null}

      <View style={styles.planPill}>
        <Text style={styles.planPillText}>{displayPlan} plan</Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map(stat => (
          <View key={stat.id} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  avatarRing: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    padding: ms(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(41),
  },

  fallbackAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: ms(41),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fallbackAvatarText: {
    color: colors.primaryDark,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
  },

  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: ms(28),
    height: ms(28),
    borderRadius: ms(14),
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
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

  email: {
    marginTop: spacing.xs,
    color: colors.subText,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  phone: {
    marginTop: spacing.xxs,
    color: colors.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  planPill: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },

  planPillText: {
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  statsRow: {
    marginTop: spacing.xl,
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  statValue: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.3,
  },

  statLabel: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
});
