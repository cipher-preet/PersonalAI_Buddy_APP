import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ChevronRightIcon from '../../../../../styles/icons/GreatorThan';
import {
  colors,
  fontSize,
  fontWeight,
  ms,
  mvs,
  radii,
  spacing,
} from '../../../../theme';

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
                colors={[
                  colors.primaryPurple,
                  colors.primaryPurpleDark,
                  colors.primary,
                ]}
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
            <ChevronRightIcon
              width={ms(16)}
              height={ms(16)}
              color={colors.muted}
            />
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
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.lg,
  },

  group: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(14),
    paddingVertical: spacing.xl,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },

  iconBox: {
    width: ms(32),
    height: ms(32),
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  primaryWrap: {
    margin: spacing.lg,
    marginTop: spacing.xs,
    borderRadius: ms(14),
    overflow: 'hidden',
  },

  primaryButton: {
    height: mvs(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: ms(14),
  },

  primaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
