import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import BrandHeader from '../../components/BrandHeader';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!telephone || !motDePasse) {
      setError('Veuillez renseigner votre numéro et votre mot de passe.');
      return;
    }
    setLoading(true);
    try {
      await login(telephone.trim(), motDePasse);
      // Navigation switches automatically once `user` is set in AuthContext.
    } catch (e) {
      setError(e.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 40 }}>
        <BrandHeader size="large" />
      </View>

      <Text style={styles.title}>Connexion</Text>
      <ErrorBanner message={error} />

      <Input
        label="Numéro de téléphone"
        placeholder="Ex: 0102030405"
        keyboardType="phone-pad"
        value={telephone}
        onChangeText={setTelephone}
        autoCapitalize="none"
      />
      <Input
        label="Mot de passe"
        placeholder="••••••••"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />

      <GradientButton title="Se connecter" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />

      <Pressable onPress={() => navigation.navigate('RegisterPhone')} style={{ marginTop: 20 }}>
        <Text style={styles.link}>
          Pas encore de compte ? <Text style={styles.linkStrong}>Créer un compte</Text>
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginBottom: 18 },
  link: { color: colors.textSecondary, textAlign: 'center' },
  linkStrong: { color: colors.orange, fontWeight: '700' },
});
