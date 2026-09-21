import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import GradientButton from '../../components/GradientButton';
import ErrorBanner from '../../components/ErrorBanner';
import { submitPersonalInfo } from '../../api/kyc';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function KycInfoScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [nom, setNom] = useState(user?.nom || '');
  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(user?.date_naissance || '');
  const [adresse, setAdresse] = useState(user?.adresse || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await submitPersonalInfo({ nom, prenom, dateNaissance: dateNaissance || undefined, adresse: adresse || undefined });
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      setError(e.message || 'Impossible d’enregistrer vos informations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Informations personnelles</Text>
      <ErrorBanner message={error} />
      <Input label="Nom" value={nom} onChangeText={setNom} />
      <Input label="Prénom" value={prenom} onChangeText={setPrenom} />
      <Input
        label="Date de naissance"
        placeholder="AAAA-MM-JJ"
        value={dateNaissance}
        onChangeText={setDateNaissance}
      />
      <Input label="Adresse" placeholder="Ville, quartier..." value={adresse} onChangeText={setAdresse} />
      <GradientButton title="Enregistrer" onPress={onSubmit} loading={loading} style={{ marginTop: 8 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 18 },
});
