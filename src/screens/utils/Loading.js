import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function () {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
      }}
    >
      <ActivityIndicator size='large' color='#ff6e2a' />
    </View>
  );
}
