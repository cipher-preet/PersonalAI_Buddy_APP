import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SpaceFolderTile from './SpaceFolderTile';
import type { Space } from '../../../store/api/home';
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
} from '../../../theme';

type Props = {
  spaces: Space[];
  deletingSpaceId?: string;
  getSubtitle: (space: Space) => string;
  onSpacePress: (space: Space) => void;
  onDeleteSpace: (space: Space) => void;
};

const SpaceCell = memo(
  ({
    space,
    statusLabel,
    isDeleting,
    onPress,
    onDelete,
  }: {
    space: Space;
    statusLabel: string;
    isDeleting: boolean;
    onPress: (space: Space) => void;
    onDelete: (space: Space) => void;
  }) => {
    const handlePress = useCallback(() => onPress(space), [onPress, space]);
    const handleDelete = useCallback(() => onDelete(space), [onDelete, space]);

    return (
      <View style={styles.cell}>
        <SpaceFolderTile
          spaceId={space._id}
          title={space.spacename}
          statusLabel={statusLabel}
          notesCount={space.notesCount}
          tasksCount={space.tasksCount}
          isListening={space.isListning}
          isDeleting={isDeleting}
          onPress={handlePress}
          onDelete={handleDelete}
        />
      </View>
    );
  },
);

const SpacesGrid = ({
  spaces,
  deletingSpaceId,
  getSubtitle,
  onSpacePress,
  onDeleteSpace,
}: Props) => {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>My Spaces</Text>
      </View>

      <View style={styles.grid}>
        {spaces.map(space => (
          <SpaceCell
            key={space._id}
            space={space}
            statusLabel={getSubtitle(space)}
            isDeleting={deletingSpaceId === space._id}
            onPress={onSpacePress}
            onDelete={onDeleteSpace}
          />
        ))}
      </View>
    </View>
  );
};

export default memo(SpacesGrid);

const styles = StyleSheet.create({
  section: {
    marginTop: spacing['2xl'],
  },

  header: {
    marginBottom: spacing['2xl'],
  },

  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },

  cell: {
    width: '33.333%',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing['3xl'],
  },
});
