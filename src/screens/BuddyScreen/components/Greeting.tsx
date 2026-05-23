import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const Greeting = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        How can I help you today,{'\n'}Preet?
      </Text>
    </View>
  );
};

export default Greeting;

const styles = StyleSheet.create({
  container: {
    marginTop: 34,
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 38,
  },
});