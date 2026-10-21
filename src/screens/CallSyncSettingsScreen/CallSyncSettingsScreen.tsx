import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Contacts, { Contact } from 'react-native-contacts';
import Svg, { Path } from 'react-native-svg';

import { useToast } from '../../store/context/ToastContext';
import {
  colors,
  fontSize,
  fontWeight,
  layout,
  ms,
  radii,
  spacing,
  typography,
} from '../../theme';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  addNumberToWhitelist,
  checkOemCompatibility,
  getWhitelistedNumbers,
  normalizePhoneNumber,
  removeNumberFromWhitelist,
  requestCallSyncPermissions,
  requestContactsPermission,
  triggerManualSync,
  type CallSyncCompatibility,
} from '../../services/callSyncService';

const Icon = ({
  name,
  color = colors.text,
}: {
  name: 'back' | 'trash' | 'contacts' | 'sync' | 'search';
  color?: string;
}) => (
  <Svg
    width={ms(22)}
    height={ms(22)}
    viewBox="0 0 24 24"
    fill="none"
    accessible={false}
  >
    <Path
      d={
        name === 'back'
          ? 'm15 18-6-6 6-6'
          : name === 'trash'
          ? 'M5 7h14M9 7V4h6v3m2 0-.7 13H7.7L7 7m3 4v5m4-5v5'
          : name === 'contacts'
          ? 'M16 20v-1.5A3.5 3.5 0 0 0 12.5 15h-6A3.5 3.5 0 0 0 3 18.5V20m6.5-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 0 0 0-6m4.5 15v-1.5a3.5 3.5 0 0 0-2.5-3.35'
          : name === 'sync'
          ? 'M20 7v5h-5M4 17v-5h5m10.1 0A7 7 0 0 0 6.5 7.5L4 12m16 0-2.5 4.5A7 7 0 0 1 4.9 12'
          : 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z'
      }
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CallSyncSettingsScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { screenPadding, contentMaxWidth } = useResponsiveLayout();
  const [numbers, setNumbers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [compatibility, setCompatibility] =
    useState<CallSyncCompatibility | null>(null);
  const [contactModal, setContactModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [saved, device] = await Promise.all([
        getWhitelistedNumbers(),
        checkOemCompatibility(),
      ]);
      setNumbers(saved);
      setCompatibility(device);
    } catch (error: any) {
      showToast({
        message: error?.message || 'Unable to load call sync settings',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addNumber = async (raw = input) => {
    const normalized = normalizePhoneNumber(raw);
    if (!normalized) {
      showToast({
        message: 'Enter a valid phone number',
        description:
          'Use 7–15 digits and include the country code when possible.',
        type: 'error',
      });
      return;
    }
    try {
      const added = await addNumberToWhitelist(normalized);
      setInput('');
      setContactModal(false);
      if (!added)
        showToast({
          message: 'Number is already in the sync list',
          type: 'info',
        });
      await refresh();
    } catch {
      showToast({ message: 'Unable to add this number', type: 'error' });
    }
  };

  const openContacts = async () => {
    if (!(await requestContactsPermission())) {
      showToast({
        message: 'Contacts permission is required',
        description: 'You can still enter a number manually.',
        type: 'info',
      });
      return;
    }
    try {
      setContacts(await Contacts.getAllWithoutPhotos());
      setContactModal(true);
    } catch {
      showToast({ message: 'Unable to read contacts', type: 'error' });
    }
  };

  const enableAndSync = async () => {
    setSyncing(true);
    try {
      if (!(await requestCallSyncPermissions())) {
        showToast({
          message: 'Required permissions were not granted',
          description:
            'Phone, call log and audio access are needed to match recordings.',
          type: 'error',
        });
        return;
      }
      const result = await triggerManualSync();
      if (result.failed) {
        showToast({
          message: 'Recording upload failed',
          description:
            'Buddy will retry automatically when the connection is available.',
          type: 'error',
        });
        return;
      }
      showToast({
        message: result.uploaded
          ? `${result.uploaded} recording uploaded`
          : 'Sync check complete',
        description: result.recordingPending
          ? 'The dialer is still preparing the recording. Buddy will check again.'
          : result.scanned
          ? `${result.scanned} recent recording checked.`
          : 'No matching recent recording found.',
        type: 'success',
      });
    } catch {
      showToast({
        message: 'Call recording sync failed',
        description: 'Check your connection and upload endpoint configuration.',
        type: 'error',
      });
    } finally {
      setSyncing(false);
    }
  };

  const visibleNumbers = numbers.filter(number =>
    number.includes(filter.replace(/\D/g, '')),
  );
  const visibleContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();
    return contacts
      .filter(
        contact =>
          !query ||
          (contact.displayName || '').toLowerCase().includes(query) ||
          contact.phoneNumbers.some(phone => phone.number.includes(query)),
      )
      .slice(0, 100)
      .flatMap(contact =>
        contact.phoneNumbers.map((phone, index) => ({
          id: `${contact.recordID}-${index}`,
          name: contact.displayName || 'Unnamed contact',
          number: phone.number,
        })),
      );
  }, [contactSearch, contacts]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.container,
            { paddingHorizontal: screenPadding, maxWidth: contentMaxWidth },
          ]}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="back" />
            </Pressable>
            <View style={styles.headerText}>
              <Text style={typography.heading}>Call recording sync</Text>
              <Text style={typography.caption}>
                Only approved numbers are uploaded
              </Text>
            </View>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>
              {!compatibility?.isConfigured
                ? 'Upload setup required'
                : compatibility?.isSupported
                ? `${compatibility.manufacturer} device detected`
                : 'Compatibility may vary'}
            </Text>
            <Text style={styles.noticeBody}>
              {compatibility?.isConfigured
                ? 'Turn on automatic call recording in your phone’s native dialer. Buddy never records calls itself and only scans recordings after a call ends.'
                : 'Set CALL_SYNC_UPLOAD_URL when building the Android app before enabling call recording sync.'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Add a number</Text>
          <View style={styles.addRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              style={styles.input}
              accessibilityLabel="Phone number with country code"
              returnKeyType="done"
              onSubmitEditing={() => void addNumber()}
            />
            <Pressable
              onPress={() => void addNumber()}
              disabled={!input.trim()}
              style={({ pressed }) => [
                styles.addButton,
                !input.trim() && styles.disabled,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => void openContacts()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Icon name="contacts" color={colors.primary} />
            <Text style={styles.secondaryText}>Choose from contacts</Text>
          </Pressable>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Approved numbers</Text>
            <Text style={styles.count}>{numbers.length}</Text>
          </View>
          {numbers.length > 4 ? (
            <View style={styles.searchBox}>
              <Icon name="search" color={colors.subText} />
              <TextInput
                value={filter}
                onChangeText={setFilter}
                placeholder="Search numbers"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
          ) : null}
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={visibleNumbers}
              keyExtractor={item => item}
              style={styles.list}
              contentContainerStyle={
                visibleNumbers.length ? undefined : styles.emptyWrap
              }
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <>
                  <Text style={styles.emptyTitle}>No approved numbers yet</Text>
                  <Text style={styles.emptyBody}>
                    Add a number above. Recordings from every other caller will
                    be ignored.
                  </Text>
                </>
              }
              renderItem={({ item }) => (
                <View style={styles.numberRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.slice(-2)}</Text>
                  </View>
                  <Text style={styles.number}>{item}</Text>
                  <Pressable
                    onPress={async () => {
                      await removeNumberFromWhitelist(item);
                      await refresh();
                    }}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${item}`}
                  >
                    <Icon name="trash" color={colors.error} />
                  </Pressable>
                </View>
              )}
            />
          )}
          <Pressable
            onPress={() => void enableAndSync()}
            disabled={
              syncing ||
              numbers.length === 0 ||
              compatibility?.isConfigured === false
            }
            style={({ pressed }) => [
              styles.syncButton,
              (syncing ||
                !numbers.length ||
                compatibility?.isConfigured === false) &&
                styles.disabled,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            {syncing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Icon name="sync" color={colors.white} />
            )}
            <Text style={styles.syncText}>
              {syncing ? 'Checking…' : 'Enable permissions & sync now'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={contactModal}
        animationType="slide"
        onRequestClose={() => setContactModal(false)}
      >
        <SafeAreaView style={styles.safe}>
          <View
            style={[
              styles.modalContent,
              { paddingHorizontal: screenPadding, maxWidth: contentMaxWidth },
            ]}
          >
            <View style={styles.header}>
              <Pressable
                onPress={() => setContactModal(false)}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Close contacts"
              >
                <Icon name="back" />
              </Pressable>
              <Text style={typography.heading}>Choose a contact</Text>
            </View>
            <View style={styles.searchBox}>
              <Icon name="search" color={colors.subText} />
              <TextInput
                value={contactSearch}
                onChangeText={setContactSearch}
                autoFocus
                placeholder="Search contacts"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
              />
            </View>
            <FlatList
              data={visibleContacts}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => void addNumber(item.number)}
                  style={({ pressed }) => [
                    styles.contactRow,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                >
                  <View>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactNumber}>{item.number}</Text>
                  </View>
                  <Text style={styles.contactAdd}>Add</Text>
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  headerText: { flex: 1, gap: spacing.xs },
  iconButton: {
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.45 },
  notice: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.brandBorder,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    padding: spacing['2xl'],
    gap: spacing.sm,
    marginBottom: spacing['3xl'],
  },
  noticeTitle: { ...typography.subheading, color: colors.primaryDark },
  noticeBody: { ...typography.caption, lineHeight: ms(20) },
  sectionTitle: { ...typography.subheading, marginBottom: spacing.xl },
  addRow: { flexDirection: 'row', gap: spacing.md },
  input: {
    flex: 1,
    minHeight: layout.inputHeight,
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing['2xl'],
    color: colors.text,
    fontSize: fontSize.base,
  },
  addButton: {
    minWidth: ms(72),
    minHeight: layout.inputHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  addButtonText: { ...typography.button },
  secondaryButton: {
    minHeight: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.brandBorder,
  },
  secondaryText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing['4xl'],
  },
  count: {
    minWidth: ms(24),
    textAlign: 'center',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    borderRadius: radii.pill,
    overflow: 'hidden',
    fontWeight: fontWeight.bold,
  },
  searchBox: {
    minHeight: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    marginBottom: spacing.xl,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: fontSize.base },
  list: { flex: 1 },
  loader: { flex: 1 },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['4xl'],
  },
  emptyTitle: { ...typography.subheading, textAlign: 'center' },
  emptyBody: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  numberRow: {
    minHeight: ms(64),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: ms(40),
    height: ms(40),
    borderRadius: radii.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: fontWeight.bold },
  number: {
    flex: 1,
    marginLeft: spacing.xl,
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.medium,
  },
  syncButton: {
    minHeight: ms(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    marginTop: spacing['2xl'],
  },
  syncText: { ...typography.button },
  modalContent: { flex: 1, width: '100%', alignSelf: 'center' },
  contactRow: {
    minHeight: ms(64),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  contactName: { ...typography.bodyMedium },
  contactNumber: { ...typography.caption },
  contactAdd: { color: colors.primary, fontWeight: fontWeight.bold },
});

export default CallSyncSettingsScreen;
