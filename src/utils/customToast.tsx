import React from 'react';
import {StyleSheet, View} from 'react-native';
import Toast from 'react-native-toast-message';
import TextCompoent, {Size} from './Text';

const toastConfig = {
  successResponse: ({text1}: any) => (
    <View style={styles.successContainer}>
      <TextCompoent
        style={styles.textStyle}
        size={Size.Small}
        color={'black'}
        fontWeight="700">
        {text1}
      </TextCompoent>
    </View>
  ),
  errorResponse: ({text1}: any) => (
    <View style={styles.errorContainer}>
      <TextCompoent
        style={styles.textStyle}
        size={Size.Small}
        color={'#f30e0eff'}
        fontWeight="700">
        {text1}
      </TextCompoent>
    </View>
  ),
  normalResponse: ({text1}: any) => (
    <View style={styles.normalContainer}>
      <TextCompoent
        style={styles.textStyle}
        size={Size.Small}
        color={'#0c0c0c'}
        fontWeight="700">
        {text1}
      </TextCompoent>
    </View>
  ),
};

// Toast functions
export const successToast = (message: string, time = 2000) => {
  Toast.show({
    type: 'successResponse',
    text1: message,
    position: 'top',
    visibilityTime: time,
    topOffset: 50,
  });
};

export const errorToast = (message: string, time = 2000, position = 'top') => {
  Toast.show({
    type: 'errorResponse',
    text1: message,
    position: position,
    visibilityTime: time,
    topOffset: 50,
  });
};

export const normalToast = (message: string, time = 2000) => {
  Toast.show({
    type: 'normalResponse',
    text1: message,
    position: 'top',
    visibilityTime: time,
    topOffset: 50,
  });
};

export default toastConfig;
const styles = StyleSheet.create({
  textStyle: {
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 18,
  },

  // ✅ SUCCESS
  successContainer: {
    minHeight: 51,
    width: '92%',
    backgroundColor: '#E6F8EC',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#22C55E',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // ❌ ERROR
  errorContainer: {
    minHeight: 55,
    width: '92%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#EF4444',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // ℹ️ NORMAL
  normalContainer: {
    minHeight: 48,
    width: '92%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#6B7280',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});

