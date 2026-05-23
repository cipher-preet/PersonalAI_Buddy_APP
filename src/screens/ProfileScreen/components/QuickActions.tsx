import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { HomeIcon } from '../../../../styles/icons';

import { COLORS } from '../styles/colors';

const actions = [
  {title: 'Tasks', icon: 'create-outline'},
  {title: 'Projects', icon: 'folder-outline'},
  {title: 'Notes', icon: 'document-text-outline'},
  {title: 'Analytics', icon: 'pie-chart-outline'},
  {title: 'AI Assistant', icon: 'sparkles-outline'},
  {title: 'Team', icon: 'people-outline'},
];

const QuickActions = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.heading}>
        Quick Actions
      </Text>

      <View style={styles.grid}>
        {actions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}>
            
            <View style={styles.iconBox}>
              <HomeIcon
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.title}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default QuickActions;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },

  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,

    marginBottom: 14,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '31%',

    backgroundColor: COLORS.white,

    borderRadius: 18,

    paddingVertical: 20,

    alignItems: 'center',

    marginBottom: 12,
  },

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: COLORS.lightPurple,

    justifyContent: 'center',
    alignItems: 'center',

    marginBottom: 10,
  },

  title: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
});