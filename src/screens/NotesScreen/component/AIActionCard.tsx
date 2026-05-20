import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { HomeIcon } from '../../../../styles/icons';

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
          <HomeIcon width={14} height={14} color="#94A3B8" />
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
    marginTop: 4,
  },

  scrollContainer: {
    paddingRight: 8,
  },

  card: {
    width: 142,

    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    padding: 14,

    marginRight: 12,

    borderWidth: 1,
    borderColor: '#EEF2F6',

    shadowColor: '#CBD5E1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconContainer: {
    width: 42,
    height: 42,

    borderRadius: 14,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F7F9FB',
  },

  linkButton: {
    width: 30,
    height: 30,

    borderRadius: 10,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#F8FAFC',

    borderWidth: 1,
    borderColor: '#EEF2F6',
  },

  cardTitle: {
    marginTop: 16,

    fontSize: 14,
    lineHeight: 20,

    fontWeight: '600',

    color: '#46525A',

    letterSpacing: -0.1,
  },
});
