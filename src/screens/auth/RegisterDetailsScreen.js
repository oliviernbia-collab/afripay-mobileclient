import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function RegisterDetailsScreen({ route, navigation }) {
  const { telephone, otp } = route.params;
  const { register } = useAuth();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (!nom.trim() || !prenom.trim() || !motDePasse) {
      setError('Nom, prénom et mot de passe sont requis.');
      return;
    }
    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await register({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone,
        email: email.trim() || undefined,
        motDePasse,
        otp,
      });
      navigation.reset({ index: 0, routes: [{ name: 'PinSetup' }] });
    } catch (e) {
      setError(e.message || 'Inscription impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Vos informations</Text>
      <ErrorBanner message={error} />
      <Input label="Nom" placeholder="Kouassi" value={nom} onChangeText={setNom} />
      <Input label="Prénom" placeholder="Awa" value={prenom} onChangeText={setPrenom} />
      <Input
        label="Email (optionnel)"
        placeholder="awa@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        label="Mot de passe"
        placeholder="Au moins 6 caractères"
        secureTextEntry
        value={motDePasse}
        onChangeText={setMotDePasse}
      />
      <Input
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        secureTextEntry
        value={confirmation}
        onChangeText={setConfirmation}
      />
      <GradientButton title="Créer mon compte" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 18 },
});
