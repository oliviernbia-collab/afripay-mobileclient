import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import { colors } from '../theme/colors';
import DashboardScreen from '../screens/DashboardScreen';
import PayerScreen from '../screens/PayerScreen';
import HistoriqueScreen from '../screens/HistoriqueScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ParametresScreen from '../screens/ParametresScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Accueil: 'house',
  Payer: 'qrcode',
  Historique: 'clock-rotate-left',
  Notifications: 'bell',
  Paramètres: 'gear',
};

function TabIcon({ route, focused }) {
  return (
    <Icon name={ICONS[route.name] || 'circle'} size={18} color={focused ? colors.white : colors.turquoise} />
  );
}

// Route names stay fixed French keys (used throughout for navigation.navigate calls) —
// only the visible tabBarLabel is translated here.
export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.turquoise,
        tabBarStyle: { backgroundColor: colors.black, borderTopColor: colors.border },
        tabBarIcon: ({ focused }) => <TabIcon route={route} focused={focused} />,
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} options={{ tabBarLabel: t('nav.accueil') }} />
      <Tab.Screen name="Payer" component={PayerScreen} options={{ tabBarLabel: t('nav.payer') }} />
      <Tab.Screen name="Historique" component={HistoriqueScreen} options={{ tabBarLabel: t('nav.historique') }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: t('nav.notifications') }} />
      <Tab.Screen name="Paramètres" component={ParametresScreen} options={{ tabBarLabel: t('nav.parametres') }} />
    </Tab.Navigator>
  );
}
