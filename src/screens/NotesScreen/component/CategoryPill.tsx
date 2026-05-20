import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  item: string;
  active?: boolean;
  onPress?: () => void;
};

const CategoryPill = ({ item, active, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, active && styles.activeContainer]}
    >
      <Text style={[styles.text, active && styles.activeText]}>{item}</Text>
    </TouchableOpacity>
  );
};

export default CategoryPill;

const styles = StyleSheet.create({
  container: {
    height: 34,

    paddingHorizontal: 10,

    borderRadius: 17,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 10,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  activeContainer: {
    backgroundColor: '#8EC5B5',

    borderColor: '#8EC5B5',

    shadowColor: '#8EC5B5',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  text: {
    fontSize: 12.5,
    fontWeight: '700',

    color: '#6B7280',

    letterSpacing: -0.1,
  },

  activeText: {
    color: '#FFFFFF',
  },
});
