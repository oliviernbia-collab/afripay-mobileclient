import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import SplashScreen from '../screens/SplashScreen';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.black,
    text: colors.white,
    border: colors.border,
    primary: colors.magenta,
  },
};

// While `booting` is true, AuthContext is still checking for a stored
// session token, so we show the Splash screen outside of the navigator
// (it isn't a navigable route — the router below decides Auth vs Main
// automatically once booting finishes).
export default function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) return <SplashScreen />;

  return <NavigationContainer theme={navTheme}>{user ? <MainStack /> : <AuthStack />}</NavigationContainer>;
}
