import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import {
  GreatorThan,
  Notification,
  PrivacyShieldIcon,
  ProfileIcon,
} from '../../../../styles/icons';

import { COLORS } from '../styles/colors';
import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { useToast } from '../../../store/context/ToastContext';

const settings = [
  {
    title: 'Account',
    sub: 'Personal info, email',
    icon: <ProfileIcon color={COLORS.primary} />,
  },
  {
    title: 'Privacy',
    sub: 'Security, data',
    icon: <PrivacyShieldIcon color={COLORS.primary} />,
  },
  {
    title: 'Notifications',
    sub: 'Push, email alerts',
    icon: <Notification color={COLORS.primary} />,
  },
];

const SettingsList = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleLogout = () => {
    dispatch(logout());
    showToast({ message: 'Signed out successfully', type: 'success' });
  };

  return (
    <View>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.group}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              index < settings.length - 1 && styles.cardBorder,
            ]}
            activeOpacity={0.75}
          >
            <View style={styles.left}>
              <View style={styles.iconBox}>{item.icon}</View>
              <View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sub}>{item.sub}</Text>
              </View>
            </View>
            <GreatorThan color="#C7C7CC" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsList;

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },

  group: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  sub: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.subText,
    fontWeight: '500',
  },

  logoutButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
