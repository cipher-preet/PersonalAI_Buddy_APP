import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import StaticChatsScreen from '../ChatsScreen/StaticChatsScreen';
import CallHistoryScreen from './CallHistoryScreen';
import ContactsScreen from './ContactsScreen';
import DialerScreen, { type DialerHandle } from './DialerScreen';
import PhoneShortcutBar from './PhoneShortcutBar';

type Page = 'chats' | 'history' | 'contacts';

const ChatsPhoneScreen = () => {
  const navigation = useNavigation();
  const { tabBarHeight, insets } = useResponsiveLayout();
  const shortcutBottom = Math.max(insets.bottom, 6) + tabBarHeight + 12;
  const contentPadding = shortcutBottom + 92;
  const [page, setPage] = useState<Page>('chats');
  const [seen, setSeen] = useState({ history: false, contacts: false });
  const [dialOpen, setDialOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [dialKey, setDialKey] = useState(0);
  const dialerRef = useRef<DialerHandle>(null);

  const goTo = useCallback((next: Page) => {
    setPage(current => (current === next ? current : next));
    if (next === 'history' || next === 'contacts') {
      setSeen(current => (current[next] ? current : { ...current, [next]: true }));
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      goTo('chats');
    });
    return unsubscribe;
  }, [goTo, navigation]);

  const openDialer = useCallback((number?: string) => {
    setDialNumber(typeof number === 'string' ? number : '');
    setDialKey(key => key + 1);
    setDialOpen(true);
  }, []);

  const showChats = useCallback(() => goTo('chats'), [goTo]);
  const showHistory = useCallback(() => goTo('history'), [goTo]);
  const showContacts = useCallback(() => goTo('contacts'), [goTo]);

  return (
    <View style={styles.screen}>
      <View
        style={page === 'chats' ? styles.layer : styles.hidden}
        pointerEvents={page === 'chats' ? 'auto' : 'none'}
      >
        <StaticChatsScreen />
      </View>
      {seen.history ? (
        <View
          style={page === 'history' ? styles.layer : styles.hidden}
          pointerEvents={page === 'history' ? 'auto' : 'none'}
        >
          <CallHistoryScreen
            bottomPadding={contentPadding}
            onBack={showChats}
            onOpenContacts={showContacts}
            onOpenDialer={openDialer}
          />
        </View>
      ) : null}
      {seen.contacts ? (
        <View
          style={page === 'contacts' ? styles.layer : styles.hidden}
          pointerEvents={page === 'contacts' ? 'auto' : 'none'}
        >
          <ContactsScreen
            bottomPadding={contentPadding}
            onBack={showChats}
            onOpenDialer={openDialer}
          />
        </View>
      ) : null}
      <PhoneShortcutBar
        bottom={shortcutBottom}
        right={88}
        active={page === 'history' ? 'history' : page === 'contacts' ? 'contacts' : undefined}
        onHistory={showHistory}
        onContacts={showContacts}
        onDialer={() => openDialer()}
      />
      <Modal
        visible={dialOpen}
        transparent
        animationType="none"
        statusBarTranslucent={false}
        onRequestClose={() => dialerRef.current?.close()}
      >
        <DialerScreen
          ref={dialerRef}
          key={dialKey}
          bottomPadding={Math.max(insets.bottom, 12)}
          initialNumber={dialNumber}
          onBack={() => setDialOpen(false)}
        />
      </Modal>
    </View>
  );
};

export default ChatsPhoneScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  layer: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
