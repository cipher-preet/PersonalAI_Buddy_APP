import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import SpaceCard from './SpaceCard';

const SPACES = [
  { id: 1, title: 'Personal', description: 'Daily conversations and notes' },
  { id: 2, title: 'Work', description: 'Meetings and productivity' },
  { id: 3, title: 'Fitness', description: 'Workout and health tracking' },
  { id: 4, title: 'Ideas', description: 'Startup and product ideas' },
  { id: 5, title: 'Projects', description: 'Track ongoing projects' },
  { id: 6, title: 'Travel', description: 'Trips and planning' },
  { id: 7, title: 'Travel', description: 'Trips and planning' },
  { id: 8, title: 'Travel', description: 'Trips and planning' },
];

const FOOTER_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

const VoiceAssistantSheet = forwardRef(({ onStart }: any, ref: any) => {
  const snapPoints = useMemo(() => ['80%'], []);
  const [selectedSpace, setSelectedSpace] = useState(SPACES[0]);
  const [spaceName, setSpaceName] = useState('');

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.startButton}
            onPress={() => onStart?.(selectedSpace)}
          >
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [selectedSpace, onStart],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
      footerComponent={renderFooter}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Start Voice Session</Text>
          <Text style={styles.subHeading}>
            Choose your workspace and continue.
          </Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Create new space..."
            placeholderTextColor="#9CA3AF"
            value={spaceName}
            onChangeText={setSpaceName}
            style={styles.input}
          />
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Spaces</Text>
          <Text style={styles.countText}>{SPACES.length}</Text>
        </View>

        <View style={styles.spaceContainer}>
          {SPACES.map(item => (
            <SpaceCard
              key={item.id}
              item={item}
              selected={selectedSpace?.id === item.id}
              onPress={() => setSelectedSpace(item)}
            />
          ))}
        </View>

        <View style={{ height: FOOTER_HEIGHT }} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default VoiceAssistantSheet;

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },

  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },

  indicator: {
    backgroundColor: '#CBD5E1',
    width: 70,
    height: 6,
    borderRadius: 999,
  },

  header: { marginBottom: 28 },

  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  subHeading: {
    marginTop: 8,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  input: {
    flex: 1,
    height: 54,
    backgroundColor: '#F7F8FD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    paddingHorizontal: 18,
    color: '#111827',
    fontSize: 14,
  },

  createBtn: {
    height: 54,
    marginLeft: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B5BFF',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },

  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },

  spaceContainer: { gap: 4 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  startButton: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4338CA',
    shadowColor: '#4338CA',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
