// EmptyListMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type EmptyListMessageProps = {
  message?: string;
};

const EmptyListMessage: React.FC<EmptyListMessageProps> = ({ message = "No data available." }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text   allowFontScaling={false}  style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   },
  emptyText: {
    fontSize: 16,
    color: 'balck',
    fontWeight: '500',
    textAlign:"center"
  },
});

export default EmptyListMessage;
