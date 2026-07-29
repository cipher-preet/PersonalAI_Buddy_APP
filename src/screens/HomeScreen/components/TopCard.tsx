import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;

  icon: React.ReactNode;
  rightIcon?: React.ReactNode;

  color: string;
  active?: boolean;
  activeColor?: string;
  onPress?: () => void;
};

const TopCard = ({
  title,
  subtitle,
  icon,
  rightIcon,
  color,
  active = false,
  activeColor = '#15C7E8',
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[
        styles.card,
        active && {
          backgroundColor: '#ECFEFF',
          borderColor: activeColor,
          shadowColor: activeColor,
          shadowOpacity: 0.14,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.topSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: active ? activeColor : color,
            },
          ]}
        >
          {icon}
        </View>

        {active ? (
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        ) : null}

        {rightIcon && !active ? (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        ) : null}
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.title, active && styles.titleActive]}
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.subtitle, active && styles.subtitleActive]}
        >
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TopCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F4FB',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },

  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  iconWrapper: {
    width: 42,
    height: 42,

    borderRadius: 21,

    justifyContent: 'center',
    alignItems: 'center',
  },

  rightIconContainer: {
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A5F3FC',
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0E7490',
    letterSpacing: 0.3,
  },

  content: {
    marginTop: 28,
  },

  title: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  titleActive: {
    color: '#0E7490',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
    paddingRight: 8,
  },

  subtitleActive: {
    color: '#0891B2',
  },
});
