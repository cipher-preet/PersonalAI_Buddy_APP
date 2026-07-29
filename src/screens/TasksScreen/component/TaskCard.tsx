import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { LinkArrow } from '../../../../styles/icons';
import { COLORS } from '../component/styles/color';
import { TaskItem } from '../types/task';

type Props = {
  item: TaskItem;
  onPress: () => void;
};

const TaskCard = ({ item, onPress }: Props) => {
  const [completed, setCompleted] = useState(false);

  const onToggleTask = () => {
    setCompleted(prev => !prev);
  };

  return (
    <View style={styles.shadowWrap}>
      <View style={[styles.container, completed && styles.completedContainer]}>
        <View style={[styles.leftBorder, completed && styles.completedBorder]} />

        <View style={styles.content}>
          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onToggleTask}
              style={[styles.radio, completed && styles.activeRadio]}
            >
              {completed && <View style={styles.innerDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.taskContent}
              onPress={onPress}
            >
              <Text style={[styles.title, completed && styles.completedTitle]}>
                {item.title}
              </Text>

              <Text
                style={[styles.subtitle, completed && styles.completedSubtitle]}
              >
                {item.subtitle}
              </Text>

              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tag, completed && styles.completedTag]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        completed && styles.completedTagText,
                      ]}
                    >
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
              <LinkArrow width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TaskCard;

const styles = StyleSheet.create({
  shadowWrap: {
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  container: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
  },

  completedContainer: {
    opacity: 0.65,
  },

  leftBorder: {
    width: 4,
    backgroundColor: COLORS.primary,
  },

  completedBorder: {
    backgroundColor: '#C4B5FD',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  activeRadio: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  taskContent: {
    flex: 1,
    paddingRight: 8,
  },

  title: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 15,
  },

  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },

  subtitle: {
    marginTop: 4,
    color: COLORS.gray,
    fontSize: 12,
  },

  completedSubtitle: {
    color: '#B0B0B0',
  },

  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },

  tag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },

  completedTag: {
    backgroundColor: '#F3F4F6',
  },

  tagText: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '700',
  },

  completedTagText: {
    color: '#B0B0B0',
  },
});
