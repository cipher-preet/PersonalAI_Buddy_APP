import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, ms, radii, spacing } from '../../../theme';
import type { BriefingNote, BriefingView } from '../briefingTypes';
import { SectionHeader, cardStyle } from './BriefingParts';
import { CheckIcon } from './briefingIcons';

type Props = {
  recap: BriefingView['yesterday'];
};

const NoteList = ({
  items,
  marker,
}: {
  items: BriefingNote[];
  marker: 'dot' | 'check' | 'number';
}) => (
  <View style={styles.card}>
    {items.map((item, index) => (
      <View key={item.id} style={[styles.row, index > 0 && styles.rowDivider]}>
        {marker === 'check' ? (
          <View style={styles.check}>
            <CheckIcon size={11} />
          </View>
        ) : marker === 'number' ? (
          <View style={styles.number}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
        ) : (
          <View style={styles.dotWrap}>
            <View style={styles.dot} />
          </View>
        )}
        <View style={styles.copy}>
          <Text style={styles.title}>{item.title}</Text>
          {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
        </View>
      </View>
    ))}
  </View>
);

const YesterdayView = ({ recap }: Props) => {
  const stats = [
    { key: 'completed', label: 'Tasks done', value: recap.stats.completed },
    { key: 'meetings', label: 'Meetings', value: recap.stats.meetings },
    { key: 'notes', label: 'Notes', value: recap.stats.notes },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryDate}>{recap.dateLabel}</Text>
        <Text style={styles.summaryText}>{recap.summary}</Text>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View
              key={stat.key}
              style={[styles.stat, index > 0 && styles.statDivider]}
            >
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {recap.highlights.length ? (
        <View>
          <SectionHeader title="Highlights" meta={`${recap.highlights.length}`} />
          <NoteList items={recap.highlights} marker="dot" />
        </View>
      ) : null}

      {recap.decisions.length ? (
        <View>
          <SectionHeader title="Decisions" meta={`${recap.decisions.length}`} />
          <NoteList items={recap.decisions} marker="number" />
        </View>
      ) : null}

      {recap.completed.length ? (
        <View>
          <SectionHeader title="Completed" meta={`${recap.completed.length}`} />
          <NoteList items={recap.completed} marker="check" />
        </View>
      ) : null}

      {recap.people.length ? (
        <View>
          <SectionHeader title="People you talked to" />
          <View style={styles.peopleRow}>
            {recap.people.map(person => (
              <View key={person} style={styles.personChip}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personInitial}>
                    {person.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.personName}>{person}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default YesterdayView;

const styles = StyleSheet.create({
  container: {
    gap: spacing['4xl'],
  },
  card: {
    ...cardStyle,
    paddingHorizontal: spacing.xl,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  summaryCard: {
    ...cardStyle,
    padding: spacing['2xl'],
  },
  summaryDate: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  summaryText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: ms(22),
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing['2xl'],
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  statValue: {
    color: colors.black,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
  },
  statLabel: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  dotWrap: {
    width: ms(22),
    height: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: colors.primary,
  },
  number: {
    width: ms(22),
    height: ms(22),
    borderRadius: radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  numberText: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
  },
  check: {
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successBright,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: ms(20),
  },
  detail: {
    marginTop: spacing.xxs,
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: ms(18),
  },
  peopleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  personChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.xs,
    paddingRight: spacing.xl,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personAvatar: {
    width: ms(26),
    height: ms(26),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  personInitial: {
    color: colors.primaryDark,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  personName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
