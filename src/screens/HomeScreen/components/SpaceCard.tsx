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

    borderRadius: 22,

    paddingHorizontal: 14,
    paddingVertical: 12,

    marginTop: 12,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#EEF2F7',

    shadowColor: '#B8C2D1',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 3,
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
    height: 20,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#EEF4FF',
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

    color: '#7B8496',

    fontWeight: '500',

    lineHeight: 16,
  },

  arrowButton: {
    width: 28,
    height: 28,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    marginLeft: 8,
  },

  arrow: {
    fontSize: 20,

    color: '#98A2B3',

    marginTop: -2,
  },
});
