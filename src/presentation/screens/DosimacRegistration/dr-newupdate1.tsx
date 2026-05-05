// screens/DosimacRegistration/Drnewupdate.tsx
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, SafeAreaView, Platform } from 'react-native';
import { Appbar, Button, useTheme, Portal, Dialog } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { vgDoRegistration } from '../../../sharedTypes/gvarsDosimacRegistration';
import { farmStore } from '../../../stores/store';
import { globals } from '../../../sharedTypes/globlaVars';
import { useAuthStore } from '../../../stores/authStore';

export type RootStackParamList = {
   'DR-STARTSCAN': { operacion: number };
   // otras pantallas…
};

export default function Drnewupdate() {
   const { t } = useTranslation();
   const navigation = useNavigation<any>();
   const theme = useTheme();
   const [visible, setVisible] = React.useState(true);
   const token = useAuthStore((s) => s.token);

   const sfarm = farmStore((state) => state.farm);

   const inicializeVars = () => {
      vgDoRegistration.operationType = 0;
   };
   const goToHome = () => {
      const parent = navigation.getParent?.();

      if (token) {
         if (parent?.navigate) parent.navigate('AltaDispositivosHome');
         else navigation.navigate('AltaDispositivosHome');
      } else {
         if (parent?.navigate) parent.navigate('PublicHome');
         else navigation.navigate('PublicHome');
      }
   };

   const goNextScreen = (value: number) => {
      vgDoRegistration.operationType = value;
      navigation.navigate('DR-STARTSCAN', { operacion: value });
   };

   useEffect(() => {
      inicializeVars();
      setVisible(true);
   }, []);

   useFocusEffect(
      React.useCallback(() => {
         setVisible(true);
         return () => setVisible(false);
      }, [])
   );

   const dohideDialog = () => {
      setVisible(false);
      goToHome();
   };

   return (
      <SafeAreaView style={styles.safe}>
         <Appbar.Header elevated>
            {/* <Appbar.BackAction onPress={navigation.goBack} /> */}
            <Appbar.BackAction onPress={goToHome} />
            <Appbar.Content title={t('common:DosimacRegistration')} />
         </Appbar.Header>

         <View style={styles.screen}>
            {sfarm ? (
               <View style={styles.list}>
                  <Pressable
                     onPress={() => {
                        globals.dispenserType = 1;
                        goNextScreen(1);
                     }}
                     style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  >
                     <Text style={styles.ctaTitle}>{t('common:DosimacI')}</Text>
                     <Text style={styles.ctaSubtitle}>{t('common:NewDmMaternity')}</Text>
                  </Pressable>

                  <Pressable
                     onPress={() => {
                        globals.dispenserType = 3;
                        goNextScreen(3);
                     }}
                     style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
                  >
                     <Text style={styles.ctaTitle}>{t('common:DosimacG')}</Text>
                     <Text style={styles.ctaSubtitle}>{t('common:NewDmGestation')}</Text>
                  </Pressable>
               </View>
            ) : (
               <Portal>
                  <Dialog visible={visible} onDismiss={dohideDialog}>
                     <Dialog.Icon icon="warning" color="red" size={60} />
                     <Dialog.Title style={{ color: 'red' }}>{t('common:Aviso')}</Dialog.Title>
                     <Dialog.Content>
                        <Text style={{ color: theme.colors.onSurface }}>
                           {t('common:configuarIntalacion')}
                        </Text>
                     </Dialog.Content>
                     <Dialog.Actions>
                        <Button onPress={dohideDialog}>{t('common:Aceptar')}</Button>
                     </Dialog.Actions>
                  </Dialog>
               </Portal>
            )}
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   safe: { flex: 1, backgroundColor: '#ECEFF1' }, // gris suave de fondo (web y nativo)
   screen: {
      flex: 1,
      backgroundColor: '#ECEFF1',
      paddingHorizontal: 16,
      paddingTop: 24,
   },
   list: {
      alignItems: 'center',
      gap: 28,
      marginTop: 16,
   },
   cta: {
      width: '86%',
      maxWidth: 680,
      backgroundColor: '#0F766E', // teal-700
      borderRadius: 24,
      paddingVertical: 22,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      // sombra consistente web/nativo
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
   },
   ctaPressed: {
      opacity: Platform.select({ web: 0.92, default: 0.9 }),
      transform: [{ scale: 0.98 }],
   },
   ctaTitle: {
      fontSize: 32, // ~text-3xl
      fontWeight: '800',
      color: '#FEF3C7', // yellow-100
      textAlign: 'center',
   },
   ctaSubtitle: {
      marginTop: 6,
      fontSize: 18,
      fontWeight: '700',
      color: '#E2E8F0', // slate-200
      textAlign: 'center',
   },
});
