import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  emoji: string;
  title: string;
};

const ActionCard = ({ emoji, title }: Props) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{emoji}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionCard;

const styles = StyleSheet.create({
  container: {
    width: '48%',
    minHeight: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
  },
});