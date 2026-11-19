import React, { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
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
  const [dialOpen, setDialOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [dialKey, setDialKey] = useState(0);
  const dialerRef = useRef<DialerHandle>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      setPage('chats');
    });
    return unsubscribe;
  }, [navigation]);

  const openDialer = (number = '') => {
    setDialNumber(number);
    setDialKey(key => key + 1);
    setDialOpen(true);
  };

  return (
    <View style={{ flex: 1 }}>
      {page === 'chats' ? <StaticChatsScreen /> : null}
      {page === 'history' ? (
        <CallHistoryScreen
          bottomPadding={contentPadding}
          onBack={() => setPage('chats')}
          onOpenContacts={() => setPage('contacts')}
          onOpenDialer={openDialer}
        />
      ) : null}
      {page === 'contacts' ? (
        <ContactsScreen
          bottomPadding={contentPadding}
          onBack={() => setPage('chats')}
          onOpenDialer={openDialer}
        />
      ) : null}
      <PhoneShortcutBar
        bottom={shortcutBottom}
        right={88}
        active={page === 'history' ? 'history' : page === 'contacts' ? 'contacts' : undefined}
        onHistory={() => setPage('history')}
        onContacts={() => setPage('contacts')}
        onDialer={() => openDialer('')}
      />
      <Modal
        visible={dialOpen}
        transparent
        animationType="none"
        statusBarTranslucent
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
