import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


import { AddSpace, HomeIcon, MicIcon, UpArrowIcon } from '../../../../styles/icons';

const BottomInput = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <AddSpace width={20} height={20} color="#000000"
 />
      </TouchableOpacity>

      <TextInput
        placeholder="Ask your assistant..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <TouchableOpacity style={styles.micButton}>
        <MicIcon width={18} height={18} color="#000000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendButton}>
        <UpArrowIcon width={18} height={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default BottomInput;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 100,

    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 18,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,

  },

  input: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    color: '#111827',
  },

  micButton: {
    marginRight: 14,
  },

  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#7B4DFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});