import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  CalenderIcon,
  LinkArrow,
} from '../../../../styles/icons';
import { COLORS } from '../component/styles/color';
import { TaskItem } from '../types/task';

type Props = {
  item: TaskItem;
  onPress: () => void;
  completed?: boolean;
  onToggleComplete?: () => void;
  onDelete?: () => void;
};

const TrashIcon = ({ color = '#EF4444' }: { color?: string }) => (
  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12h8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TaskCard = ({
  item,
  onPress,
  completed = false,
  onToggleComplete,
  onDelete,
}: Props) => {
  const statusLabel = completed ? 'Done' : 'Not done';
  const statusStyle = completed ? styles.doneBadge : styles.pendingBadge;
  const statusTextStyle = completed ? styles.doneText : styles.pendingText;

  return (
    <View style={styles.shadowWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.container, completed && styles.completedContainer]}
        onPress={onPress}
      >
        <View style={[styles.statusRail, completed && styles.doneRail]} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={[styles.badge, statusStyle]}>
              <Text style={[styles.badgeText, statusTextStyle]}>
                {statusLabel}
              </Text>
            </View>

            <View style={styles.datePill}>
              <CalenderIcon width={13} height={13} color="#64748B" />
              <Text numberOfLines={1} style={styles.dateText}>
                {item.createdAt}
              </Text>
            </View>
          </View>

          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: completed }}
              accessibilityLabel={
                completed ? 'Mark task as not done' : 'Mark task as done'
              }
              style={[styles.statusDot, completed && styles.doneDot]}
              onPress={event => {
                event.stopPropagation();
                onToggleComplete?.();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {completed ? <View style={styles.statusDotInner} /> : null}
            </TouchableOpacity>

            <View style={[styles.titleBlock, completed && styles.fadedBlock]}>
              <Text
                numberOfLines={2}
                style={[styles.title, completed && styles.completedTitle]}
              >
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text numberOfLines={2} style={styles.subtitle}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.deleteButton}
                onPress={event => {
                  event.stopPropagation();
                  onDelete?.();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <TrashIcon />
              </TouchableOpacity>

              <View style={styles.arrowButton}>
                <LinkArrow width={14} height={14} color={COLORS.black} />
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            {item.priority ? (
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>{item.priority}</Text>
              </View>
            ) : null}

            <View style={styles.projectBadge}>
              <Text numberOfLines={1} style={styles.projectText}>
                {item.project}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  container: {
    minHeight: 146,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    overflow: 'hidden',
    flexDirection: 'row',
  },

  completedContainer: {
    opacity: 0.68,
  },

  statusRail: {
    width: 5,
    backgroundColor: '#8B5CF6',
  },

  doneRail: {
    backgroundColor: '#22C55E',
  },

  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },

  doneDot: {
    borderColor: '#22C55E',
    backgroundColor: '#22C55E',
  },

  statusDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  titleBlock: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 15,
    lineHeight: 21,
  },

  completedTitle: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },

  fadedBlock: {
    opacity: 0.72,
  },

  subtitle: {
    marginTop: 5,
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
  },

  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 1,
  },

  arrowButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  datePill: {
    maxWidth: 138,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
    gap: 6,
  },

  dateText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 12,
    paddingLeft: 32,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  doneBadge: {
    backgroundColor: '#DCFCE7',
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  pendingText: {
    color: '#92400E',
  },

  doneText: {
    color: '#166534',
  },

  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.purpleLight,
  },

  priorityText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  projectBadge: {
    maxWidth: 132,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },

  projectText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '800',
  },
});
