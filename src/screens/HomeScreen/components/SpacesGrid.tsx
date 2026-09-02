import React, { memo } from 'react';
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
          <View key={space._id} style={styles.cell}>
            <SpaceFolderTile
              title={space.spacename}
              subtitle={getSubtitle(space)}
              isListening={space.isListning}
              isDeleting={deletingSpaceId === space._id}
              onPress={() => onSpacePress(space)}
              onDelete={() => onDeleteSpace(space)}
            />
          </View>
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
