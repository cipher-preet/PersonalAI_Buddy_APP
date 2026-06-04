import React, { forwardRef, useMemo, useState } from 'react';

import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

const CreateSpaceBottomSheet = forwardRef((_props: any, ref: any) => {
  const snapPoints = useMemo(() => ['35%'], []);

  const [spaceName, setSpaceName] = useState('');

  const handleCreate = () => {
    console.log(spaceName);

    ref?.current?.dismiss();
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustPan"
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
        />
      )}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Create New Space</Text>

        <Text style={styles.subtitle}>Give your space a name</Text>

        <View style={styles.inputContainer}>
          <BottomSheetTextInput
            value={spaceName}
            onChangeText={setSpaceName}
            placeholder="Enter space name"
            placeholderTextColor="#8E8E93"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Space</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default CreateSpaceBottomSheet;

const styles = StyleSheet.create({
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

  container: {
    flex: 1,
    padding: 22,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 24,
  },

  inputContainer: {
    marginBottom: 24,
  },

  input: {
    height: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#F7F8FD',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    fontSize: 16,
  },

  button: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#4338CA',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
    shadowColor: '#4338CA',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
