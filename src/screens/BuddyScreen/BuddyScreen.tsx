import React from 'react';
import {
  ScrollView,
  StatusBar,
} from 'react-native';

import { SafeAreaView } from "react-native-safe-area-context"

import Header from './components/Header';
import Greeting from './components/Greeting';
import QuickActions from './components/QuickActions';
import UserMessage from './components/UserMessage';
import AIMessage from './components/AIMessage';
import ChatActions from './components/ChatActions';
import BottomInput from './components/BottomInput';

import { styles } from './styles';

const BuddyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <Greeting />

        <QuickActions />

        <UserMessage />

        <AIMessage />

        <ChatActions />
      </ScrollView>

      <BottomInput />
      
    </SafeAreaView>
  );
};

export default BuddyScreen;