import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Space } from '../../../store/api/home';
import { MySpcaes } from '../../../../styles/icons';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

type Props = {
  spaces: Space[];
  selectedSpaceId?: string;
  isLoading?: boolean;
  isError?: boolean;
  getTaskCount?: (spaceId: string) => number;
  onRetry?: () => void;
  onSelectSpace?: (spaceId: string) => void;
  onNavigateNotes?: () => void;
};

const CARD_WIDTH = ms(142);
const CARD_GAP = spacing.lg;

const SPACE_THEMES = [
  {
    bg: '#EDE9FE',
    border: '#C4B5FD',
    iconBg: '#DDD6FE',
    icon: '#5B21B6',
  },
  {
    bg: '#DBEAFE',
    border: '#93C5FD',
    iconBg: '#BFDBFE',
    icon: '#1D4ED8',
  },
  {
    bg: '#D1FAE5',
    border: '#6EE7B7',
    iconBg: '#A7F3D0',
    icon: '#047857',
  },
  {
    bg: '#FFEDD5',
    border: '#FDBA74',
    iconBg: '#FED7AA',
    icon: '#C2410C',
  },
  {
    bg: '#FCE7F3',
    border: '#F9A8D4',
    iconBg: '#FBCFE8',
    icon: '#BE185D',
  },
  {
    bg: '#E0F2FE',
    border: '#7DD3FC',
    iconBg: '#BAE6FD',
    icon: '#0369A1',
  },
];

const getTheme = (id: string) => {
  const hash = id.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return SPACE_THEMES[hash % SPACE_THEMES.length];
};

const ArrowIcon = ({ color = colors.primary }: { color?: string }) => (
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 17 17 7M10 7h7v7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CategoryTabs = ({
  spaces,
  selectedSpaceId,
  isLoading = false,
  isError = false,
  getTaskCount,
  onRetry,
  onSelectSpace,
  onNavigateNotes,
}: Props) => {
  const [localActiveId, setLocalActiveId] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const activeId = selectedSpaceId || localActiveId || spaces[0]?._id;

  const scrollToRevealNext = (index: number) => {
    if (spaces.length === 0) {
      return;
    }

    const x = index * (CARD_WIDTH + CARD_GAP);
    scrollRef.current?.scrollTo({ x, animated: true });
  };

  const handleSelectSpace = (spaceId: string, index: number) => {
    setLocalActiveId(spaceId);
    onSelectSpace?.(spaceId);
    scrollToRevealNext(index);
  };

  const renderSpaceCards = () => {
    if (isLoading) {
      return (
        <View style={styles.stateCard}>
          <ActivityIndicator size="small" color={colors.primaryDark} />
          <Text style={styles.stateText}>Loading spaces...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.stateCard}
          onPress={onRetry}
        >
          <Text style={styles.errorText}>Unable to load</Text>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      );
    }

    if (spaces.length === 0) {
      return (
        <View style={styles.card}>
          <View
            style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}
          >
            <MySpcaes width={ms(16)} height={ms(16)} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>No spaces</Text>
          <Text style={styles.cardMeta}>Create one from Home</Text>
        </View>
      );
    }

    return spaces.map((item, index) => {
      const isActive = item._id === activeId;
      const theme = getTheme(item._id);
      const taskCount = getTaskCount?.(item._id) ?? 0;

      return (
        <TouchableOpacity
          key={item._id}
          activeOpacity={0.88}
          style={[
            styles.card,
            isActive
              ? {
                  backgroundColor: theme.bg,
                  borderColor: theme.border,
                }
              : styles.cardInactive,
          ]}
          onPress={() => handleSelectSpace(item._id, index)}
        >
          <View style={styles.cardTop}>
            <View
              style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}
            >
              <MySpcaes
                width={ms(15)}
                height={ms(15)}
                color={theme.icon}
              />
            </View>
          </View>

          <Text numberOfLines={2} style={styles.cardTitle}>
            {item.spacename}
          </Text>

          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>{taskCount}</Text>
            <Text style={styles.cardMeta}>tasks</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.notesLink}
            onPress={event => {
              event.stopPropagation();
              onNavigateNotes?.();
            }}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={[styles.notesLinkText, { color: theme.icon }]}>
              Notes
            </Text>
            <ArrowIcon color={theme.icon} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        decelerationRate="fast"
      >
        {renderSpaceCards()}
      </ScrollView>
    </View>
  );
};

export default CategoryTabs;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
  },

  container: {
    paddingLeft: layout.screenPadding,
    paddingRight: layout.screenPadding,
    gap: CARD_GAP,
  },

  card: {
    width: CARD_WIDTH,
    minHeight: ms(132),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },

  cardInactive: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconWrap: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(11),
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    marginTop: spacing.md,
    color: colors.black,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    lineHeight: ms(18),
  },

  cardBottom: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },

  cardValue: {
    color: colors.black,
    fontSize: ms(22),
    lineHeight: ms(26),
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.4,
  },

  cardMeta: {
    color: colors.subText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginBottom: ms(2),
  },

  notesLink: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },

  notesLinkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  stateCard: {
    width: CARD_WIDTH,
    minHeight: ms(132),
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },

  stateText: {
    marginTop: spacing.sm,
    color: colors.gray,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  errorText: {
    color: colors.errorDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },

  retryText: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
