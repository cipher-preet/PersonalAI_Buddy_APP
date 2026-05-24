import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  subtitle: string;

  icon: React.ReactNode;
  rightIcon?: React.ReactNode;

  color: string;
  onPress?: () => void;
};

const TopCard = ({ title, subtitle, icon, rightIcon, color, onPress }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.topSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: color,
            },
          ]}
        >
          {icon}
        </View>

        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </View>

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <Text numberOfLines={2} style={styles.subtitle}>
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

    borderRadius: 24,

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,

    borderWidth: 1,
    borderColor: '#EEF2F6',

    shadowColor: '#B8C2D1',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.08,
    shadowRadius: 14,

    elevation: 5,
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

  content: {
    marginTop: 32,
  },

  title: {
    fontSize: 15,

    color: '#111827',

    fontWeight: '700',

    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 6,

    fontSize: 12,

    color: '#8A94A6',

    fontWeight: '500',

    lineHeight: 18,

    paddingRight: 8,
  },
});
