import React, { useMemo } from 'react';
import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from './Icon';
import { colors } from '../theme/colors';

/**
 * Hosts Tencent PalmAI's Mobile H5 widget (https://palm.tencent.com/docs/enterprise/api/mobile-h5)
 * inside a WebView. This is NOT a native SDK: Tencent's widget is a browser page loaded via a
 * `<script>` loader served from your account's own SDK Host — it captures the camera itself
 * (registration / verification / recognition) and reports a result back through `postMessage`,
 * which this component relays to `onResult`.
 *
 * `session` is whatever the backend's palmBiometricService.getEnrollmentSession() (or an
 * equivalent recognition/verification endpoint) returned: { token, userId, userName, phoneNo,
 * appId, sdkHost, mode }.
 *
 * NOTE: getUserMedia camera capture inside a WebView needs the app to hold camera permission —
 * add NSCameraUsageDescription (iOS) / the CAMERA permission (Android) to app.json (e.g. via the
 * expo-camera config plugin) before testing on a custom dev client build; Expo Go ships a generic
 * camera permission already and may work for quick checks.
 */
export default function PalmBiometricWebView({ visible, session, onResult, onClose }) {
  const html = useMemo(() => {
    if (!session?.sdkHost) return null;
    const params = {
      token: session.token,
      userId: session.userId,
      userName: session.userName,
      phoneNo: session.phoneNo,
      appId: session.appId,
      mode: session.mode || 'registration',
    };
    // Inline JSON is safe here: every value comes from our own backend response, not user input.
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <style>html,body,#root{margin:0;padding:0;width:100%;height:100%;background:#000;}</style>
  </head>
  <body>
    <div id="root"></div>
    <script src="${session.sdkHost}/palm_h5/loader/palm-mobile-manager.js"></script>
    <script>
      function post(payload) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
      try {
        PalmMobileManager.start(${JSON.stringify(params)}, function (result) {
          post(result);
        });
      } catch (err) {
        post({ code: -1, message: 'PalmMobileManager failed to start: ' + (err && err.message) });
      }
    </script>
  </body>
</html>`;
  }, [session]);

  if (!visible) return null;

  return (
    <Modal visible transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <Icon name="xmark" size={16} color={colors.white} />
        </Pressable>
        {html ? (
          <WebView
            source={{ html }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            onMessage={(event) => {
              try {
                onResult(JSON.parse(event.nativeEvent.data));
              } catch {
                onResult({ code: -1, message: 'Invalid result from Palm widget' });
              }
            }}
            style={styles.webview}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  webview: { flex: 1, backgroundColor: colors.black },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
