import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { HomeIcon } from '../../../../styles/icons';

import { COLORS } from '../styles/colors';

const settings = [
  {
    title: 'Account',
    sub: 'Personal info, email',
    icon: 'person-outline',
  },
  {
    title: 'Privacy',
    sub: 'Security, data',
    icon: 'lock-closed-outline',
  },
  {
    title: 'Notifications',
    sub: 'Push, email alerts',
    icon: 'notifications-outline',
  },
];

const SettingsList = () => {
  return (
    <View>
      <Text style={styles.heading}>Settings</Text>

      {settings.map((item, index) => (
        <TouchableOpacity key={index} style={styles.card}>
          <View style={styles.left}>
            <View style={styles.iconBox}>
              <HomeIcon color={COLORS.primary} />
            </View>

            <View>
              <Text style={styles.title}>{item.title}</Text>

              <Text style={styles.sub}>{item.sub}</Text>
            </View>
          </View>

          <HomeIcon color="#C7C7CC" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SettingsList;

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,

    marginBottom: 14,
  },

  card: {
    backgroundColor: COLORS.white,

    borderRadius: 18,

    padding: 16,

    marginBottom: 12,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 42,
    height: 42,

    borderRadius: 14,

    backgroundColor: COLORS.lightPurple,

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 12,
  },

  title: {
    fontWeight: '700',
    color: COLORS.text,
  },

  sub: {
    marginTop: 2,

    fontSize: 12,
    color: COLORS.subText,
  },
});
