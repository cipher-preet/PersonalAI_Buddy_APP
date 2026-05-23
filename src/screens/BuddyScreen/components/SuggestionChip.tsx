import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  title: string;
};

const SuggestionChip = ({ title }: Props) => {
  return (
    <TouchableOpacity style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SuggestionChip;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
  },

  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
});