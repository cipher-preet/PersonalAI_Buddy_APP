import React, { forwardRef, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { UpArrowIcon } from '../../../../styles/icons';
import type { Space } from '../../../store/api/home';
import { CHAT } from '../styles';
import {
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
} from '../../../theme';

export const INPUT_BAR_HEIGHT = ms(64);
const MIN_INPUT_HEIGHT = ms(22);
const MAX_INPUT_HEIGHT = ms(88);

type ContextSpace = {
  id: string;
  name: string;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onFocus?: TextInputProps['onFocus'];
  disabled?: boolean;
  selectedSpaces?: ContextSpace[];
  spaces?: Space[];
  spacesLoading?: boolean;
  spacesError?: boolean;
  onToggleSpace?: (spaceId: string) => void;
  onRemoveSpace?: (spaceId: string) => void;
  onRetrySpaces?: () => void;
};

const CloseIcon = ({ color = CHAT.primary }: { color?: string }) => (
  <Svg width={ms(11)} height={ms(11)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6 6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  </Svg>
);

const FolderIcon = ({ color = CHAT.textMuted }: { color?: string }) => (
  <Svg width={ms(15)} height={ms(15)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

const SearchIcon = ({ color = CHAT.textMuted }: { color?: string }) => (
  <Svg width={ms(16)} height={ms(16)} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const BottomInput = forwardRef<TextInput, Props>(
  (
    {
      value,
      onChangeText,
      onSend,
      onFocus,
      disabled = false,
      selectedSpaces = [],
      spaces = [],
      spacesLoading = false,
      spacesError = false,
      onToggleSpace,
      onRemoveSpace,
      onRetrySpaces,
    },
    ref,
  ) => {
    const canSend = value.trim().length > 0 && !disabled;
    const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
    const [contextOpen, setContextOpen] = useState(false);
    const [contextQuery, setContextQuery] = useState('');

    const selectedIds = useMemo(
      () => new Set(selectedSpaces.map(space => space.id)),
      [selectedSpaces],
    );

    const filteredSpaces = useMemo(() => {
      const query = contextQuery.trim().toLowerCase();
      if (!query) {
        return spaces;
      }
      return spaces.filter(space =>
        space.spacename.toLowerCase().includes(query),
      );
    }, [contextQuery, spaces]);

    const closeContext = () => {
      setContextOpen(false);
      setContextQuery('');
    };

    return (
      <View style={styles.wrapper}>
        <View style={styles.composerBox}>
          {selectedSpaces.length > 0 ? (
            <View style={styles.chipsRow}>
              {selectedSpaces.map(space => (
                <View key={space.id} style={styles.chip}>
                  <Text style={styles.chipLabel} numberOfLines={1}>
                    @{space.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.chipRemove}
                    onPress={() => onRemoveSpace?.(space.id)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${space.name} context`}
                  >
                    <CloseIcon />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.contextButton, contextOpen && styles.contextButtonOpen]}
            activeOpacity={0.85}
            onPress={() => setContextOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Add context"
          >
            <Text style={styles.contextAt}>@</Text>
            <Text style={styles.contextButtonText}>Add context</Text>
          </TouchableOpacity>

          <TextInput
            ref={ref}
            placeholder="Ask anything about your conversations"
            placeholderTextColor={CHAT.textSoft}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onContentSizeChange={event => {
              const next = Math.min(
                MAX_INPUT_HEIGHT,
                Math.max(
                  MIN_INPUT_HEIGHT,
                  event.nativeEvent.contentSize.height,
                ),
              );
              setInputHeight(next);
            }}
            style={[styles.input, { height: inputHeight }]}
            multiline
            maxLength={2000}
            returnKeyType="default"
            blurOnSubmit={false}
            textAlignVertical="top"
            editable={!disabled}
            scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
          />

          <View style={styles.footer}>
            <View style={styles.footerSpacer} />
            <TouchableOpacity
              style={[styles.sendButton, canSend && styles.sendButtonActive]}
              onPress={onSend}
              activeOpacity={0.85}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Send"
            >
              <UpArrowIcon
                width={ms(15)}
                height={ms(15)}
                color={canSend ? CHAT.surface : CHAT.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={contextOpen}
          transparent
          animationType="fade"
          onRequestClose={closeContext}
        >
          <Pressable style={styles.modalBackdrop} onPress={closeContext}>
            <Pressable style={styles.contextPopover} onPress={() => undefined}>
              <View style={styles.contextSearch}>
                <SearchIcon />
                <TextInput
                  value={contextQuery}
                  onChangeText={setContextQuery}
                  placeholder="Search spaces"
                  placeholderTextColor={CHAT.textSoft}
                  style={styles.contextSearchInput}
                  autoFocus
                />
              </View>

              <View style={styles.contextBody}>
                {spacesLoading ? (
                  <View style={styles.contextState}>
                    <ActivityIndicator size="small" color={CHAT.primary} />
                    <Text style={styles.contextStateText}>Loading spaces…</Text>
                  </View>
                ) : null}

                {spacesError && !spacesLoading ? (
                  <View style={styles.contextState}>
                    <Text style={styles.contextError}>Unable to load spaces</Text>
                    {onRetrySpaces ? (
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={onRetrySpaces}
                      >
                        <Text style={styles.retryText}>Retry</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                ) : null}

                {!spacesLoading && !spacesError && filteredSpaces.length > 0 ? (
                  <>
                    <Text style={styles.contextSectionLabel}>Spaces</Text>
                    <FlatList
                      data={filteredSpaces}
                      keyExtractor={item => item._id}
                      keyboardShouldPersistTaps="handled"
                      style={styles.contextList}
                      renderItem={({ item }) => {
                        const selected = selectedIds.has(item._id);
                        return (
                          <TouchableOpacity
                            style={[
                              styles.contextItem,
                              selected && styles.contextItemSelected,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => onToggleSpace?.(item._id)}
                          >
                            <FolderIcon
                              color={selected ? CHAT.primary : CHAT.textMuted}
                            />
                            <Text style={styles.contextItemText} numberOfLines={1}>
                              {item.spacename}
                            </Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  </>
                ) : null}

                {!spacesLoading &&
                !spacesError &&
                filteredSpaces.length === 0 ? (
                  <View style={styles.contextState}>
                    <Text style={styles.contextStateText}>No matches</Text>
                    <Text style={styles.contextStateHint}>
                      {spaces.length === 0
                        ? 'Create a space on Home to use it as chat context.'
                        : 'Try another search term.'}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.contextDone}
                onPress={closeContext}
                activeOpacity={0.85}
              >
                <Text style={styles.contextDoneText}>Done</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  },
);

BottomInput.displayName = 'BottomInput';

export default BottomInput;

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: spacing.xs,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
    backgroundColor: CHAT.surface,
  },

  composerBox: {
    backgroundColor: CHAT.surface,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: CHAT.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  chip: {
    maxWidth: '100%',
    minHeight: ms(28),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: CHAT.primarySoft,
  },

  chipLabel: {
    maxWidth: ms(180),
    color: CHAT.primary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  chipRemove: {
    width: ms(16),
    height: ms(16),
    borderRadius: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19, 85, 255, 0.12)',
  },

  contextButton: {
    alignSelf: 'flex-start',
    minHeight: ms(28),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: CHAT.borderStrong,
    backgroundColor: CHAT.surface,
  },

  contextButtonOpen: {
    borderColor: CHAT.primary,
    backgroundColor: CHAT.primarySoft,
  },

  contextAt: {
    color: CHAT.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  contextButtonText: {
    color: '#53627A',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  input: {
    width: '100%',
    fontSize: fontSize.base,
    lineHeight: ms(22),
    color: CHAT.text,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  footerSpacer: {
    flex: 1,
  },

  sendButton: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    backgroundColor: CHAT.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonActive: {
    backgroundColor: CHAT.primary,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    padding: spacing.xl,
  },

  contextPopover: {
    maxHeight: '70%',
    borderRadius: radii['2xl'],
    backgroundColor: CHAT.surface,
    borderWidth: 1,
    borderColor: CHAT.border,
    overflow: 'hidden',
  },

  contextSearch: {
    minHeight: ms(46),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CHAT.border,
  },

  contextSearchInput: {
    flex: 1,
    color: CHAT.text,
    fontSize: fontSize.base,
    paddingVertical: spacing.md,
  },

  contextBody: {
    maxHeight: ms(280),
    paddingVertical: spacing.sm,
  },

  contextList: {
    maxHeight: ms(220),
  },

  contextSectionLabel: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    color: '#7B8AA3',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  contextItem: {
    minHeight: ms(38),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },

  contextItemSelected: {
    backgroundColor: CHAT.primarySoft,
  },

  contextItemText: {
    flex: 1,
    color: CHAT.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  contextState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },

  contextStateText: {
    color: CHAT.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  contextStateHint: {
    color: CHAT.textSoft,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },

  contextError: {
    color: '#B42318',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  retryButton: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: CHAT.surfaceMuted,
  },

  retryText: {
    color: CHAT.text,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  contextDone: {
    minHeight: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CHAT.border,
  },

  contextDoneText: {
    color: CHAT.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
