import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

import ActionButton from '../components/ActionButton'

const ChatActions = () => {
  return (
    <>
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreText}>•••</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <ActionButton title="Tell me more" />

        <ActionButton title="Create a task from this" />
      </View>
    </>
  );
};

export default ChatActions;

const styles = StyleSheet.create({
  moreButton: {
    width: 52,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },

  moreText: {
    fontSize: 18,
    color: '#6B7280',
  },

  row: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
});