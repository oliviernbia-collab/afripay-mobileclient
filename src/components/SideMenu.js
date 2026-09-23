import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Animated, Dimensions, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import { colors, radius, kycStatusColor, kycStatusLabel } from '../theme/colors';
import { resolveMediaUrl } from '../config/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

const MENU_ITEMS = [
  { key: 'KycInfo', icon: 'id-card', labelKey: 'sideMenu.personalInfo' },
  { key: 'KycHome', icon: 'shield-halved', labelKey: 'sideMenu.kycVerification' },
  { key: 'PinSetup', icon: 'key', labelKey: 'sideMenu.pinCode', params: { mode: 'change' } },
  { key: 'AppareilsConnectes', icon: 'mobile-screen-button', labelKey: 'sideMenu.connectedDevices' },
  { key: 'Paramètres', icon: 'gear', labelKey: 'sideMenu.allSettings' },
  { key: 'Support', icon: 'circle-question', labelKey: 'sideMenu.helpFaq' },
];

// Menu latéral "coulisant" ouvert depuis l'avatar du tableau de bord — accès rapide au
// profil et aux sections clés du compte sans quitter l'écran d'accueil.
export default function SideMenu({ visible, onClose, user, navigation, onLogout }) {
  const { t } = useTranslation();
  const [translateX] = useState(() => new Animated.Value(-MENU_WIDTH));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  // Keeps the panel mounted for the duration of the close animation after `visible`
  // flips back to false (adjusting state during render — see React docs on storing
  // information from previous renders — instead of an effect, to avoid an extra frame).
  const [prevVisible, setPrevVisible] = useState(visible);
  const [closing, setClosing] = useState(false);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setClosing(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]).start();
    } else if (closing) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: -MENU_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setClosing(false);
      });
    }
  }, [visible, closing, translateX, backdropOpacity]);

  if (!visible && !closing) return null;

  const go = (screen, params) => {
    onClose();
    navigation.navigate(screen, params);
  };

  const confirmLogout = () => {
    onClose();
    Alert.alert(t('parametres.logoutConfirmTitle'), t('parametres.logoutConfirmText'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('sideMenu.logout'), style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.panel, { width: MENU_WIDTH, transform: [{ translateX }] }]}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.panelContent}>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                <Icon name="xmark" size={16} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.profileBlock}>
                <View style={styles.avatar}>
                  {user?.photo_url ? (
                    <Image source={{ uri: resolveMediaUrl(user.photo_url) }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}</Text>
                  )}
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {user?.prenom} {user?.nom}
                </Text>
                <Text style={styles.phone}>{user?.telephone}</Text>
                <View style={{ marginTop: 8 }}>
                  <StatusBadge
                    label={t('status.kycLabel', { status: kycStatusLabel(user?.statut_kyc, t) })}
                    color={kycStatusColor(user?.statut_kyc)}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              {MENU_ITEMS.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                  onPress={() => go(item.key, item.params)}
                >
                  <View style={styles.itemIcon}>
                    <Icon name={item.icon} size={14} color={colors.turquoise} />
                  </View>
                  <Text style={styles.itemLabel}>{t(item.labelKey)}</Text>
                  <Icon name="chevron-right" size={13} color={colors.textSecondary} />
                </Pressable>
              ))}

              <Pressable
                style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                onPress={confirmLogout}
              >
                <Icon name="right-from-bracket" size={15} color={colors.danger} />
                <Text style={styles.logoutText}>{t('sideMenu.logout')}</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  panelContent: { padding: 20, paddingBottom: 32 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileBlock: { alignItems: 'center', paddingBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 20 },
  name: { color: colors.white, fontWeight: '700', fontSize: 16 },
  phone: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radius.md,
  },
  itemPressed: { backgroundColor: colors.bg },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${colors.turquoise}22`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: { flex: 1, color: colors.white, fontSize: 14, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: `${colors.danger}55`,
    backgroundColor: `${colors.danger}14`,
  },
  logoutBtnPressed: { backgroundColor: `${colors.danger}26` },
  logoutText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
});
