import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import BulletPoint from '../components/BulletPoint';

const AIMessage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Here's a quick summary for tomorrow's marketing meeting:
      </Text>

      <BulletPoint text="Q3 Campaign Review: Analyzing the ROI of the recent social push." />

      <BulletPoint text="Budget Allocation: Discussing the shift towards influencer partnerships." />

      <BulletPoint text="New Product Launch: Finalizing the messaging framework." />
    </View>
  );
};

export default AIMessage;

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },

  heading: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
    marginBottom: 18,
  },
});