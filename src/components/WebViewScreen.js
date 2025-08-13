import React from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';

const WebViewScreen = ({ route }) => {
  const { uri, headers } = route.params;
  return (
    <WebView 
    source={{ uri: url, headers: headers }} 
     startInLoadingState={true}
      renderLoading={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    />
  );
};

export default WebViewScreen;
