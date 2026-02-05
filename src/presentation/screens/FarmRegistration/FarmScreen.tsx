// /* eslint-disable prettier/prettier */

// import { useFocusEffect } from '@react-navigation/native';
// import React, { useRef, useState } from 'react';
// import {
//   View,
//   Alert,
//   ScrollView,
//   Pressable,
//   Text,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   useWindowDimensions,
//   StyleProp,
//   ViewStyle
// } from 'react-native';
// import { Appbar, Portal, Dialog, Button, TextInput } from 'react-native-paper';
// import { useTranslation } from 'react-i18next';
// import { GetFarmDataById, InicialiceFarmDataTable, InsertFarmData, UpdateFarmData, deleteFarmById } from '../../../FarmDB/farmsDB';
// import { farmFacility } from '../../../sharedTypes/farmInterface';
// import { vglobal } from '../../../sharedTypes/globlaVars';
// import { farmStore } from '../../../stores/store';
// // import { useTogglePasswordVisibility } from '../../hooks/useTogglePasswordVisibility';

// import Icon from '@expo/vector-icons/Ionicons';

// import { IonIcon } from '../../components/shared/IonIcon';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';


// export const FarmScreen = ({ navigation, route }) => {
//   const [name, setName] = useState('');
//   const [location, setLocation] = useState('');
//   const [province, setProvince] = useState('');
//   const [ssid, setSsid] = useState('');
//   const [wifiPassword, setWifiPassword] = useState('');
//   const [userName, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [serverIp, setServerIp] = useState('');
//   const [confirmOpen, setConfirmOpen] = useState(false);
//   const insets = useSafeAreaInsets();


//   const { width } = useWindowDimensions();
//   const isWeb = Platform.OS === 'web';
//   const [infoOpen, setInfoOpen] = useState(false);
//   const dialogStyle: StyleProp<ViewStyle> = isWeb
//     ? {
//       width: Math.min(560, width - 48),
//       marginHorizontal: 24,
//       alignSelf: 'center' as const,
//     }
//     : undefined;



//   const sfarm = farmStore((state) => state.farm);
//   const sfarmId = farmStore((state) => state.farmId);
//   const UseSetFarm = farmStore((state) => state.UseSetFarm);
//   const UseSetFarmId = farmStore((state) => state.UseSetFarmId);
//   const UseSetNewFarm = farmStore((state) => state.UseSetNewFarm);
//   const UsesetFarmDataChange = farmStore((state) => state.UsesetFarmDataChange);
//   const setFirstElment = farmStore((state) => state.setFirstElement);
//   const UseSetFirstElement = farmStore((state) => state.UseSetFirstElement);
//   const UseSetFarmsAmount = farmStore((state) => state.UseSetFarmsAmount);
//   const UseresetFarm = farmStore((state) => state.resetFarm);

//   const [flatTextSecureEntry, setFlatTextSecurityEntry] = useState(true);
//   const [UserSecureEntry, setUserSecurityEntry] = useState(true);

//   let farmData2: farmFacility;

//   const { t } = useTranslation();

//   const fetchFarmData = async (id: number) => {
//     const farmData: farmFacility = await GetFarmDataById(id);
//     setfarmdata(farmData);
//   };

//   const setfarmdata = (farmData: farmFacility) => {
//     setName(farmData.name);
//     setLocation(farmData.location);
//     setProvince(farmData.province);
//     setSsid(farmData.ssid);
//     setWifiPassword(farmData.wifiPassword);
//     setUsername(farmData.userName);
//     setPassword(farmData.password);
//     setServerIp(farmData.serverIp);
//   };

//   const fillFarmData2 = () => {
//     farmData2 = {
//       name: name,
//       location: location,
//       province: province,
//       userName: userName,
//       password: password,
//       ssid: ssid,
//       wifiPassword: wifiPassword,
//       serverIp: serverIp,
//       id: route.params.id,
//     };
//   };

//   const Inicilizefarmdata = () => {
//     setName('');
//     setLocation('');
//     setProvince('');
//     setSsid('');
//     setWifiPassword('');
//     setUsername('');
//     setPassword('');
//     setServerIp('');
//   };

