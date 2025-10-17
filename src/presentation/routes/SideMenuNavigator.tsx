/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React from 'react';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { globalColors } from '../theme/theme';
import { Text, View } from 'react-native';
import { BottomTabNavigator } from './BottomTabNavigator';
import { IonIcon } from '../components/shared/IonIcon';
import { Divider } from 'react-native-paper';
import { LoginScreen } from '../screens/login/login';
import { LanguageSettingsScreen } from '../screens/settings/Languagesettings';
import { useTranslation } from 'react-i18next';
import { FarmListNavigator } from './FarmListNavigator';
import { DebugNavigator } from './DebugNavigator';
import { MaintenaceStackNavigator } from './MaintenaceStackNavigator';
import { DRStackNavigator } from './dr_StackNavigator';
import { isDebugMode } from '../../sharedTypes/globlaVars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { MaintenancePasswordScreen } from './MaintenancePasswordScreen';
import { AWRStackNavigator } from './AWRStackNavigator';

import TareasProgramadasScreen from './TareasProgramadasScreen';
import NoAlimentadosScreenMaternidad from './NoAlimentadosScreenMaternidad';

import { createStackNavigator } from '@react-navigation/stack';
import { AnimalSearchNavigator } from './AnimalSearchNavigator';


// 👇 Ajusta la ruta según tu proyecto

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();


/** Stack que contiene los Tabs + TareasProgramadas */
function TabsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TareasProgramadas"
        component={TareasProgramadasScreen}
        options={{ title: 'Tareas Programadas' }}
      />
      {/* <Stack.Screen
        name="NoAlimentadosMaternidad"
        component={NoAlimentadosScreenMaternidad}
        options={{ title: 'Animales no Alimentados' }}
      /> */}

    </Stack.Navigator>
  );
}

export const SideMenuNavigator = () => {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerActiveBackgroundColor: globalColors.primary,
        drawerActiveTintColor: 'white',
        drawerInactiveTintColor: globalColors.primary,
        drawerLabelStyle: { flexShrink: 1 },
        drawerStyle: { marginTop: 30 },
        drawerItemStyle: { borderRadius: 100, paddingHorizontal: 20 }
      }}
    >
      {/* 👉 Ahora los Tabs van envueltos en TabsStack (que incluye TareasProgramadas) */}
      <Drawer.Screen
        name="Tabs"
        component={TabsStack}
        options={{ drawerIcon: ({ color }) => <IonIcon name="home-outline" color={color} />, title: t('common:Tabs') }}
      />

      <Drawer.Screen
        name="Register"
        component={DRStackNavigator}
        options={{ drawerIcon: ({ color }) => <IonIcon name="add-outline" color={color} />, title: t('common:DosimacRegistration') }}
      />
      <Drawer.Screen
        name="FarmList"
        component={FarmListNavigator}
        options={{ drawerIcon: ({ color }) => <IonIcon name="document-text-outline" color={color} />, title: t('common:Lista_instalaciones') }}
      />

      {/* Ajustes (oculto en el Drawer) */}
      <Drawer.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          title: t('common:settings'),
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
        }}
      />

      {/* Ruta real de Mantenimiento (oculta) */}
      <Drawer.Screen
        name="Maintenance"
        component={MaintenaceStackNavigator}
        options={{
          title: t('common:Maintenance'),
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
        }}
      />

      {/* Entrada visible que pide contraseña */}
      <Drawer.Screen
        name="MaintenanceAccess"
        component={MaintenancePasswordScreen}
        options={{
          title: t('common:Maintenance'),
          drawerIcon: ({ color }) => <IonIcon name="build-outline" color={color} />
        }}
      />

      <Drawer.Screen
        name="AWR-SAVED"
        component={AWRStackNavigator}
        options={{
          drawerIcon: ({ color }) => <IonIcon name="radio-outline" color={color} />,
          title: 'AWR escaneados',
        }}
      />

      <Drawer.Screen
        name="AnimalSearch"
        component={AnimalSearchNavigator}
        options={{
          drawerIcon: ({ color }) => <IonIcon name="search-outline" color={color} />,
          title: 'Buscar animal',
        }}
      />



      {isDebugMode && (
        <>
          <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="log-in-outline" color={color} />) }} name="Login" component={LoginScreen} />
          <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="chatbubbles-outline" color={color} />) }} name="Language Settings" component={LanguageSettingsScreen} />
          <Drawer.Screen options={{ drawerItemStyle: { marginTop: 40, paddingHorizontal: 20, }, drawerLabel: "Debug options", drawerIcon: ({ color }) => (<IonIcon name="bug-outline" color={color} />) }} name="Debug" component={DebugNavigator} />
        </>
      )}
    </Drawer.Navigator>
  );
};

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const focused = props.state.routeNames[props.state.index] === 'Settings';
  const activeBg = globalColors.primary;
  const activeTint = 'white';
  const inactiveTint = globalColors.primary;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 12 }}
    >
      <DrawerItemList {...props} />

      <View style={{ marginTop: 'auto' }}>
        <Text
          style={{
            marginLeft: 16,
            marginBottom: 6,
            fontSize: 12,
            fontWeight: '600',
            color: '#666',
          }}
        >
          {t('common:softwareVersion', { defaultValue: 'softwareVersion' })} 3
        </Text>

        <Divider style={{ marginHorizontal: 16, marginBottom: 4 }} />

        <DrawerItem
          label={t('common:settings', { defaultValue: 'Ajustes' })}
          icon={() => (
            <IonIcon
              name="settings-outline"
              color={focused ? activeTint : inactiveTint}
            />
          )}
          labelStyle={{ color: focused ? activeTint : inactiveTint }}
          style={[
            { marginHorizontal: 8, borderRadius: 100, paddingHorizontal: 20 },
            focused && { backgroundColor: activeBg },
          ]}
          onPress={() => {
            const nav = props.navigation;
            nav.closeDrawer();
            setTimeout(() => nav.navigate('Settings' as never), 120);
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
};
