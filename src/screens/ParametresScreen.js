import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { colors, kycStatusColor, kycStatusLabel } from '../theme/colors';
import StatusBadge from '../components/StatusBadge';

function MenuItem({ label, onPress, danger }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function ParametresScreen({ navigation }) {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Paramètres</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.prenom?.[0] || '') + (user?.nom?.[0] || '')}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {user?.prenom} {user?.nom}
          </Text>
          <Text style={styles.profilePhone}>{user?.telephone}</Text>
          {user?.email ? <Text style={styles.profilePhone}>{user.email}</Text> : null}
          <View style={{ marginTop: 10 }}>
            <StatusBadge label={`KYC : ${kycStatusLabel(user?.statut_kyc)}`} color={kycStatusColor(user?.statut_kyc)} />
          </View>
        </Card>

        <Card style={{ marginTop: 16, paddingVertical: 4 }}>
          <MenuItem label="Compléter / suivre mon KYC" onPress={() => navigation.navigate('KycHome')} />
          <MenuItem label="Modifier mon code PIN" onPress={() => navigation.navigate('PinSetup', { mode: 'change' })} />
          <MenuItem label="Assistance & FAQ" onPress={() => navigation.navigate('Support')} />
        </Card>

        <Card style={{ marginTop: 16, paddingVertical: 4 }}>
          <MenuItem label="Se déconnecter" danger onPress={confirmLogout} />
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20 },
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
  },
  avatarText: { color: colors.white, fontWeight: '800', fontSize: 20 },
  profileName: { color: colors.white, fontWeight: '700', fontSize: 17 },
  profilePhone: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
