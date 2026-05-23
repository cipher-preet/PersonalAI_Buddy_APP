import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { categories } from '../TaskScreen';
import { COLORS } from '../component/styles/color';

const CategoryTabs = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tab, index === 0 && styles.activeTab]}
        >
          <Text style={[styles.text, index === 0 && styles.activeText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },

  tab: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  text: {
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 12,
  },

  activeText: {
    color: COLORS.white,
  },
});
