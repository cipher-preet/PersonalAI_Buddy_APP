import React, { useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';

import { categories } from '../TaskScreen';
import { COLORS } from './styles/color';

const CategoryTabs = () => {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? 'all');

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {categories.map(item => {
          const isActive = item.id === activeId;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveId(item.id)}
            >
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
              <Text style={[styles.count, isActive && styles.activeCount]}>
                {item.count} tasks
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
  },

  container: {
    paddingRight: 4,
    gap: 10,
  },

  tab: {
    minWidth: 132,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  label: {
    color: COLORS.black,
    fontWeight: '700',
    fontSize: 14,
  },

  activeLabel: {
    color: COLORS.white,
  },

  count: {
    marginTop: 4,
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 12,
  },

  activeCount: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
