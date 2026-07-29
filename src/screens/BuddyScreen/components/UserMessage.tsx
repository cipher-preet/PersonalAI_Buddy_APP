import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../styles';

type Props = {
  text: string;
  time?: string;
};

const UserMessage = ({ text, time }: Props) => {
  return (
    <View style={styles.row}>
      <LinearGradient
        colors={['#6366F1', '#4338CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubble}
      >
        <Text style={styles.text}>{text}</Text>
        {time ? <Text style={styles.time}>{time}</Text> : null}
      </LinearGradient>
    </View>
  );
};

export default UserMessage;

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    alignItems: 'flex-end',
  },

  bubble: {
    maxWidth: '84%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.white,
    fontWeight: '500',
  },

  time: {
    marginTop: 6,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.78)',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
});
