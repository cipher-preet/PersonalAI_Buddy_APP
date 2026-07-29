import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import BulletPoint from './BulletPoint';
import { COLORS } from '../styles';

type Props = {
  text?: string;
  bullets?: string[];
  time?: string;
};

const AIMessage = ({ text, bullets, time }: Props) => {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        {text ? <Text style={styles.text}>{text}</Text> : null}

        {bullets?.map((item, index) => (
          <BulletPoint key={index} text={item} />
        ))}

        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>
    </View>
  );
};

export default AIMessage;

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    alignItems: 'flex-start',
  },

  bubble: {
    maxWidth: '88%',
    backgroundColor: COLORS.aiBubble,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  text: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },

  time: {
    marginTop: 8,
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
  },
});
