import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { GreatorThan, HomeIcon } from '../../../../styles/icons';

type Props = {
  title: string;
  action?: string;
};

const SectionHeader = ({ title, action }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.indicator} />

        <Text style={styles.title}>{title}</Text>
      </View>

      {action ? (
        <TouchableOpacity activeOpacity={0.8} style={styles.actionButton}>
          <Text style={styles.actionText}>{action}</Text>

          <GreatorThan width={18} height={18} color="#000000" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  indicator: {
    width: 6,
    height: 6,
    borderRadius: 20,

    backgroundColor: '#8EC5B5',

    marginRight: 8,
  },

  title: {
    fontSize: 17,

    fontWeight: '700',

    color: '#1E293B',

    letterSpacing: -0.2,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 12,

    borderWidth: 1,
    borderColor: '#E7EDF3',
  },

  actionText: {
    fontSize: 12,
    fontWeight: '600',

    color: '#6FAE9D',

    marginRight: 3,
  },
});
