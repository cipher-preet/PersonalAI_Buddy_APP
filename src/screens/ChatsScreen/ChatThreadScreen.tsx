import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import EqualMark from '../../navigation/EqualMark';
import type { AppStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme';

type ThreadRoute = RouteProp<AppStackParamList, 'ChatThread'>;

type ThreadCopy = {
  phone: string;
  message: string;
  ended: string;
  duration: number;
  summary: string[];
  prompt: string;
  sentAt: string;
};

const THREADS: Record<string, ThreadCopy> = {
  pankaj: {
    phone: '+919465932244',
    message: 'Pankaj is insisting on speaking to you directly.',
    ended: 'Call Ended 7:35 PM',
    duration: 26,
    summary: [
      'Pankaj called and was quite insistent about speaking with you directly.',
      'They didn’t want to share any details with me and refused to explain the reason for their call.',
      'Since they weren’t in the mood for a chat with an assistant and you were busy, the call ended without any specific message left.',
    ],
    prompt: 'Call back to find out who is calling and why.',
    sentAt: '7:35 PM',
  },
  sidhu: {
    phone: '+919810045221',
    message: 'Sidhu asked to speak with you directly.',
    ended: 'Call Ended 6:12 PM',
    duration: 18,
    summary: [
      'Sidhu called and asked to be put through to you.',
      'No extra details were shared before the call ended.',
    ],
    prompt: 'Call back if you want to know what this was about.',
    sentAt: '6:12 PM',
  },
  assistant: {
    phone: 'Equal Assistant',
    message: 'Hi Preet! I can take your calls and leave the summary here.',
    ended: 'Updated Yesterday',
    duration: 12,
    summary: [
      'Your assistant is on and ready to answer calls.',
      'Summaries and voice notes from those calls will show up in this chat.',
    ],
    prompt: 'Leave a voice note if you want the assistant to handle the next call.',
    sentAt: 'Yesterday',
  },
};

const BARS = [6, 12, 18, 9, 16, 22, 8, 14, 20, 11, 17, 7, 15, 21, 10, 13, 19, 8, 16, 12, 18, 9, 14, 20, 7, 11, 17, 10];

const clock = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const CHROME = '#3A3A3A';

const BackIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 5.2 7.2 12l7.3 6.8"
      stroke={CHROME}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PhoneIcon = ({
  color = CHROME,
  size = 22,
}: {
  color?: string;
  size?: number;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.2 3.6c.5-.4 1.2-.4 1.7 0l1.8 1.6c.4.4.5 1 .3 1.5l-.9 1.8a1 1 0 0 0 .2 1.2l2.2 2.2a1 1 0 0 0 1.2.2l1.8-.9c.5-.2 1.1-.1 1.5.3l1.6 1.8c.4.5.4 1.2 0 1.7l-1.1 1.2c-.5.5-1.2.8-1.9.7-2.6-.3-5.1-1.6-7.2-3.7-2.1-2.1-3.4-4.6-3.7-7.2-.1-.7.2-1.4.7-1.9l1.2-1.1Z"
      stroke={color}
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </Svg>
);

const RotaryPhone = () => (
  <Svg width={34} height={31} viewBox="8 8 32 30" fill="none">
    <Path
      d="M12 15.2c.2-3.4 4.6-6 12-6s11.8 2.6 12 6c.1 1.5-1 2.6-2.4 2.6h-2.8c-.9 0-1.5-.7-1.5-1.4 0-1.6-2.4-2.6-5.3-2.6s-5.3 1-5.3 2.6c0 .7-.6 1.4-1.5 1.4h-2.8c-1.4 0-2.5-1.1-2.4-2.6Z"
      fill="#E53935"
    />
    <Path
      d="M13.5 20.2h21c2.4 0 4.3 1.9 4.3 4.3v7.6c0 2.4-1.9 4.3-4.3 4.3h-21c-2.4 0-4.3-1.9-4.3-4.3v-7.6c0-2.4 1.9-4.3 4.3-4.3Z"
      fill="#E53935"
    />
    <Circle cx="24" cy="28.4" r="5.2" fill="#C62828" />
    <Circle cx="24" cy="28.4" r="1.6" fill="#FFE4E6" />
    <Circle cx="24" cy="24" r="0.7" fill="#FFE4E6" />
    <Circle cx="27.4" cy="25.4" r="0.7" fill="#FFE4E6" />
    <Circle cx="20.6" cy="25.4" r="0.7" fill="#FFE4E6" />
  </Svg>
);

const MoreIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5.2" r="1.7" fill={CHROME} />
    <Circle cx="12" cy="12" r="1.7" fill={CHROME} />
    <Circle cx="12" cy="18.8" r="1.7" fill={CHROME} />
  </Svg>
);

const PlayIcon = () => (
  <Svg width={15} height={15} viewBox="0 0 16 16" fill="none">
    <Path d="M4.2 2.1v11.8L13.6 8 4.2 2.1Z" fill={colors.white} />
  </Svg>
);

const PauseIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <Rect x="2.4" y="2" width="3.6" height="12" rx="0.8" fill={colors.white} />
    <Rect x="10" y="2" width="3.6" height="12" rx="0.8" fill={colors.white} />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Circle cx="6.2" cy="12" r="2.5" fill={colors.primary} />
    <Circle cx="17.2" cy="6" r="2.5" fill={colors.primary} />
    <Circle cx="17.2" cy="18" r="2.5" fill={colors.primary} />
    <Path
      d="M8.5 11.1 14.8 7.2M8.5 12.9 14.8 16.8"
      stroke={colors.primary}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
    <Path
      d="m12 2.2 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.1 6.6 19l1-6.1L3.2 8.6l6.1-.9L12 2.2Z"
      stroke={filled ? '#E0A100' : '#D2D2D2'}
      fill={filled ? '#E0A100' : 'none'}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </Svg>
);

const KeyboardIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2.6"
      y="5.2"
      width="18.8"
      height="13.6"
      rx="2.4"
      stroke={CHROME}
      strokeWidth={1.6}
    />
    {[5.2, 9.3, 13.4, 17.5].map(x =>
      [8.2, 11.6].map(y => (
        <Rect key={`${x}-${y}`} x={x} y={y} width="2.1" height="2.1" rx="0.4" fill={CHROME} />
      )),
    )}
    <Rect x="7.4" y="15" width="9.2" height="2" rx="0.5" fill={CHROME} />
  </Svg>
);

const MicIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect
      x="8.6"
      y="2.6"
      width="6.8"
      height="11"
      rx="3.4"
      stroke={colors.white}
      strokeWidth={1.8}
    />
    <Path
      d="M6.2 11.2a5.8 5.8 0 0 0 11.6 0M12 17v3.4"
      stroke={colors.white}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const PhoneAvatar = () => (
  <View style={styles.phoneAvatar}>
    <RotaryPhone />
  </View>
);

const ChatThreadScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  );
  const route = useRoute<ThreadRoute>();
  const { id, name, kind } = route.params;
  const copy = THREADS[id] ?? THREADS.pankaj;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    if (!playing) {
      return;
    }
    const timer = setInterval(() => {
      setElapsed(value => {
        const next = value + speed;
        if (next >= copy.duration) {
          setPlaying(false);
          return copy.duration;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [copy.duration, playing, speed]);

  const progress = copy.duration === 0 ? 0 : elapsed / copy.duration;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent />
      <View style={[styles.headerBlock, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.iconButton}
          >
            <BackIcon />
          </Pressable>
          {kind === 'assistant' ? (
            <View style={styles.assistantAvatar}>
              <EqualMark color={colors.white} size={26} />
            </View>
          ) : (
            <PhoneAvatar />
          )}
          <View style={styles.headerCopy}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.phone} numberOfLines={1}>
              {copy.phone}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Call" hitSlop={8} style={styles.iconButton}>
            <PhoneIcon size={22} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={8} style={styles.iconButton}>
            <MoreIcon />
          </Pressable>
        </View>
        <View style={styles.disclaimerBar}>
          <Text style={styles.disclaimer}>Your AI assistant may make mistakes too.</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{copy.message}</Text>
        </View>
        <Text style={styles.ended}>{copy.ended}</Text>

        <View style={styles.cardWrap}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardMark}>
              <EqualMark color={colors.white} size={18} />
            </View>
            <Text style={styles.cardBrand}>Equal AI</Text>
          </View>
          <View style={styles.player}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playing ? 'Pause' : 'Play'}
              onPress={() => {
                if (elapsed >= copy.duration) {
                  setElapsed(0);
                }
                setPlaying(value => !value);
              }}
              style={styles.play}
            >
              <View style={playing ? undefined : styles.playGlyph}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </View>
            </Pressable>
            <View style={styles.wave}>
              {BARS.map((height, index) => {
                const filled = (index + 1) / BARS.length <= progress;
                return (
                  <View
                    key={`${height}-${index}`}
                    style={[
                      styles.bar,
                      { height, backgroundColor: filled ? colors.primary : '#D5D5D5' },
                    ]}
                  />
                );
              })}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Playback speed"
              onPress={() => setSpeed(value => (value === 1 ? 1.5 : value === 1.5 ? 2 : 1))}
              style={styles.speed}
            >
              <Text style={styles.speedText}>{speed === 1 ? '1x' : speed === 1.5 ? '1.5x' : '2x'}</Text>
            </Pressable>
          </View>
          <View style={styles.times}>
            <Text style={styles.time}>{clock(Math.round(elapsed))}</Text>
            <Text style={styles.time}>{clock(copy.duration)}</Text>
          </View>
          <Text style={styles.summaryTitle}>Call Summary</Text>
          {copy.summary.map(line => (
            <View key={line} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
          <View style={styles.cardFoot}>
            <Text style={styles.time}>{copy.sentAt}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share"
          hitSlop={8}
          style={styles.share}
        >
          <ShareIcon />
        </Pressable>
        </View>

        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
              onPress={() => setStars(value)}
              hitSlop={6}
            >
              <StarIcon filled={value <= stars} />
            </Pressable>
          ))}
        </View>

        <View style={styles.follow}>
          <View style={styles.followHead}>
            <View style={styles.cardMark}>
              <EqualMark color={colors.white} size={18} />
            </View>
            <Text style={styles.followText}>{copy.prompt}</Text>
          </View>
          <View style={styles.actions}>
            <View style={[styles.action, styles.actionTint]}>
              <PhoneIcon color={colors.equalInk} size={15} />
              <Text style={styles.actionText}>Call back to identify</Text>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="m9 6 6 6-6 6"
                  stroke="#6E6E6E"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <View style={styles.action}>
              <Text style={styles.actionText}>Always connect</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.composerSafe, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <View style={styles.composer}>
          <Pressable accessibilityRole="button" accessibilityLabel="Keyboard" style={styles.keyboard}>
            <KeyboardIcon />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send voice note"
            style={({ pressed }) => [styles.voice, pressed && styles.pressed]}
          >
            <MicIcon />
            <Text style={styles.voiceText}>Send Voice Note</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  headerBlock: {
    backgroundColor: colors.white,
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 2,
    backgroundColor: '#F6E3A8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginLeft: 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    marginLeft: 10,
    marginRight: 4,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.equalInk,
  },
  phone: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.equalMuted,
  },
  disclaimerBar: {
    backgroundColor: '#F4EEFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  disclaimer: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.primaryText,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  bubble: {
    alignSelf: 'flex-start',
    maxWidth: '88%',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  bubbleText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: colors.equalInk,
  },
  ended: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 14,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.equalMuted,
  },
  cardWrap: {
    position: 'relative',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBrand: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.equalInk,
  },
  player: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  play: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    marginLeft: 2,
  },
  wave: {
    flex: 1,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  speed: {
    minWidth: 36,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.equalInk,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 14,
    paddingLeft: 44,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.equalMuted,
  },
  summaryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.equalInk,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.equalInk,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    paddingRight: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.equalInk,
  },
  cardFoot: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  share: {
    position: 'absolute',
    right: -8,
    top: '58%',
    width: 34,
    height: 34,
    marginTop: -17,
    borderRadius: 17,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 2,
  },
  stars: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  follow: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 14,
  },
  followHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  followText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19,
    color: colors.equalInk,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  action: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.equalLine,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionTint: {
    backgroundColor: '#F4EEFF',
    borderColor: 'transparent',
  },
  actionText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.equalInk,
  },
  composerSafe: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.equalLine,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  keyboard: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.equalLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voice: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.white,
  },
  pressed: {
    opacity: 0.84,
  },
});

export default ChatThreadScreen;
