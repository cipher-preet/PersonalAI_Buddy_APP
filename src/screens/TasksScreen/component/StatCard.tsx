import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { COLORS } from '../component/styles/color';

import { CalenderIcon, DoubleTick, HomeIcon, PriorityIcon } from '../../../../styles/icons';

type Props = {
  item: {
    title: string;
    value: string;
    icon: string;
  };
};

const StatCard = ({ item }: Props) => {
  const renderIcon = () => {
    switch (item.icon) {
      case 'calendar':
        return <CalenderIcon width={18} height={18} />;

      case 'flash':
        return <PriorityIcon width={18} height={18} />;

      case 'check':
        return <DoubleTick />;

      default:
        return <DoubleTick />;
    }
  };

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconBox}>{renderIcon()}</View>

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.value}>{item.value}</Text>
    </TouchableOpacity>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.purpleLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '600',
  },

  value: {
    color: COLORS.black,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
});
