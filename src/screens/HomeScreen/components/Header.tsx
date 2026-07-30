import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type TabParamList = {
  Home: undefined;
  Notes: undefined;
  Tasks: undefined;
  AI: undefined;
  Profile: undefined;
  Plans: undefined;
};

const PlanPurchaseIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 7.5 10.2 4l2.2 3.5L16 5.8l-1.2 5.7H5.2L4 5.8l3.6 1.7Z"
      stroke="#4338CA"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect
      x={4}
      y={13}
      width={16}
      height={7}
      rx={2}
      stroke="#4338CA"
      strokeWidth={1.8}
    />
    <Path d="M4 16h16" stroke="#4338CA" strokeWidth={1.8} />
  </Svg>
);

const Header = () => {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

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
          accessibilityRole="button"
          accessibilityLabel="Open plans and payment"
          onPress={() => navigation.navigate('Plans')}
        >
          <PlanPurchaseIcon />
        </TouchableOpacity>

        {/* <TouchableOpacity activeOpacity={0.85} style={styles.settingsButton}>
          <PlanPurchaseIcon />
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
    color: '#6B7280',
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.6,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FBFBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E8EDF9',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
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
