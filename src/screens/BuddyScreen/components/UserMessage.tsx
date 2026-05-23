import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const UserMessage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        I need to prepare for the marketing meeting tomorrow.
        What are the key points?
      </Text>
    </View>
  );
};

export default UserMessage;

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    maxWidth: '82%',
  },

  text: {
    fontSize: 14,
    lineHeight: 24,
    color: '#111827',
  },
});