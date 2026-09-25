import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, Switch, ActivityIndicator, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { colors, kycStatusColor, kycStatusLabel } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';
import { resolveMediaUrl } from '../config/api';
import { uploadMyPhoto, removeMyPhoto } from '../api/kyc';
import {
  getBiometricCapability,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
  promptBiometricUnlock,
} from '../utils/biometricLock';

function MenuItem({ icon, label, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={[styles.menuIcon, danger && { backgroundColor: `${colors.danger}22` }]}>
        <Icon name={icon} size={15} color={danger ? colors.danger : colors.turquoise} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

// Renders its own section label + card, and nothing at all on a device with no biometric
// hardware/enrollment — so Paramètres never shows an empty "Sécurité" card.
function BiometricLockSection() {
  const { t } = useTranslation();
  const { showWarning, showSuccess } = useToast();
  const [available, setAvailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [capability, current] = await Promise.all([getBiometricCapability(), isBiometricLockEnabled()]);
      setAvailable(capability.available);
      setEnabled(current);
    })();
  }, []);

  const onToggle = async (next) => {
    setBusy(true);
    try {
      if (next) {
        // Confirme que l'utilisateur peut réellement s'authentifier avant d'activer le
        // verrouillage, pour ne jamais risquer de bloquer l'accès à son propre compte.
        const ok = await promptBiometricUnlock();
        if (!ok) {
          showWarning(t('parametres.biometricActivationCancelledText'));
          return;
        }
      }
      await setBiometricLockEnabled(next);
      setEnabled(next);
      showSuccess(t(next ? 'parametres.biometricEnabledSuccess' : 'parametres.biometricDisabledSuccess'));
    } finally {
      setBusy(false);
    }
  };

  if (!available) return null;

  return (
    <>
      <Text style={styles.sectionLabel}>{t('parametres.sectionSecurity')}</Text>
      <Card style={{ paddingVertical: 4 }}>
        <View style={styles.switchRow}>
          <View style={styles.menuIcon}>
            <Icon name="fingerprint" size={15} color={colors.turquoise} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuLabel}>{t('parametres.biometricLockTitle')}</Text>
            <Text style={styles.switchSubtitle}>{t('parametres.biometricLockSubtitle')}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={busy}
            trackColor={{ true: colors.turquoise, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>
    </>
  );
}

// Photo de profil (section 5.6) : tap ouvre caméra/galerie, appui long propose de retirer la
// photo actuelle. Met à jour AuthContext via refreshUser() pour refléter le changement partout.
function ProfileAvatar({ user }) {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const { showWarning, showError, showSuccess } = useToast();
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async (fromCamera) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showWarning(t('parametres.photo.permissionDeniedText'));
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      await uploadMyPhoto(result.assets[0].uri);
      await refreshUser();
      showSuccess(t('parametres.photo.uploadSuccess'));
    } catch (e) {
      showError(e.message || t('parametres.photo.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const onRemove = () => {
    Alert.alert(t('parametres.photo.removeConfirmTitle'), t('parametres.photo.removeConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: async () => {
          setUploading(true);
          try {
            await removeMyPhoto();
            await refreshUser();
            showSuccess(t('parametres.photo.removeSuccess'));
          } catch (e) {
            showError(e.message || t('parametres.photo.removeError'));
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

  const onPress = () => {
    const options = [
      { text: t('parametres.photo.takePhoto'), onPress: () => pickAndUpload(true) },
      { text: t('parametres.photo.chooseGallery'), onPress: () => pickAndUpload(false) },
    ];
    if (user?.photo_url) options.push({ text: t('parametres.photo.remove'), style: 'destructive', onPress: onRemove });
    options.push({ text: t('common.cancel'), style: 'cancel' });
    Alert.alert(t('parametres.photo.title'), undefined, options);
  };

  return (
    <Pressable onPress={onPress} disabled={uploading} style={styles.avatar}>
      {uploading ? (
        <ActivityIndicator color={colors.white} />
      ) : user?.photo_url ? (
        <Image source={{ uri: resolveMediaUrl(user.photo_url) }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarText}>{(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}</Text>
      )}
      <View style={styles.avatarEditBadge}>
        <Icon name="camera" size={11} color={colors.white} />
      </View>
    </Pressable>
  );
}

export default function ParametresScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert(t('parametres.logoutConfirmTitle'), t('parametres.logoutConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('parametres.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const onShareApp = () => {
    Share.share({ message: t('about.shareMessage') });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('parametres.title')}</Text>

        <Card style={styles.profileCard}>
          <ProfileAvatar user={user} />
          <Text style={styles.profileName}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={styles.profilePhone}>{user?.telephone}</Text>
          {user?.email ? <Text style={styles.profilePhone}>{user.email}</Text> : null}
          <View style={{ marginTop: 10 }}>
            <StatusBadge
              label={t('status.kycLabel', { status: kycStatusLabel(user?.statut_kyc, t) })}
              color={kycStatusColor(user?.statut_kyc)}
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>{t('parametres.sectionAccount')}</Text>
        <Card style={{ paddingVertical: 4 }}>
          <MenuItem icon="id-card" label={t('parametres.personalInfo')} onPress={() => navigation.navigate('KycInfo')} />
          <MenuItem icon="shield-halved" label={t('parametres.kycVerification')} onPress={() => navigation.navigate('KycHome')} />
          <MenuItem
            icon="key"
            label={t('parametres.pinCode')}
            onPress={() => navigation.navigate('PinSetup', { mode: 'change' })}
          />
          <MenuItem
            icon="mobile-screen-button"
            label={t('parametres.connectedDevices')}
            onPress={() => navigation.navigate('AppareilsConnectes')}
          />
        </Card>

        <BiometricLockSection />

        <Text style={styles.sectionLabel}>{t('parametres.sectionHelp')}</Text>
        <Card style={{ paddingVertical: 4 }}>
          <MenuItem icon="circle-question" label={t('parametres.faq')} onPress={() => navigation.navigate('Support')} />
          <MenuItem icon="share-nodes" label={t('parametres.shareApp')} onPress={onShareApp} />
        </Card>

        <Text style={styles.sectionLabel}>{t('parametres.sectionLegal')}</Text>
        <Card style={{ paddingVertical: 4 }}>
          <MenuItem icon="file-contract" label={t('parametres.terms')} onPress={() => navigation.navigate('Terms')} />
          <MenuItem icon="user-shield" label={t('parametres.privacy')} onPress={() => navigation.navigate('Privacy')} />
          <MenuItem icon="circle-info" label={t('about.title')} onPress={() => navigation.navigate('About')} />
        </Card>

        <Card style={{ marginTop: 16, paddingVertical: 4 }}>
          <MenuItem icon="right-from-bracket" label={t('parametres.logout')} danger onPress={confirmLogout} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 20 },
  profileCard: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'visible',
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.turquoise,
    borderWidth: 2,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 20 },
  profileName: { color: colors.white, fontWeight: '700', fontSize: 17 },
  profilePhone: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, color: colors.white, fontSize: 14, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  switchSubtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
});