//   useFocusEffect(
//     React.useCallback(() => {
//       console.log(route.params.id, route.params);
//       if (route.params.isNewFarm) Inicilizefarmdata();
//       else fetchFarmData(route.params.id);
//       return () => { };
//     }, [])
//   );

//   const submitData = async () => {
//     try {
//       const farm: farmFacility = {
//         id: route.params.id, name, location, province,
//         ssid, wifiPassword, userName, password, serverIp,
//       };

//       await InicialiceFarmDataTable();

//       if (route.params.isNewFarm) {
//         const newId = await InsertFarmData(farm);
//         console.log('inserted id', newId);
//       } else {
//         await UpdateFarmData(farm);
//       }

//       UsesetFarmDataChange();
//       navigation.goBack();
//     } catch (e) {
//       console.log('submit ERR', e);
//       Alert.alert('Error', 'No se pudo guardar la instalación');
//     }
//   };


//   const deleteFarm = async () => {
//     vglobal.coinciden = false;

//     if (route.params.isNewFarm) {
//       if (Platform.OS === 'web') {
//         setInfoOpen(true);
//       } else {
//         Alert.alert(t('BorrarGranja'), t('common:NoSePuedeBorrarGranja'));
//       }
//       return;
//     }

//     await deleteFarmById(route.params.id);
//     if (route.params.id === route.params.SetectedValue) {
//       UseresetFarm();
//     }
//     navigation.goBack(); // o navigation.replace('FarmListScreen')
//   };


//   // ====== SCROLL & KEYBOARD ======
//   const scrollRef = useRef<ScrollView>(null);

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* Appbar FUERA del ScrollView para que el área scrollable tenga altura estable */}
//       <Appbar.Header elevated>
//         <Appbar.BackAction onPress={navigation.goBack} />
//         <Appbar.Content title={t('common:DetallesInstalacion')} />

//         <Appbar.Action
//           // opcional: para evitar "?" en web, usa Ionicons
//           // icon={({ size, color }) => <Ionicons name="trash-outline" size={size} color={color} />}
//           icon={({ size, color }) => (
//             <Ionicons name="trash-outline" size={size} color={color} />
//           )} onPress={() => {
//             if (Platform.OS === 'web') {
//               setConfirmOpen(true);
//             } else {
//               Alert.alert(
//                 t('BorrarGranja'),
//                 t('Deseaborrarlagranja'),
//                 [
//                   { text: t('Cancelar'), style: 'cancel' },
//                   { text: 'OK', style: 'destructive', onPress: () => deleteFarm() },
//                 ],
//                 { cancelable: true }
//               );
//             }
//           }}
//         />
//       </Appbar.Header>
//       {/* Dialog de confirmación para web */}
//       <Portal>
//         <Dialog
//           visible={confirmOpen}
//           onDismiss={() => setConfirmOpen(false)}
//           style={dialogStyle}
//         >
//           <Dialog.Title>{t('BorrarGranja')}</Dialog.Title>
//           <Dialog.Content>
//             <Text>{t('Deseaborrarlagranja')}</Text>
//           </Dialog.Content>
//           <Dialog.Actions>
//             <Button onPress={() => setConfirmOpen(false)}>{t('Cancelar')}</Button>
//             <Button onPress={() => { setConfirmOpen(false); deleteFarm(); }}>OK</Button>
//           </Dialog.Actions>
//         </Dialog>
//       </Portal>

//       {/* Dialog de info "no se puede borrar" para web */}
//       <Portal>
//         <Dialog visible={infoOpen} onDismiss={() => setInfoOpen(false)} style={dialogStyle}>
//           <Dialog.Title>{t('BorrarGranja')}</Dialog.Title>
//           <Dialog.Content>
//             <Text>{t('common:NoSePuedeBorrarGranja')}</Text>
//           </Dialog.Content>
//           <Dialog.Actions>
//             <Button onPress={() => setInfoOpen(false)}>{t('Cancelar')}</Button>
//           </Dialog.Actions>
//         </Dialog>
//       </Portal>




