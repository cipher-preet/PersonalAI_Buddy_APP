import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { useAppDispatch } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';
import { useToast } from '../../../store/context/ToastContext';
import { COLORS } from '../styles/colors';

type IconProps = {
  color?: string;
};

type ActionItem = {
  id: string;
  title: string;
  value?: string;
  tone: 'primary' | 'danger';
  accent: string;
  surface: string;
  icon: (props: IconProps) => React.ReactNode;
  onPress: () => void;
};

const PlanIcon = ({ color = COLORS.primary }: IconProps) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 8h7M8.5 12h7M8.5 16h4"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
    />
  </Svg>
);

const LogoutIcon = ({ color = '#DC2626' }: IconProps) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15 12H4M7.5 8.5 4 12l3.5 3.5"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaskGridIcon = ({ color = COLORS.primary }: IconProps) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6h10M9 12h10M9 18h10"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
    />
    <Path
      d="m4 6 1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const NotesGridIcon = ({ color = COLORS.primary }: IconProps) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 3v5h5M8.5 13h7M8.5 17h4"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SpacesGridIcon = ({ color = COLORS.primary }: IconProps) => (
  <Svg width={21} height={21} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7.5V6.2A2.2 2.2 0 0 1 6.2 4h1.3M4 16.5v1.3A2.2 2.2 0 0 0 6.2 20h1.3M15.5 4h1.3A2.2 2.2 0 0 1 19 6.2v1.3M15.5 20h1.3A2.2 2.2 0 0 0 19 17.8v-1.3M8.5 12h7M12 8.5v7"
      stroke={color}
      strokeWidth={1.45}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ProfileActionGrid = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleLogout = () => {
    dispatch(logout());
    showToast({ message: 'Signed out successfully', type: 'success' });
  };

  const actions: ActionItem[] = [
    {
      id: 'notes',
      title: 'Notes',
      value: '86',
      tone: 'primary',
      accent: '#059669',
      surface: '#ECFDF5',
      icon: NotesGridIcon,
      onPress: () => navigation.navigate('Notes'),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      value: '124',
      tone: 'primary',
      accent: '#2563EB',
      surface: '#EFF6FF',
      icon: TaskGridIcon,
      onPress: () => navigation.navigate('Tasks'),
    },
    {
      id: 'spaces',
      title: 'Spaces',
      value: '8',
      tone: 'primary',
      accent: '#7C3AED',
      surface: '#F5F3FF',
      icon: SpacesGridIcon,
      onPress: () => navigation.navigate('Home'),
    },
    {
      id: 'plans',
      title: 'Plan',
      value: 'Pro',
      tone: 'primary',
      accent: COLORS.primary,
      surface: '#EEF2FF',
      icon: PlanIcon,
      onPress: () => navigation.navigate('Plans'),
    },
    {
      id: 'logout',
      title: 'Logout',
      tone: 'danger',
      accent: '#DC2626',
      surface: '#FEF2F2',
      icon: LogoutIcon,
      onPress: handleLogout,
    },
  ];

  const primaryActions = actions.filter(item => item.id !== 'logout');
  const logoutAction = actions.find(item => item.id === 'logout');

  const renderTile = (item: ActionItem, tileStyle?: object) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.82}
      style={[
        styles.tile,
        tileStyle,
        item.tone === 'danger' && styles.dangerCard,
      ]}
      onPress={item.onPress}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: item.surface,
          },
        ]}
      >
        {item.icon({ color: item.accent })}
      </View>
      <Text numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>
      {item.value ? (
        <Text
          numberOfLines={1}
          style={[
            styles.value,
            item.tone === 'danger' && styles.dangerValue,
          ]}
        >
          {item.value}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.grid}>
        {primaryActions.map(item => renderTile(item))}
      </View>
      {logoutAction ? (
        <View style={styles.secondRow}>
          {renderTile(logoutAction, styles.logoutTile)}
        </View>
      ) : null}
    </View>
  );
};

export default ProfileActionGrid;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },

  secondRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  logoutTile: {
    flex: 0,
    width: '23%',
  },

  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
  },

  dangerCard: {
    shadowColor: '#64748B',
    shadowOpacity: 0.035,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  value: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },

  dangerValue: {
    color: '#DC2626',
  },

  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
});
