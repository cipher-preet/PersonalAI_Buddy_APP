import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { Notification } from '../../../../styles/icons';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.greetingWrapper}>
          <Text style={styles.greetingText}>Good Evening</Text>

          <Text style={styles.wave}>👋</Text>

          <View style={styles.onlineDot} />
        </View>

        <Text style={styles.userName}>Preet Kumar</Text>
      </View>

      <View style={styles.actionContainer}>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.notificationButton}
        >
          <Notification width={19} height={19} />
        </TouchableOpacity>

        {/* <TouchableOpacity activeOpacity={0.85} style={styles.settingsButton}>
          <Notification width={18} height={18} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContainer: {
    flex: 1,
  },

  greetingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  greetingText: {
    fontSize: 13,

    color: '#7F8A9F',

    fontWeight: '400',

    letterSpacing: 0.3,
  },

  wave: {
    marginLeft: 5,

    fontSize: 13,
  },

  onlineDot: {
    width: 6,
    height: 6,

    borderRadius: 20,

    backgroundColor: '#08C7FA',

    marginLeft: 8,
  },

  userName: {
    marginTop: 7,

    fontSize: 16,

    fontWeight: '600',

    color: '#111827',

    letterSpacing: -0.8,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#AEB8C5',
    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.1,
    shadowRadius: 12,

    elevation: 5,
  },

  settingsButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#5B5FF8',

    shadowColor: '#5B5FF8',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.28,
    shadowRadius: 14,

    elevation: 8,
  },
});
