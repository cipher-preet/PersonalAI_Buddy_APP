import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

import { SearchIcon,FilterIcon } from '../../../../styles/icons';

const Header = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>My Notes ✨</Text>
          <Text style={styles.subtitle}>
            Capture ideas, tasks & inspirations
          </Text>
        </View>
        <View style={styles.rightContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
            <SearchIcon width={18} height={18} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
            <FilterIcon width={18} height={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  leftSection: {
    flex: 1,
    paddingRight: 20,
  },

  greeting: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C8595',
    letterSpacing: 0.3,
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161A22',
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    fontWeight: '500',
  },

  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 20,

    backgroundColor: 'rgba(255,255,255,0.75)',

    justifyContent: 'center',
    alignItems: 'center',

    marginLeft: 12,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',

    shadowColor: '#A1A1AA',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 6,
  },

  dot: {
    position: 'absolute',
    top: 14,
    right: 14,

    width: 10,
    height: 10,
    borderRadius: 20,

    backgroundColor: '#8B5CF6',

    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
