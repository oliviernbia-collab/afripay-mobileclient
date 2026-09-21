import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterPhoneScreen from '../screens/auth/RegisterPhoneScreen';
import OtpScreen from '../screens/auth/OtpScreen';
import RegisterDetailsScreen from '../screens/auth/RegisterDetailsScreen';
import PinSetupScreen from '../screens/auth/PinSetupScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.black },
  headerTintColor: colors.white,
  headerTitleStyle: { color: colors.white },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
};

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RegisterPhone" component={RegisterPhoneScreen} options={{ title: '' }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: '' }} />
      <Stack.Screen name="RegisterDetails" component={RegisterDetailsScreen} options={{ title: '' }} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} options={{ title: '', headerBackVisible: false }} />
    </Stack.Navigator>
  );
}
