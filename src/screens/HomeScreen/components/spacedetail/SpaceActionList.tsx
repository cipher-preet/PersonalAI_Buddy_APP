import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ChevronRightIcon from '../../../../../styles/icons/GreatorThan';

type ActionItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'default' | 'primary';
};

type Props = {
  actions: ActionItem[];
  title?: string;
};

const SpaceActionList = ({ actions, title = 'Actions' }: Props) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.group}>
      {actions.map((action, index) => {
        if (action.variant === 'primary') {
          return (
            <TouchableOpacity
              key={action.id}
              onPress={action.onPress}
              activeOpacity={0.9}
              style={styles.primaryWrap}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED', '#4338CA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                {action.icon}
                <Text style={styles.primaryText}>{action.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.row,
              index < actions.length - 1 && styles.rowBorder,
            ]}
            onPress={action.onPress}
            activeOpacity={0.75}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>{action.icon}</View>
              <Text style={styles.rowLabel}>{action.label}</Text>
            </View>
            <ChevronRightIcon width={16} height={16} color="#C7C7CC" />
          </TouchableOpacity>
        );
      })}
      </View>
    </View>
  );
};

export default SpaceActionList;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2432',
    marginBottom: 10,
  },

  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E2432',
  },

  primaryWrap: {
    margin: 10,
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },

  primaryButton: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
  },

  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
