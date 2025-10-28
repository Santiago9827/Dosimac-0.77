import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useWindowDimensions } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { IonIcon } from '../components/shared/IonIcon';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { MaternityStackNavigator } from './Mat-StackNavigator';
import { CTIFeedScreen } from '../screens/HomeScreen/CTIFeedScreen';
import { globalColors } from '../theme/theme';
import { isDebugMode } from '../../sharedTypes/globlaVars';
import { GestationStackNavigator } from './GestationStackNavigator';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = '#3F0BAE';
const INACTIVE_COLOR = '#94A3B8';
const ACTIVE_BG = 'rgba(63,11,174,0.10)';

export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const isSmall = width < 380;              // teléfonos compactos
  const superTight = width < 360 || fontScale > 1.15; // aún menos espacio

  // Helper de label: UNA sola línea, sin abreviar
  const renderLabel = (txt: string) => ({ focused, color }: any) => (
    <Text
      numberOfLines={1}
      ellipsizeMode="clip"
      allowFontScaling={false}           // evita que el sistema lo haga crecer y rompa
      style={{
        fontSize: superTight ? 10 : isSmall ? 11 : 12,   // ↓ un poco en compactos
        fontWeight: focused ? '700' : '600',
        color,
        marginBottom: superTight ? 1 : isSmall ? 2 : 4,
        includeFontPadding: false,
        textAlign: 'center',
      }}
    >
      {txt}
    </Text>
  );

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: globalColors.background }}
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        // Más ancho útil para cada item en teléfonos pequeños
        tabBarStyle: {
          height: 52 + insets.bottom,
          paddingTop: superTight ? 0 : 2,
          paddingBottom: Math.max(insets.bottom, superTight ? 4 : 6),
          borderTopWidth: 1,
          borderColor: '#f1f1f1',
          elevation: 5,
          shadowColor: 'transparent',
          backgroundColor: globalColors.background,
        },
        tabBarItemStyle: {
          flex: 1,                              // reparte todo el ancho disponible
          minWidth: 0,                          // permite encoger si hace falta
          marginHorizontal: superTight ? 0 : isSmall ? 2 : 4,
          paddingVertical: superTight ? 0 : isSmall ? 2 : 4,
          borderRadius: 12,
        },
        tabBarActiveBackgroundColor: ACTIVE_BG,
        tabBarInactiveBackgroundColor: 'transparent',

        tabBarShowLabel: true,
        tabBarLabelStyle: undefined,           // usamos renderLabel abajo

        tabBarIcon: ({ color }) => {
          const ICONS: Record<string, string> = {
            Tab1: 'home-outline',
            MaternidadTab: 'female-outline',
            GestacionTab: 'people-outline',
            Tab4: 'globe-outline',
          };
          const name = ICONS[route.name] ?? 'ellipse-outline';
          return <IonIcon name={name} color={color} size={superTight ? 20 : 22} />;
        },

        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Tab1"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarLabel: renderLabel('Inicio') }}
      />

      <Tab.Screen
        name="MaternidadTab"
        component={MaternityStackNavigator}
        options={{
          title: 'Maternidad',
          headerShown: false,
          tabBarLabel: renderLabel('Maternidad'),  // ← texto completo
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
            title: 'Gestación',
            headerShown: false,
            tabBarLabel: renderLabel('Gestación'), // ← texto completo
          };
        }}
      />

      <Tab.Screen
        name="Tab4"
        component={CTIFeedScreen}
        options={{ title: 'CTIFEED', tabBarLabel: renderLabel('CTIFEED') }}
      />

      {isDebugMode && (
        <>
          {/* …tabs de debug si los necesitas… */}
        </>
      )}
    </Tab.Navigator>
  );
};