//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.select({ ios: 'padding', android: 'height' })}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
//       >
//         <ScrollView
//           ref={scrollRef}
//           style={{ flex: 1 }}
//           keyboardShouldPersistTaps="handled"
//           keyboardDismissMode="on-drag"
//           nestedScrollEnabled
//           overScrollMode="always"
//           showsVerticalScrollIndicator
//           contentInsetAdjustmentBehavior="always"
//           contentContainerStyle={{ flexGrow: 1, paddingBottom: 260 }}
//         >
//           <View style={{ marginTop: 20, gap: 10, marginHorizontal: 10, paddingHorizontal: 10 }}>
//             <TextInput label={t("NombreGranja")} mode="outlined" placeholder="Nombre de la granja" value={name} onChangeText={setName} />
//             <TextInput label={t("Localidad")} mode="outlined" placeholder="Poblacion" value={location} onChangeText={setLocation} />
//             <TextInput label={t("Provincia")} mode="outlined" placeholder="Provincia" value={province} onChangeText={setProvince} />
//             <TextInput label={t("NombreWifi")} mode="outlined" placeholder="Nombre red WIFI" value={ssid} onChangeText={setSsid} />
//             <TextInput label={t("PasswordWifi")} mode="outlined" placeholder="Wifi Password" value={wifiPassword} onChangeText={setWifiPassword}

//               secureTextEntry={flatTextSecureEntry}
//               right={
//                 <TextInput.Icon
//                   icon={() => <IonIcon name={flatTextSecureEntry ? 'eye-outline' : 'eye-off-outline'} size={24} color="black" />}

//                   onPress={() => setFlatTextSecurityEntry(!flatTextSecureEntry)}
//                   forceTextInputFocus={false}
//                 />
//               }
//             />

//             <TextInput label={t("username")} mode="outlined" placeholder="Nombre usuario" value={userName} onChangeText={setUsername} />
//             <TextInput
//               label={t("password")}
//               mode="outlined"
//               placeholder="Password usuario"
//               value={password}
//               onChangeText={setPassword}
//               secureTextEntry={UserSecureEntry}
//               right={
//                 <TextInput.Icon
//                   icon={() => (
//                     <IonIcon
//                       name={UserSecureEntry ? 'eye-outline' : 'eye-off-outline'}
//                       size={24}
//                       color="black"
//                     />
//                   )}
//                   onPress={() => setUserSecurityEntry(!UserSecureEntry)}
//                   forceTextInputFocus={false}
//                 />
//               }
//             />

//             <TextInput
//               keyboardType="number-pad"
//               label={t("Server")}
//               mode="outlined"
//               placeholder="IP Servidor"
//               value={serverIp}
//               onChangeText={setServerIp}
//               onFocus={() => {
//                 // Garantiza que al enfocar el último campo, el scroll se mueva
//                 requestAnimationFrame(() => {
//                   scrollRef.current?.scrollToEnd({ animated: true });
//                 });
//               }}
//             />

//             <Pressable
//               android_ripple={{ color: 'blue' }}
//               style={styles.boton}
//               onPress={() => {
//                 submitData();
//                 // navigation.goBack();
//                 navigation.replace("Farm list");

