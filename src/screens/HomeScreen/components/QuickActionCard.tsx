import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;

  icon: React.ReactNode;

  color?: string;
};

const QuickActionCard = ({ title, icon, color }: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: `${color}12`,
            },
          ]}
        >
          {icon}
        </View>
      </View>

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;

const styles = StyleSheet.create({
  card: {
    width: 82,
    alignItems: 'center',
    marginRight: 10,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F4FB',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },

  iconWrapper: {
    width: 34,
    height: 34,

    borderRadius: 12,

    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.2,
  },
});
