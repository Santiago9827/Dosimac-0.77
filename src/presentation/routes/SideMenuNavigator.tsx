/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
import React from 'react';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import { globalColors } from '../theme/theme';
import { Text, View, useWindowDimensions } from 'react-native';
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

const Drawer = createDrawerNavigator();

export const SideMenuNavigator = () => {
  const dimensions = useWindowDimensions();
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
      <Drawer.Screen
        name="Tabs"
        component={BottomTabNavigator}
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

      {/* RUTA REAL DE MANTENIMIENTO (oculta). Aquí está tu stack real */}
      <Drawer.Screen
        name="Maintenance"
        component={MaintenaceStackNavigator}
        options={{
          title: t('common:Maintenance'),
          drawerItemStyle: { height: 0 },
          drawerLabel: () => null,
        }}
      />

      {/* RUTA VISIBLE EN EL DRAWER -> PANTALLA DE CONTRASEÑA */}
      <Drawer.Screen
        name="MaintenanceAccess"
        component={MaintenancePasswordScreen}
        options={{
          title: t('common:Maintenance'),
          drawerIcon: ({ color }) => <IonIcon name="build-outline" color={color} />
        }}
      />

      {isDebugMode && (
        <>
          <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="log-in-outline" color={color} />) }} name="Login" component={LoginScreen} />
          <Drawer.Screen options={{ drawerIcon: ({ color }) => (<IonIcon name="chatbubbles-outline" color={color} />) }} name="Language Settings" component={LanguageSettingsScreen} />
          <Drawer.Screen options={{ drawerItemStyle: { marginTop: 40, paddingHorizontal: 20, }, drawerLabel: "Debug options", drawerIcon: ({ color }) => (<IonIcon name="bug-outline" color={color} />) }} name="Debug" component={DebugNavigator} />
          {/* Si antes mostrabas Maintenance aquí en debug, ya no hace falta porque ahora lo abrimos pasando por contraseña */}
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


// const CustomDrawerContent = (props: DrawerContentComponentProps) => {
//    // const navigation=useNavigation();
//    return (

//       <DrawerContentScrollView style={{ flex: 1, flexDirection: 'column' }} {...props}>
//          {/* <View style={{
//             height:200,
//             backgroundColor:globalColors.primary,
//             margin:30,
//             borderRadius:50,

//          }}
//          /> */}
//          {/* <DrawerItemList {...props} /> */}
//          <View style={{ flex: 1 }}>

//             <DrawerItemList {...props} />

//          </View>

//          {/* <Text>HOla</Text> */}

//          {isDebugMode && (
//             <View style={{ flex: 1, backgroundColor: 'white', marginTop: 300 }}>
//                <Divider />

//                <DrawerItem
//                   // style={{flexDirection:'column-reverse'}}
//                   label="CTIcontrol"
//                   onPress={() => Linking.openURL('https://www.cticontrol.com')}
//                //   onPress={() => navigation.navigate('Home Debug' as never)}

//                />
//                {/* <Button 
//                title="Go somewhere" 
//                   onPress={() => {
//                   // Navigate using the `navigation` prop that you received
//                   props.navigation.navigate('BLE Testing');
//                   // props.navigation.navigate('Tag Reader');
                  
//                   //HomeDebugScreen()

                  
//                }}
//             />
//              */}
//             </View>
//          )}

//       </DrawerContentScrollView>
//    )

// }