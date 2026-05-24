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
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  indicator: {
    backgroundColor: '#D1D5DB',
    width: 55,
    height: 5,
    borderRadius: 999,
  },

  header: { marginBottom: 28 },

  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  subHeading: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  input: {
    flex: 1,
    height: 54,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    color: '#111827',
    fontSize: 14,
  },

  createBtn: {
    height: 54,
    marginLeft: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3563FF',
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
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
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
    borderTopColor: '#EEF2F7',
  },

  startButton: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3563FF',
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
