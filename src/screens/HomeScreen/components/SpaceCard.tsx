import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;

  description: string;

  icon: React.ReactNode;

  badgeText?: string;
  time?: string;
  conversations?: string;
  tags?: string[];

  color?: string;
};

const SpaceCard = ({
  title,
  description,
  icon,
  badgeText,
  color,
  time,
}: Props) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: color,
            },
          ]}
        >
          {icon}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>

            {badgeText && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badgeText}</Text>
              </View>
            )}
          </View>

          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.7} style={styles.arrowButton}>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default SpaceCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFF2F8',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  leftSection: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#F3F6FF',
  },

  contentContainer: {
    flex: 1,

    justifyContent: 'center',

    paddingRight: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    flexShrink: 1,

    fontSize: 14,

    color: '#111827',

    fontWeight: '700',

    letterSpacing: -0.3,
  },

  badge: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    backgroundColor: '#EFF4FF',
  },

  badgeText: {
    fontSize: 8,

    fontWeight: '700',

    letterSpacing: 0.4,

    color: '#4F7CFF',
  },

  description: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 18,
  },

  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginLeft: 10,
  },

  arrow: {
    fontSize: 20,
    color: '#5B6D98',
    marginTop: -2,
  },
});
