import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { LinkArrow } from '../../../../styles/icons';
import { COLORS } from './styles/color';
import {
  fontSize,
  fontWeight,
  ms,
  radii,
  shadows,
  spacing,
} from '../../../theme';

type CardItem = {
  id: number;
  title: string;
  icon: React.ReactNode;
};

type Props = {
  cards: CardItem[];
};

type CardProps = {
  title: string;
  icon: React.ReactNode;
};

const Card = ({ title, icon }: CardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={styles.topContainer}>
        <View style={styles.iconContainer}>{icon}</View>

        <TouchableOpacity activeOpacity={0.8} style={styles.linkButton}>
          <LinkArrow width={ms(14)} height={ms(14)} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      <Text numberOfLines={2} style={styles.cardTitle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const AIActionCard = ({ cards }: Props) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {cards.map(item => (
          <Card key={item.id} title={item.title} icon={item.icon} />
        ))}
      </ScrollView>
    </View>
  );
};

export default AIActionCard;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.xs,
  },

  scrollContainer: {
    paddingRight: spacing.md,
  },

  card: {
    width: ms(142),
    backgroundColor: COLORS.white,
    borderRadius: radii['2xl'],
    padding: ms(14),
    marginRight: spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...shadows.soft,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconContainer: {
    width: ms(42),
    height: ms(42),
    borderRadius: ms(14),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
  },

  linkButton: {
    width: ms(30),
    height: ms(30),
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  cardTitle: {
    marginTop: spacing['2xl'],
    fontSize: fontSize.base,
    lineHeight: ms(20),
    fontWeight: fontWeight.semibold,
    color: COLORS.textSecondary,
    letterSpacing: -0.1,
  },
});
