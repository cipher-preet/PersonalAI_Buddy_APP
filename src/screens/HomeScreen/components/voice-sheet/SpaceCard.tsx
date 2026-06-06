import React from 'react';

import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const SpaceCard = ({ item, selected, onPress }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.card, selected && styles.selectedCard]}
    >
      <View style={[styles.circle, selected && styles.selectedCircle]} />

      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {item.spacename}
        </Text>

        <Text numberOfLines={2} style={styles.description}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default SpaceCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    paddingVertical: 14,
    paddingHorizontal: 16,

    marginBottom: 12,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: '#ECEFF3',
  },

  selectedCard: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F7FF',
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 18,

    borderWidth: 1.8,
    borderColor: '#CBD5E1',

    marginTop: 2,
  },

  selectedCircle: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },

  content: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 15,
    fontWeight: '600',

    color: '#111827',
  },

  description: {
    marginTop: 4,

    fontSize: 13,
    lineHeight: 18,

    color: '#6B7280',
  },
});
