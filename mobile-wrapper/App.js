import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { StatusBar } from 'expo-status-bar'

const WEB_APP_URL = 'https://ivorygalleries.app'

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <WebView
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F0' },
  webview: { flex: 1 },
})
