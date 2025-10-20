import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useWindowDimensions } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { globalColors } from '../theme/theme';
import { IonIcon } from '../components/shared/IonIcon';
import { useTranslation } from 'react-i18next';
import { isDebugMode } from '../../sharedTypes/globlaVars';

import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { GestationScreen } from '../screens/Gestation/Gestation';
import { MaternityStackNavigator } from './Mat-StackNavigator';
import { CTIFeedScreen } from '../screens/HomeScreen/CTIFeedScreen';
import { GestationStackNavigator } from './GestationStackNavigator';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = '#3F0BAE';
const INACTIVE_COLOR = '#94A3B8';
const ACTIVE_BG = 'rgba(63,11,174,0.10)';

export const BottomTabNavigator = () => {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmall = width < 380; // iPhone SE / Android compactos

  // Helper para labels consistentes y de una sola línea
  const renderLabel = (txt: string) => ({ focused, color }: { focused: boolean; color: string }) => (
    <Text
      numberOfLines={1}
      ellipsizeMode="clip"
      allowFontScaling={false}
      style={{
        fontSize: isSmall ? 11 : 12,           // ↓ un poco en pantallas pequeñas
        fontWeight: focused ? '700' : '600',   // menos “gordo” = ocupa menos ancho
        color,
        marginBottom: isSmall ? 2 : 4,
        includeFontPadding: false,
      }}
    >
      {txt}
    </Text>
  );

  // Etiquetas abreviadas en pantallas pequeñas para evitar cualquier wrap
  const MAT_LABEL = isSmall ? 'Matern.' : 'Maternidad';
  const GES_LABEL = isSmall ? 'Gestac.' : 'Gestación';
  const HOME_LABEL = t('Tabs'); // “Inicio”, “Home”, etc.
  const FEED_LABEL = 'CTIFEED';

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: globalColors.background }}
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        tabBarStyle: {
          height: 54 + insets.bottom,                // un pelín más compacto
          paddingTop: 2,
          paddingBottom: Math.max(insets.bottom, 6),
          borderTopWidth: 1,
          borderColor: '#f1f1f1',
          elevation: 5,
          shadowColor: 'transparent',
          backgroundColor: globalColors.background,
        },

        tabBarItemStyle: {
          marginHorizontal: 4,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: 12,
          minWidth: isSmall ? 72 : 80,              // evita que el item sea demasiado estrecho
        },
        tabBarActiveBackgroundColor: ACTIVE_BG,
        tabBarInactiveBackgroundColor: 'transparent',

        tabBarShowLabel: true,
        tabBarLabelStyle: undefined, // usamos nuestro renderLabel

        tabBarIcon: ({ color }) => {
          const ICONS: Record<string, string> = {
            Tab1: 'home-outline',
            MaternidadTab: 'female-outline',
            GestacionTab: 'people-outline',
            Tab4: 'globe-outline',
          };
          const name = ICONS[route.name] ?? 'ellipse-outline';
          return <IonIcon name={name} color={color} size={22} />;
        },

        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Tab1"
        component={HomeScreen}
        options={{
          title: HOME_LABEL,
          tabBarLabel: renderLabel(HOME_LABEL),
        }}
      />

      <Tab.Screen
        name="MaternidadTab"
        component={MaternityStackNavigator}
        options={{
          title: MAT_LABEL,
          headerShown: false,
          tabBarLabel: renderLabel(MAT_LABEL),
        }}
      />

      <Tab.Screen
        name="GestacionTab"
        component={GestationStackNavigator}
        options={({ route }) => {
          const nested = getFocusedRouteNameFromRoute(route) ?? 'GES-HOME';
          const hideHeader =
            nested === 'GES-NOFEED' || nested === 'GES-CORRAL' || nested === 'GES-CORRALPC' || nested === 'GES-CORRAL-DETALLE';

          return {
            title: GES_LABEL,
            headerShown: !hideHeader,
            tabBarLabel: renderLabel(GES_LABEL),
          };
        }}
      />

      <Tab.Screen
        name="Tab4"
        component={CTIFeedScreen}
        options={{
          title: FEED_LABEL,
          tabBarLabel: renderLabel(FEED_LABEL),
        }}
      />

      {/* DEBUG opcional */}
      {isDebugMode && (
        <>
          <Tab.Screen name="Tab2" options={{ title: 'Gestación', tabBarLabel: renderLabel(GES_LABEL) }} component={GestationScreen} />
          <Tab.Screen name="Tab3" options={{ title: MAT_LABEL, tabBarLabel: renderLabel(MAT_LABEL) }} component={MaternityStackNavigator} />
        </>
      )}
    </Tab.Navigator>
  );
};