//               }}
//             >
//               <Text style={styles.texto}>{t('common:Guardar')}</Text>
//             </Pressable>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     // flex: 1,
//     // backgroundColor: 'white',
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   boton: {
//     backgroundColor: 'green',
//     borderRadius: 10,
//     padding: 10,
//     marginBottom: 10,
//     marginTop: 10,
//     width: '100%',
//     alignItems: 'center',
//   },
//   texto: {
//     fontSize: 20,
//     color: 'white',
//   },
// });


//!Prueba para no CRASHEE EN ANDRID 11

import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  View,
  Alert,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useWindowDimensions,
  StyleProp,
  ViewStyle
} from 'react-native';
import { Appbar, Portal, Dialog, Button, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { GetFarmDataById, InicialiceFarmDataTable, InsertFarmData, UpdateFarmData, deleteFarmById } from '../../../FarmDB/farmsDB';
import { farmFacility } from '../../../sharedTypes/farmInterface';
import { vglobal } from '../../../sharedTypes/globlaVars';
import { farmStore } from '../../../stores/store';

import Icon from '@expo/vector-icons/Ionicons';

import { IonIcon } from '../../components/shared/IonIcon';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export const FarmScreen = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [province, setProvince] = useState('');
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const [infoOpen, setInfoOpen] = useState(false);
  const dialogStyle: StyleProp<ViewStyle> = isWeb
    ? {
      width: Math.min(560, width - 48),
      marginHorizontal: 24,
      alignSelf: 'center' as const,
    }
    : undefined;

  const sfarm = farmStore((state) => state.farm);
  const sfarmId = farmStore((state) => state.farmId);
  const UseSetFarm = farmStore((state) => state.UseSetFarm);
  const UseSetFarmId = farmStore((state) => state.UseSetFarmId);
  const UseSetNewFarm = farmStore((state) => state.UseSetNewFarm);
  const UsesetFarmDataChange = farmStore((state) => state.UsesetFarmDataChange);
  const setFirstElment = farmStore((state) => state.setFirstElement);
  const UseSetFirstElement = farmStore((state) => state.UseSetFirstElement);
  const UseSetFarmsAmount = farmStore((state) => state.UseSetFarmsAmount);
  const UseresetFarm = farmStore((state) => state.resetFarm);

  const [flatTextSecureEntry, setFlatTextSecurityEntry] = useState(true);
  const [UserSecureEntry, setUserSecurityEntry] = useState(true);

  let farmData2: farmFacility;

  const { t } = useTranslation();

  // ✅ NUEVO: detecta si el usuario ya tocó algún input (evita “pisar” mientras escribe)
  const userEditingRef = useRef(false);

  // ✅ NUEVO: helper para marcar interacción
  const markEditing = () => { userEditingRef.current = true; };

  const fetchFarmData = async (id: number) => {
    const farmData: farmFacility = await GetFarmDataById(id);

    // ✅ CLAVE: si el usuario ya está escribiendo, NO sobreescribas los values
    if (!userEditingRef.current) {
      setfarmdata(farmData);
    }
  };

  const setfarmdata = (farmData: farmFacility) => {
    // ✅ (opcional pero recomendable): evita undefined
    setName(farmData.name ?? '');
    setLocation(farmData.location ?? '');
    setProvince(farmData.province ?? '');
    setSsid(farmData.ssid ?? '');
    setWifiPassword(farmData.wifiPassword ?? '');
    setUsername(farmData.userName ?? '');
    setPassword(farmData.password ?? '');
    setServerIp(farmData.serverIp ?? '');
  };

  const fillFarmData2 = () => {
    farmData2 = {
      name: name,
      location: location,
      province: province,
      userName: userName,
      password: password,
      ssid: ssid,
      wifiPassword: wifiPassword,
      serverIp: serverIp,
      id: route.params.id,
    };
  };

  const Inicilizefarmdata = () => {
    setName('');
    setLocation('');
    setProvince('');
    setSsid('');
    setWifiPassword('');
    setUsername('');
    setPassword('');
    setServerIp('');
  };

  useFocusEffect(
    React.useCallback(() => {
      console.log(route.params.id, route.params);

      // ✅ RESETEA “editing” cada vez que entras a la pantalla
      userEditingRef.current = false;

      if (route.params.isNewFarm) Inicilizefarmdata();
      else fetchFarmData(route.params.id);

      return () => { };
    }, [])
  );

  const submitData = async () => {
    try {
      const farm: farmFacility = {
        id: route.params.id, name, location, province,
        ssid, wifiPassword, userName, password, serverIp,
      };

      await InicialiceFarmDataTable();

      if (route.params.isNewFarm) {
        const newId = await InsertFarmData(farm);
        console.log('inserted id', newId);
      } else {
        await UpdateFarmData(farm);
      }

      UsesetFarmDataChange();
      navigation.goBack();
    } catch (e) {
      console.log('submit ERR', e);
      Alert.alert('Error', 'No se pudo guardar la instalación');
    }
  };

  const deleteFarm = async () => {
    vglobal.coinciden = false;

    if (route.params.isNewFarm) {
      if (Platform.OS === 'web') {
        setInfoOpen(true);
      } else {
        Alert.alert(t('BorrarGranja'), t('common:NoSePuedeBorrarGranja'));
      }
      return;
    }

    await deleteFarmById(route.params.id);
    if (route.params.id === route.params.SetectedValue) {
      UseresetFarm();
    }
    navigation.goBack();
  };

  const scrollRef = useRef<ScrollView>(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={navigation.goBack} />
        <Appbar.Content title={t('common:DetallesInstalacion')} />

        <Appbar.Action
          icon={({ size, color }) => (
            <Ionicons name="trash-outline" size={size} color={color} />
          )} onPress={() => {
            if (Platform.OS === 'web') {
              setConfirmOpen(true);
            } else {
              Alert.alert(
                t('BorrarGranja'),
                t('Deseaborrarlagranja'),
                [
                  { text: t('Cancelar'), style: 'cancel' },
                  { text: 'OK', style: 'destructive', onPress: () => deleteFarm() },
                ],
                { cancelable: true }
              );
            }
          }}
        />
      </Appbar.Header>

      <Portal>
        <Dialog
          visible={confirmOpen}
          onDismiss={() => setConfirmOpen(false)}
          style={dialogStyle}
        >
          <Dialog.Title>{t('BorrarGranja')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('Deseaborrarlagranja')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmOpen(false)}>{t('Cancelar')}</Button>
            <Button onPress={() => { setConfirmOpen(false); deleteFarm(); }}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog visible={infoOpen} onDismiss={() => setInfoOpen(false)} style={dialogStyle}>
          <Dialog.Title>{t('BorrarGranja')}</Dialog.Title>
          <Dialog.Content>
            <Text>{t('common:NoSePuedeBorrarGranja')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setInfoOpen(false)}>{t('Cancelar')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          overScrollMode="always"
          showsVerticalScrollIndicator
          contentInsetAdjustmentBehavior="always"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 260 }}
        >
          <View style={{ marginTop: 20, gap: 10, marginHorizontal: 10, paddingHorizontal: 10 }}>
            <TextInput
              label={t("NombreGranja")}
              mode="outlined"
              placeholder="Nombre de la granja"
              value={name}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setName(v); }} // ✅
            />

            <TextInput
              label={t("Localidad")}
              mode="outlined"
              placeholder="Poblacion"
              value={location}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setLocation(v); }} // ✅
            />

            <TextInput
              label={t("Provincia")}
              mode="outlined"
              placeholder="Provincia"
              value={province}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setProvince(v); }} // ✅
            />

            <TextInput
              label={t("NombreWifi")}
              mode="outlined"
              placeholder="Nombre red WIFI"
              value={ssid}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setSsid(v); }} // ✅
            />

            <TextInput
              label={t("PasswordWifi")}
              mode="outlined"
              placeholder="Wifi Password"
              value={wifiPassword}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setWifiPassword(v); }} // ✅
              secureTextEntry={flatTextSecureEntry}
              right={
                <TextInput.Icon
                  icon={() => <IonIcon name={flatTextSecureEntry ? 'eye-outline' : 'eye-off-outline'} size={24} color="black" />}
                  onPress={() => setFlatTextSecurityEntry(!flatTextSecureEntry)}
                  forceTextInputFocus={false}
                />
              }
            />

            <TextInput
              label={t("username")}
              mode="outlined"
              placeholder="Nombre usuario"
              value={userName}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setUsername(v); }} // ✅
            />

            <TextInput
              label={t("password")}
              mode="outlined"
              placeholder="Password usuario"
              value={password}
              onFocus={markEditing}           // ✅
              onChangeText={(v) => { markEditing(); setPassword(v); }} // ✅
              secureTextEntry={UserSecureEntry}
              right={
                <TextInput.Icon
                  icon={() => (
                    <IonIcon
                      name={UserSecureEntry ? 'eye-outline' : 'eye-off-outline'}
                      size={24}
                      color="black"
                    />
                  )}
                  onPress={() => setUserSecurityEntry(!UserSecureEntry)}
                  forceTextInputFocus={false}
                />
              }
            />

            <TextInput
              keyboardType="number-pad"
              label={t("Server")}
              mode="outlined"
              placeholder="IP Servidor"
              value={serverIp}
              onFocus={() => {
                markEditing(); // ✅
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                });
              }}
              onChangeText={(v) => { markEditing(); setServerIp(v); }} // ✅
            />

            <Pressable
              android_ripple={{ color: 'blue' }}
              style={styles.boton}
              onPress={() => {
                submitData();
                navigation.replace("Farm list");
              }}
            >
              <Text style={styles.texto}>{t('common:Guardar')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boton: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  texto: {
    fontSize: 20,
    color: 'white',
  },
});
