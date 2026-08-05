import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../../navigation/types';

import Header from './component/Header';
import NotesFilterMenu from './component/NotesFilterMenu';
import CategoryTabs from './component/CategoryTabs';
import NotesProgressCard from './component/NotesProgressCard';
import SectionHeader from './component/SectionHeader';
import NoteCard from './component/NoteCard';
import NoteDetailBottomSheet from './component/NoteDetailBottomSheet';
import { COLORS } from './component/styles/color';
import { NoteItem } from './types/note';
import type { NoteSortOrder } from './types/sort';
import { useAppSelector } from '../../store/hooks';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import {
  StagedNoteCard,
  useGetNoteWorkspacesQuery,
  useGetStagedNotesBySpaceQuery,
  useLazyGetStagedNoteByIdQuery,
} from '../../store/api/home';

export const categories = [
  { id: 'all', label: 'All Notes', count: 86 },
  { id: 'recent', label: 'Recent', count: 12 },
  { id: 'favorites', label: 'Favorites', count: 8 },
  { id: 'shared', label: 'Shared', count: 5 },
  { id: 'important', label: 'Important', count: 3 },
];

const NOTES_PAGE_SIZE = 10;

export const notes: NoteItem[] = [
  {
    id: '1',
    tag: 'SUMMARY',
    title: 'Interview Notes: Senior ML Engineer',
    desc: 'Strong background in Python and distributed training...',
    time: '10:42 AM',
    updatedAt: 'Today',
    createdAt: 'Mar 18, 2026',
    workspace: 'Hiring Pipeline',
    readTime: '4 min read',
    tags: ['#AI', '#Interview', '#Hiring'],
    summary:
      'Candidate shows strong experience in machine learning pipelines, distributed training, and production ML systems. Overall recommendation: advance to the final technical panel with a focus on system design and team leadership.',
    highlights: [
      '5+ years building ML models in production environments',
      'Led migration from batch inference to real-time serving',
      'Strong communication during system design discussion',
      'Experience with PyTorch, Spark, and Kubernetes-based deployments',
      'Previously reduced inference latency by 38% at previous company',
    ],
    sections: [
      {
        title: 'Technical depth',
        content:
          'The candidate explained their feature store architecture, online/offline training parity, and how they monitor model drift in production. They were comfortable discussing batch vs. streaming pipelines and gave concrete examples of rollback strategies when model quality dropped.',
      },
      {
        title: 'System design response',
        content:
          'For the recommendation feed exercise, they proposed a two-stage ranking system with candidate generation and re-ranking. They considered cache layers, fallback models, and graceful degradation when the primary model is unavailable.',
      },
      {
        title: 'Culture and collaboration',
        content:
          'They described weekly syncs with product and design, and how they document model decisions for non-technical stakeholders. Mentioned mentoring two junior engineers and leading a guild on MLOps best practices.',
      },
      {
        title: 'Areas to probe next',
        content:
          'On-device inference experience is limited. Ask about leading cross-team initiatives and how they handle disagreement on model trade-offs. Salary expectations were within range but flexible on equity.',
      },
    ],
    actionItems: [
      'Schedule final panel with engineering director',
      'Send take-home focused on ranking system design',
      'Request reference from previous tech lead',
      'Share compensation band before next round',
    ],
    body:
      'Interview ran 55 minutes. Opening covered background and motivation for the role. Middle section focused on a live system design prompt around personalized recommendations. Closing included candidate questions about team structure, release cadence, and model governance.\n\nOverall impression: confident, structured communicator with credible production experience. Would be a strong hire for the platform ML team if system design round confirms depth. Minor concern: most recent work has been backend-heavy with less frontend or mobile ML exposure.',
    relatedNotes: [
      'ML Engineer Job Description — v3',
      'Interview Scorecard Template',
      'Compensation Benchmarks Q1',
    ],
  },
  {
    id: '2',
    tag: 'FEATURES',
    title: 'Automated Resume Screening Logic',
    desc: 'Drafting the initial rule engine for parsing keywords...',
    time: 'Yesterday',
    updatedAt: 'Yesterday',
    createdAt: 'Mar 17, 2026',
    workspace: 'Product Specs',
    readTime: '5 min read',
    tags: ['#Product', '#Automation', '#Recruiting'],
    summary:
      'Product spec for phase-one resume screening: rules-based parsing, transparent scoring, recruiter overrides, and audit logs before moving to semantic matching.',
    highlights: [
      'Parse skills, years of experience, and role keywords',
      'Score candidates into High, Medium, and Review buckets',
      'Allow recruiters to adjust weights per job posting',
      'Show score explanation for every shortlisted resume',
      'Export screening results back to ATS via webhook',
    ],
    sections: [
      {
        title: 'Parsing pipeline',
        content:
          'Upload PDF or DOCX, extract text, normalize headings, and map sections to structured fields: education, experience, skills, certifications. Fallback OCR for scanned documents with a confidence flag.',
      },
      {
        title: 'Scoring model v1',
        content:
          'Weighted keyword match against job requirements (40%), years of relevant experience (30%), education fit (15%), and location/authorization (15%). Scores above 80 auto-shortlist, 60–79 review queue, below 60 archive with reason codes.',
      },
      {
        title: 'Recruiter controls',
        content:
          'Per-job weight sliders, mandatory skill toggles, and manual override with required comment. All overrides logged for compliance and model improvement later.',
      },
      {
        title: 'Open questions',
        content:
          'Integrate with Greenhouse webhook or ship standalone upload first? Do we need multilingual support in v1? Legal review needed for bias monitoring dashboard.',
      },
    ],
    actionItems: [
      'Review spec with legal on scoring transparency',
      'Prototype parser on 50 sample resumes',
      'Align with ATS team on webhook payload',
      'Design recruiter override UI mockups',
    ],
    body:
      'Goal is to reduce initial screening time by 60% while keeping humans in the loop. Phase two will add embedding-based similarity and duplicate candidate detection. Success metrics: time-to-shortlist, override rate, and recruiter satisfaction score.\n\nNon-goals for v1: automated rejection emails, interview scheduling, and full CRM replacement. Engineering estimate: 4 weeks for parser + scoring API, 2 weeks for recruiter UI.',
    relatedNotes: [
      'ATS Integration Requirements',
      'Recruiter Workflow Research',
      'AI Bias Review Checklist',
    ],
  },
  {
    id: '3',
    tag: 'DRAFT',
    title: 'Weekly Sync Agenda',
    desc: 'Topics to cover: Q4 OKRs progress and infra migration...',
    time: 'Oct 12',
    updatedAt: 'Oct 12',
    createdAt: 'Oct 11, 2026',
    workspace: 'Team Planning',
    readTime: '3 min read',
    tags: ['#Meeting', '#Planning', '#OKRs'],
    summary:
      'Agenda for the weekly leadership sync: OKR progress, infrastructure migration status, hiring updates, and squad-level blockers with owners.',
    highlights: [
      'Review Q4 OKR completion percentages by team',
      'Infra migration timeline and rollback plan',
      'Open discussion on hiring pipeline delays',
      'Mobile release candidate status for v2.4',
      'Customer feedback themes from last sprint',
    ],
    sections: [
      {
        title: 'OKR review (10 min)',
        content:
          'Platform: 72% on reliability target. Mobile: 65% on feature delivery. AI: 80% on latency improvements. Flag any KR at risk and assign recovery actions.',
      },
      {
        title: 'Infrastructure migration (15 min)',
        content:
          'Database cutover scheduled for Oct 20. Review backup validation, read-replica lag tests, and on-call rotation for migration weekend. Rollback criteria: error rate > 2% or p95 latency > 800ms for 10 minutes.',
      },
      {
        title: 'Blockers and asks (10 min)',
        content:
          'Design bandwidth for onboarding refresh. QA environment instability slowing regression. Need decision on third-party analytics vendor renewal.',
      },
      {
        title: 'Closing (5 min)',
        content:
          'Confirm action item owners and deadlines. Share notes in #leadership-sync within 30 minutes of meeting end.',
      },
    ],
    actionItems: [
      'Send dashboard link 1 hour before meeting',
      'Prepare migration risk slide',
      'Collect blocker list from squad leads',
      'Book follow-up on analytics vendor decision',
    ],
    body:
      'Meeting owner: Preet. Attendees: squad leads, PM, engineering manager. Please add topics to the shared doc by EOD Sunday.\n\nPre-read: Q4 OKR dashboard, migration runbook v2, and hiring funnel report. If OKR review runs long, defer customer feedback section to async update.',
    relatedNotes: [
      'Q4 OKR Dashboard Link',
      'Infra Migration Runbook',
      'Hiring Funnel Report — Oct',
    ],
  },
];

