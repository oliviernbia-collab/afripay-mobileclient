import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import MainTabs from './MainTabs';
import RechargeScreen from '../screens/RechargeScreen';
import TransferScreen from '../screens/TransferScreen';
import HistoriqueDetailScreen from '../screens/HistoriqueDetailScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';
import TermsScreen from '../screens/TermsScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import PinSetupScreen from '../screens/auth/PinSetupScreen';
import KycHomeScreen from '../screens/kyc/KycHomeScreen';
import KycInfoScreen from '../screens/kyc/KycInfoScreen';
import KycDocumentScreen from '../screens/kyc/KycDocumentScreen';
import KycEnrollScreen from '../screens/kyc/KycEnrollScreen';
import AppareilsConnectesScreen from '../screens/AppareilsConnectesScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.black },
  headerTintColor: colors.white,
  headerTitleStyle: { color: colors.white },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Recharge" component={RechargeScreen} options={{ title: '' }} />
      <Stack.Screen name="Transfer" component={TransferScreen} options={{ title: '' }} />
      <Stack.Screen name="HistoriqueDetail" component={HistoriqueDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: '' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: '' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ title: '' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: '' }} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} options={{ title: '' }} />
      <Stack.Screen name="KycHome" component={KycHomeScreen} options={{ title: '' }} />
      <Stack.Screen name="KycInfo" component={KycInfoScreen} options={{ title: '' }} />
      <Stack.Screen name="KycDocument" component={KycDocumentScreen} options={{ title: '' }} />
      <Stack.Screen name="KycEnroll" component={KycEnrollScreen} options={{ title: '' }} />
      <Stack.Screen name="AppareilsConnectes" component={AppareilsConnectesScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
