import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  TextInput,
  Modal,
  SafeAreaView
} from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// Default URL: Production deployed URL on Vercel
const DEFAULT_URL = 'https://gym-app-ten-lake.vercel.app';

export default function App() {
  const [currentUrl, setCurrentUrl] = useState(DEFAULT_URL);
  const [tempUrl, setTempUrl] = useState(DEFAULT_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const webViewRef = useRef(null);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const saveNewUrl = () => {
    let formatted = tempUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }
    setCurrentUrl(formatted);
    setShowSettings(false);
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#050505" />

      {/* Main WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onHttpError={() => {
          // If 404 or 500, still allow page to display if rendered by Next.js
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsBackForwardNavigationGestures={true}
        pullToRefreshEnabled={true}
        cacheEnabled={true}
        userAgent="BeastFitMobileApp/1.0"
      />

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D0FF00" />
          <Text style={styles.loadingText}>BEASTFIT AI LOADING...</Text>
        </View>
      )}

      {/* Connection Error Screen */}
      {hasError && (
        <View style={styles.errorContainer}>
          <View style={styles.errorBadge}>
            <Text style={styles.errorBadgeText}>OFFLINE / UNREACHABLE</Text>
          </View>
          <Text style={styles.errorTitle}>CANNOT CONNECT TO SERVER</Text>
          <Text style={styles.errorDesc}>
            {`Target URL: ${currentUrl}\n\nMake sure the server is running on this URL or update the connection address below.`}
          </Text>

          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>RETRY CONNECTION</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
            <Text style={styles.settingsButtonText}>CHANGE SERVER URL</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Modal to change URL */}
      <Modal visible={showSettings} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SERVER CONFIGURATION</Text>
            <Text style={styles.modalSubtitle}>
              Enter your live Vercel URL or local IP (e.g., http://192.168.1.5:3000):
            </Text>
            <TextInput
              style={styles.input}
              value={tempUrl}
              onChangeText={setTempUrl}
              placeholder="https://your-domain.vercel.app"
              placeholderTextColor="#71717A"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveNewUrl}
              >
                <Text style={styles.saveBtnText}>CONNECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050505',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#D0FF00',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBlack' : 'sans-serif-condensed',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 20,
  },
  errorBadge: {
    backgroundColor: 'rgba(255, 46, 84, 0.15)',
    borderColor: 'rgba(255, 46, 84, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  errorBadgeText: {
    color: '#FF2E54',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDesc: {
    color: '#A1A1AA',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#D0FF00',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#050505',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  settingsButton: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#121215',
    borderColor: '#27272A',
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#A1A1AA',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
    borderWidth: 1,
    borderRadius: 12,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#27272A',
  },
  cancelBtnText: {
    color: '#A1A1AA',
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#D0FF00',
  },
  saveBtnText: {
    color: '#050505',
    fontWeight: '900',
  },
});