const Notes = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute<RouteProp<MainTabParamList, 'Notes'>>();
  const noteSheetRef = useRef<BottomSheetModal>(null);
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [notesCursor, setNotesCursor] = useState('');
  const [loadedNotes, setLoadedNotes] = useState<StagedNoteCard[]>([]);
  const [nextNotesCursor, setNextNotesCursor] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [notePendingDelete, setNotePendingDelete] = useState<NoteItem | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<NoteSortOrder>('newest');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const userId = useAppSelector(state => state.auth.userId) ?? '';
  const [
    getStagedNoteById,
    {
      data: stagedNoteDetailData,
      isFetching: isFetchingNoteDetail,
      isError: isNoteDetailError,
    },
  ] = useLazyGetStagedNoteByIdQuery();
  const {
    data: noteWorkspacesData,
    isFetching,
    isError,
    refetch,
  } = useGetNoteWorkspacesQuery({ userId }, { skip: !userId });

  const spaces = useMemo(
    () => noteWorkspacesData?.data?.spaces ?? [],
    [noteWorkspacesData],
  );
  const selectedSpace = spaces.find(space => space.id === selectedSpaceId);
  const {
    data: stagedNotesData,
    isFetching: isFetchingNotes,
    isError: isNotesError,
    refetch: refetchNotes,
  } = useGetStagedNotesBySpaceQuery(
    {
      userId,
      spaceId: selectedSpaceId,
      limit: NOTES_PAGE_SIZE,
      cursor: notesCursor,
    },
    { skip: !userId || !selectedSpaceId },
  );

  const isInitialNotesLoading = isFetchingNotes && loadedNotes.length === 0;
  const isLoadingMoreNotes = isFetchingNotes && loadedNotes.length > 0;

  const displayedNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let result = [...loadedNotes];

    if (normalizedQuery) {
      result = result.filter(note => {
        const title = note.title?.toLowerCase() ?? '';
        const preview = note.bodyPreview?.toLowerCase() ?? '';
        return (
          title.includes(normalizedQuery) || preview.includes(normalizedQuery)
        );
      });
    }

    result.sort((left, right) => {
      const leftTime = new Date(
        left.updatedAt || left.createdAt || 0,
      ).getTime();
      const rightTime = new Date(
        right.updatedAt || right.createdAt || 0,
      ).getTime();

      return sortOrder === 'newest' ? rightTime - leftTime : leftTime - rightTime;
    });

    return result;
  }, [loadedNotes, searchQuery, sortOrder]);

  useFocusEffect(
    useCallback(() => {
      const spaceId = route.params?.spaceId;

      if (!spaceId) {
        return;
      }

      setSelectedSpaceId(spaceId);
      navigation.setParams({ spaceId: undefined });
    }, [navigation, route.params?.spaceId]),
  );

  useEffect(() => {
    if (spaces.length === 0) {
      return;
    }

    const selectedStillExists = spaces.some(space => space.id === selectedSpaceId);

    if (!selectedSpaceId || !selectedStillExists) {
      setSelectedSpaceId(spaces[0].id);
    }
  }, [selectedSpaceId, spaces]);

  useEffect(() => {
    setNotesCursor('');
    setLoadedNotes([]);
    setNextNotesCursor(null);
  }, [selectedSpaceId]);

  useEffect(() => {
    const response = stagedNotesData?.data;

    if (!response) {
      return;
    }

    setNextNotesCursor(response.nextCursor);

    if (notesCursor === '') {
      setLoadedNotes(response.notes);
      return;
    }

    setLoadedNotes(prev => {
      const existingIds = new Set(prev.map(note => note.id));
      const newNotes = response.notes.filter(note => !existingIds.has(note.id));

      return newNotes.length > 0 ? [...prev, ...newNotes] : prev;
    });
  }, [notesCursor, stagedNotesData]);

  const handleOpenNote = useCallback(
    (note: NoteItem) => {
      setSelectedNote(note);
      setSelectedNoteId(note.id);

      requestAnimationFrame(() => {
        noteSheetRef.current?.present();
      });

      getStagedNoteById({ noteId: note.id });
    },
    [getStagedNoteById],
  );

  const handleRetryNoteDetail = useCallback(() => {
    if (!selectedNoteId) {
      return;
    }

    getStagedNoteById({ noteId: selectedNoteId });
  }, [getStagedNoteById, selectedNoteId]);

  const handleConfirmDeleteNote = useCallback(() => {
    if (!notePendingDelete) {
      return;
    }

    setLoadedNotes(prev =>
      prev.filter(note => note.id !== notePendingDelete.id),
    );

    if (selectedNoteId === notePendingDelete.id) {
      noteSheetRef.current?.dismiss();
      setSelectedNote(null);
      setSelectedNoteId('');
    }

    setNotePendingDelete(null);
  }, [notePendingDelete, selectedNoteId]);

  const handleLoadMoreNotes = useCallback(() => {
    if (!nextNotesCursor || isLoadingMoreNotes) {
      return;
    }

    setNotesCursor(nextNotesCursor);
  }, [isLoadingMoreNotes, nextNotesCursor]);

  const formatDate = (value: string | null) => {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (value: string | null) => {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const toNoteItem = (note: StagedNoteCard): NoteItem => {
    const confidencePercent =
      typeof note.confidence === 'number'
        ? Math.round(note.confidence * 100)
        : null;
    const preview = note.bodyPreview || 'No note preview available.';
    const workspaceName = selectedSpace?.name || 'Space';

    return {
      id: note.id,
      tag: confidencePercent ? `CONF ${confidencePercent}%` : 'NOTE',
      title: note.title || 'Untitled note',
      desc: preview,
      time: formatTime(note.updatedAt || note.createdAt),
      updatedAt: formatDate(note.updatedAt),
      createdAt: formatDate(note.createdAt),
      workspace: workspaceName,
      readTime: 'Quick note',
      tags: ['#Note', `#${workspaceName.replace(/\s+/g, '')}`],
      summary: preview,
      highlights: [preview],
      sections: [
        {
          title: 'Captured note',
          content: preview,
        },
      ],
      actionItems: [],
      body: preview,
      relatedNotes: [],
    };
  };

  const renderRecentNotes = () => {
    if (isInitialNotesLoading) {
      return (
        <View style={styles.stateBox}>
          <ActivityIndicator size="small" color={COLORS.primaryDark} />
          <Text style={styles.stateText}>Loading notes...</Text>
        </View>
      );
    }

    if (isNotesError) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Unable to load notes.</Text>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.retryButton}
            onPress={refetchNotes}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!selectedSpaceId) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>Select a space</Text>
          <Text style={styles.stateText}>Space notes will appear here.</Text>
        </View>
      );
    }

    if (loadedNotes.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No notes yet</Text>
          <Text style={styles.stateText}>
            This space has no staged notes.
          </Text>
        </View>
      );
    }

    if (displayedNotes.length === 0) {
      return (
        <View style={styles.stateBox}>
          <Text style={styles.emptyTitle}>No matching notes</Text>
          <Text style={styles.stateText}>
            Try a different search term or clear your filters.
          </Text>
        </View>
      );
    }

    return (
      <>
        {displayedNotes.map(note => {
          const item = toNoteItem(note);

          return (
            <NoteCard
              key={item.id}
              item={item}
              onPress={() => handleOpenNote(item)}
              onDelete={() => setNotePendingDelete(item)}
            />
          );
        })}

        {nextNotesCursor ? (
          <View style={styles.paginationFooter}>
            <Text style={styles.paginationText}>
              Showing {loadedNotes.length}
              {selectedSpace?.notesCount ? ` of ${selectedSpace.notesCount}` : ''}{' '}
              notes
            </Text>
            <TouchableOpacity
              activeOpacity={0.78}
              disabled={isLoadingMoreNotes}
              style={[
                styles.loadMoreButton,
                isLoadingMoreNotes && styles.loadMoreButtonDisabled,
              ]}
              onPress={handleLoadMoreNotes}
            >
              {isLoadingMoreNotes ? (
                <ActivityIndicator size="small" color={COLORS.primaryDark} />
              ) : null}
              <Text style={styles.loadMoreText}>
                {isLoadingMoreNotes
                  ? 'Loading more notes...'
                  : 'Load more notes'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : loadedNotes.length >= NOTES_PAGE_SIZE ? (
          <View style={styles.paginationFooter}>
            <Text style={styles.paginationText}>
              All {loadedNotes.length} notes loaded
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerWrap}>
        <Header
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          isSearchActive={isSearchActive}
          onSearchQueryChange={setSearchQuery}
          onSearchOpen={() => setIsSearchActive(true)}
          onSearchClose={() => {
            setIsSearchActive(false);
            setSearchQuery('');
          }}
          onFilterPress={() => setFilterMenuVisible(true)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <CategoryTabs
          spaces={spaces}
          selectedSpaceId={selectedSpaceId}
          isLoading={isFetching}
          isError={isError}
          onRetry={refetch}
          onSelectSpace={setSelectedSpaceId}
        />

        <NotesProgressCard totalNotes={selectedSpace?.notesCount ?? 0} />

        <SectionHeader />

        {renderRecentNotes()}
      </ScrollView>

      <NoteDetailBottomSheet
        ref={noteSheetRef}
        note={selectedNote}
        detail={stagedNoteDetailData?.data ?? null}
        isLoading={isFetchingNoteDetail}
        isError={isNoteDetailError}
        onRetry={handleRetryNoteDetail}
      />

      <DeleteConfirmationModal
        visible={Boolean(notePendingDelete)}
        itemType="note"
        itemTitle={notePendingDelete?.title}
        onCancel={() => setNotePendingDelete(null)}
        onConfirm={handleConfirmDeleteNote}
      />

      <NotesFilterMenu
        visible={filterMenuVisible}
        sortOrder={sortOrder}
        onClose={() => setFilterMenuVisible(false)}
        onSelect={setSortOrder}
      />
    </SafeAreaView>
  );
};

export default Notes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
    paddingBottom: 40,
  },

  headerWrap: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  stateBox: {
    minHeight: 120,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  stateText: {
    marginTop: 8,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '800',
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },

  retryButton: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.purpleLight,
  },

  retryText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
  },

  loadMoreButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  loadMoreButtonDisabled: {
    opacity: 0.7,
  },

  loadMoreText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },

  paginationFooter: {
    marginBottom: 36,
  },

  paginationText: {
    marginBottom: 8,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
