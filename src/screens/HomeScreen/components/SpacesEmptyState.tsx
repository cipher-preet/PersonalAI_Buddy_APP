import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AddSpace, MySpcaes } from '../../../../styles/icons';

type Props = {
  onCreatePress: () => void;
};

const SpacesEmptyState = ({ onCreatePress }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <View style={styles.iconInner}>
          <MySpcaes width={28} height={28} color="#4338CA" />
        </View>
      </View>

      <Text style={styles.title}>No spaces yet</Text>
      <Text style={styles.subtitle}>
        Create your first workspace to organize notes, tasks, and voice memories
        with Buddy.
      </Text>

      <TouchableOpacity
        onPress={onCreatePress}
        activeOpacity={0.9}
        style={styles.buttonWrap}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
          <AddSpace width={16} height={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>Create your first space</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default SpacesEmptyState;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    borderStyle: 'dashed',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },

  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  iconInner: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E2432',
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 8,
  },

  buttonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },

  button: {
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
