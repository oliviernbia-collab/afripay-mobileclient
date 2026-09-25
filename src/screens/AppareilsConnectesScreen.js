import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import Icon from '../components/Icon';
import ErrorBanner from '../components/ErrorBanner';
import { useToast } from '../context/ToastContext';
import { getMySessions, revokeSession } from '../api/devices';
import { getDeviceInfo } from '../utils/deviceInfo';
import { colors } from '../theme/colors';
import { formatDate } from '../utils/format';

export default function AppareilsConnectesScreen() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState(null);
  const current = getDeviceInfo();

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getMySessions();
      setSessions(data);
    } catch (e) {
      setError(e.message || t('appareils.loadError'));
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load])
  );

  const onRevoke = (session) => {
    Alert.alert(
      t('appareils.revokeConfirmTitle'),
      t('appareils.revokeConfirmText', { device: session.appareil || t('appareils.unknownDevice') }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('appareils.revoke'),
          style: 'destructive',
          onPress: async () => {
            setRevokingId(session.id);
            try {
              await revokeSession(session.id);
              setSessions((prev) => prev.filter((s) => s.id !== session.id));
              showSuccess(t('appareils.revokeSuccess'));
            } catch (e) {
              showError(e.message || t('appareils.revokeError'));
            } finally {
              setRevokingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>{t('appareils.title')}</Text>
      <Text style={styles.subtitle}>{t('appareils.subtitle')}</Text>

      <ErrorBanner message={error} />

      {loading ? (
        <ActivityIndicator color={colors.white} style={{ marginTop: 30 }} />
      ) : sessions.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>{t('appareils.empty')}</Text>
        </Card>
      ) : (
        sessions.map((s) => {
          const isCurrent = s.appareil === current.appareil && s.os === current.os;
          return (
            <Card key={s.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Icon name={s.os?.toLowerCase().includes('ios') ? 'mobile-screen' : 'mobile-screen-button'} size={18} color={colors.turquoise} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTitleLine}>
                  <Text style={styles.rowTitle}>{s.appareil || t('appareils.unknownDevice')}</Text>
                  {isCurrent ? <Text style={styles.currentBadge}>{t('appareils.thisDevice')}</Text> : null}
                </View>
                <Text style={styles.rowSubtitle}>{s.os}</Text>
                <Text style={styles.rowDate}>{t('appareils.lastActivity', { date: formatDate(s.date_connexion) })}</Text>
              </View>
              <Pressable onPress={() => onRevoke(s)} disabled={revokingId === s.id} style={styles.revokeBtn}>
                {revokingId === s.id ? (
                  <ActivityIndicator size="small" color={colors.danger} />
                ) : (
                  <Icon name="right-from-bracket" size={16} color={colors.danger} />
                )}
              </Pressable>
            </Card>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 20 },
  emptyText: { color: colors.textSecondary, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTitle: { color: colors.white, fontWeight: '700', fontSize: 14 },
  currentBadge: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  rowSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowDate: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  revokeBtn: { padding: 8 },
});
