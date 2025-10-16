/* eslint-disable prettier/prettier */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
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

const ACTIVE_COLOR = "#3F0BAE"; // '#3B82F6' // azul
const INACTIVE_COLOR = '#94A3B8';
const ACTIVE_BG = 'rgba(63,11,174,0.10)';

export const BottomTabNavigator = () => {
  const { t } = useTranslation('common');
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      sceneContainerStyle={{ backgroundColor: globalColors.background }}
      screenOptions={({ route }) => ({
        headerShown: true,

        // Colores
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,

        // Barra compacta y con aire
        tabBarStyle: {
          height: 58 + insets.bottom,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 8),
          borderTopWidth: 1,
          borderColor: '#f1f1f1',
          elevation: 5,
          shadowColor: 'transparent',
          backgroundColor: globalColors.background,
        },

        // “Pill” sutil y proporción equilibrada
        tabBarItemStyle: {
          marginHorizontal: 6,
          paddingVertical: 4,
          borderRadius: 12,
        },
        tabBarActiveBackgroundColor: ACTIVE_BG,
        tabBarInactiveBackgroundColor: 'transparent',

        // Texto más discreto pero claro
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,       // ↓ más pequeño
          fontWeight: '600',  // semi-bold (no 700/800)
          marginBottom: 4,
        },

        // ——— Iconos CONSISTENTES (todos outline) ———
        tabBarIcon: ({ color }) => {
          const ICONS: Record<string, string> = {
            Tab1: 'home-outline',
            MaternidadTab: 'female-outline',       // o 'heart-outline' si prefieres
            GestacionTab: 'people-outline',       // NO usar *-circle-* para mantener estilo
            Tab4: 'globe-outline',
          };
          const name = ICONS[route.name] ?? 'ellipse-outline';
          return <IonIcon name={name} color={color} size={22} />; // mismo tamaño en activo/inactivo
        },

        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Tab1"
        component={HomeScreen}
        options={{
          title: t('Tabs'),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 14, fontWeight: focused ? '800' : '700', color, marginBottom: 6 }}>
              {t('Tabs')}
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="MaternidadTab"
        component={MaternityStackNavigator}
        options={{
          title: 'Maternidad',
          headerShown: false, // el header lo lleva el stack
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 14, fontWeight: focused ? '800' : '700', color, marginBottom: 6 }}>
              Maternidad
            </Text>
          ),
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
            headerShown: !hideHeader,
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ fontSize: 14, fontWeight: focused ? '800' : '700', color, marginBottom: 6 }}>
                Gestación
              </Text>
            ),
          };
        }}
      />

      <Tab.Screen
        name="Tab4"
        component={CTIFeedScreen}
        options={{
          title: 'CTIFEED',
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 14, fontWeight: focused ? '800' : '700', color, marginBottom: 6 }}>
              CTIFEED
            </Text>
          ),
        }}
      />

      {isDebugMode && (
        <>
          <Tab.Screen
            name="Tab2"
            options={{ title: 'Gestación' }}
            component={GestationScreen}
          />
          <Tab.Screen
            name="Tab3"
            options={{ title: 'Maternidad' }}
            component={MaternityStackNavigator}
          />
        </>
      )}
    </Tab.Navigator>
  );
};
