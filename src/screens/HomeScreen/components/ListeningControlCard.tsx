import React, { memo, useEffect, useMemo, useState } from 'react';

import TopCard from './TopCard';
import { MicIcon } from '../../../../styles/icons';
import { colors, ms } from '../../../theme';
import {
  UNLIMITED_LIMIT,
  formatClock,
  formatHoursShort,
  getRecordingRemainingMs,
} from '../../../utils/planUsage';

type PlanStatusLike = Parameters<typeof getRecordingRemainingMs>[0];

type Props = {
  isVoiceActive: boolean;
  isUploadingVoice: boolean;
  isFetchingActiveSpace: boolean;
  spaceName?: string;
  startedAt: number | null;
  planStatus: PlanStatusLike;
  onPress: () => void;
};

/**
 * Owns the 1s listening clock so Home (spaces grid) does not re-render every tick.
 */
const ListeningControlCard = ({
  isVoiceActive,
  isUploadingVoice,
  isFetchingActiveSpace,
  spaceName,
  startedAt,
  planStatus,
  onPress,
}: Props) => {
  const [nowTs, setNowTs] = useState(Date.now());

  useEffect(() => {
    if (!isVoiceActive) {
      return;
    }

    setNowTs(Date.now());
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isVoiceActive]);

  const elapsedMs = useMemo(() => {
    if (!isVoiceActive || !startedAt) {
      return 0;
    }
    return Math.max(0, nowTs - startedAt);
  }, [isVoiceActive, nowTs, startedAt]);

  const remainingMs = getRecordingRemainingMs(planStatus, elapsedMs);

  const subtitle = isUploadingVoice
    ? 'Uploading voice message...'
    : isFetchingActiveSpace && !isVoiceActive
      ? 'Checking active space...'
      : isVoiceActive
        ? formatClock(elapsedMs)
        : remainingMs === UNLIMITED_LIMIT
          ? 'Unlimited recording time'
          : remainingMs <= 0
            ? 'Upgrade to keep listening'
            : `${formatHoursShort(remainingMs)} remaining`;

  const meta = isVoiceActive
    ? `${spaceName || 'Space'} · ${
        remainingMs === UNLIMITED_LIMIT
          ? 'Unlimited'
          : remainingMs <= 0
            ? 'Time up'
            : `${formatHoursShort(remainingMs)} left`
      }`
    : undefined;

  return (
    <TopCard
      title={isVoiceActive ? 'Stop Listening' : 'Start Listening'}
      subtitle={subtitle}
      meta={meta}
      color={colors.accentCyan}
      active={isVoiceActive}
      activeColor={colors.accentCyan}
      icon={<MicIcon width={ms(18)} height={ms(18)} color={colors.white} />}
      onPress={onPress}
    />
  );
};

export default memo(ListeningControlCard);
