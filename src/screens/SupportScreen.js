import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { colors } from '../theme/colors';

const FAQ = [
  {
    q: 'Comment recharger mon compte AfriPay ?',
    a: 'Depuis le tableau de bord, appuyez sur "Recharger", choisissez Wave, Orange Money, Moov Money, MTN MoMo, Djamo ou une carte Visa, puis saisissez le montant.',
  },
  {
    q: "Pourquoi mes recharges sont-elles plafonnées à 10 000 FCFA ?",
    a: "Tant que votre dossier KYC n'est pas validé, la réglementation limite le cumul de vos recharges à 10 000 FCFA. Complétez votre KYC pour lever ce plafond.",
  },
  {
    q: 'Comment payer un marchand sans espèces ?',
    a: 'Ouvrez l\'onglet "Payer" et présentez votre QR code AfriPay au terminal du marchand. C\'est l\'équivalent numérique de la présentation de votre paume.',
  },
  {
    q: 'Quand dois-je saisir mon code PIN ?',
    a: 'Le code PIN AfriPay est requis pour confirmer tout transfert de 50 000 FCFA ou plus.',
  },
  {
    q: 'Un problème avec une transaction ?',
    a: 'Contactez le support AfriPay au +225 00 00 00 00 ou support@afripay.africa.',
  },
];

export default function SupportScreen() {
  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Assistance & FAQ</Text>
        {FAQ.map((item) => (
          <Card key={item.q} style={styles.card}>
            <Text style={styles.question}>{item.q}</Text>
            <Text style={styles.answer}>{item.a}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.white, fontSize: 20, fontWeight: '700', marginTop: 10, marginBottom: 18 },
  card: { marginBottom: 12 },
  question: { color: colors.white, fontWeight: '700', marginBottom: 6 },
  answer: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
