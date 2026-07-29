import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MySpcaes } from '../../../../../styles/icons';

type Props = {
  title: string;
  description?: string;
  createdAt: string;
  isListening: boolean;
  accentColor: string;
  onClose: () => void;
};

const SpaceSheetHeader = ({
  title,
  description,
  createdAt,
  isListening,
  accentColor,
  onClose,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.icon, { backgroundColor: accentColor }]}>
          <MySpcaes width={16} height={16} color="#111827" />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {description || `Created ${createdAt}`}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={[styles.statusPill, isListening && styles.statusLive]}>
          {isListening ? <View style={styles.liveDot} /> : null}
          <Text style={[styles.statusText, isListening && styles.statusLiveText]}>
            {isListening ? 'Live' : 'Idle'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SpaceSheetHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textWrap: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },

  meta: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusLive: {
    backgroundColor: '#ECFDF5',
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  statusLiveText: {
    color: '#15803D',
  },

  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },

  closeIcon: {
    fontSize: 18,
    lineHeight: 20,
    color: '#64748B',
    marginTop: -1,
  },
});
