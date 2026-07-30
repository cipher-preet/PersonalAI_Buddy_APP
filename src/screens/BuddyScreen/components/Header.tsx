import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { HistoryIcon } from '../../../../styles/icons';
import ChevronRightIcon from '../../../../styles/icons/GreatorThan';
import { COLORS } from '../styles';

type Props = {
  onHistoryPress?: () => void;
};

const Header = ({ onHistoryPress }: Props) => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.75}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <View style={styles.backIcon}>
          <ChevronRightIcon width={18} height={18} color="#111827" />
        </View>
      </TouchableOpacity>

      <View style={styles.center}>
        <Text style={styles.title}>Buddy AI</Text>
        <Text style={styles.subtitle}>Your personal assistant</Text>
      </View>

      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={0.75}
        onPress={onHistoryPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <HistoryIcon width={18} height={18} color="#111827" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.9)',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '180deg' }],
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.subText,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
