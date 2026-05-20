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
    width: 84,

    alignItems: 'center',

    marginRight: 4,
  },

  iconContainer: {
    width: 58,
    height: 58,

    borderRadius: 18,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#EEF2F6',

    shadowColor: '#B7C1D1',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.07,
    shadowRadius: 12,

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
    marginTop: 10,

    fontSize: 11,

    fontWeight: '500',

    color: '#667085',

    letterSpacing: 0.1,
  },
});
