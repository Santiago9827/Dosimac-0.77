// DRstartscanningScreen.tsx
import React from 'react';
import { View, Pressable, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { Appbar, Card, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export const DRstartscanningScreen = ({ navigation, route }: any) => {
   const { t } = useTranslation();
   const { width } = useWindowDimensions();
   const isWeb = Platform.OS === 'web';

   // helpers
   const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

   // Tamaño del botón:
   // - móvil: más pequeño (140–200)
   // - web: algo grande pero controlado (220–340) y centrado
   const btnSize = isWeb
      ? clamp(width * 0.25, 220, 340)
      : clamp(width * 0.45, 140, 200);

   const fontSize = Math.round(btnSize * 0.16);

   // Ancho de la tarjeta en web, centrada; en móvil usa 90% del ancho
   const cardWidth = isWeb ? clamp(width * 0.6, 360, 640) : '90%';

   return (
      <View style={styles.page}>
         <Appbar.Header elevated>
            <Appbar.BackAction onPress={navigation.goBack} />
            <Appbar.Content title={t('common:StartScan')} />
         </Appbar.Header>

         <View style={styles.body}>
            {/* Tarjeta de instrucciones centrada */}
            <Card mode="contained" style={[styles.card, { width: cardWidth }]}>
               <Card.Content>
                  <Text variant="titleMedium" style={styles.cardText}>
                     {t('common:TestoPresioneAlta')}
                  </Text>
               </Card.Content>
            </Card>

            {/* Botón redondo */}
            <Pressable
               onPress={() =>
                  navigation.navigate('DR-SCANRESULTS', { operacion: route?.params?.operacion })
               }
               style={[
                  styles.circle,
                  {
                     width: btnSize,
                     height: btnSize,
                     borderRadius: btnSize / 2,
                  },
               ]}
            >
               <Text style={[styles.circleText, { fontSize }]}>{t('common:PressToScan')}</Text>
            </Pressable>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   page: {
      flex: 1,
      backgroundColor: '#F3F5F8',
   },
   body: {
      flex: 1,
      alignItems: 'center',      // centra hijos horizontalmente (web y móvil)
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 28,
   },
   card: {
      alignSelf: 'center',        // asegura centrado en web
      borderRadius: 14,
      backgroundColor: '#F2ECFB',
      borderWidth: 1,
      borderColor: '#E6DDF7',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
   },
   cardText: {
      textAlign: 'center',
      fontWeight: '600',
   },
   circle: {
      backgroundColor: '#0F746F',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
   },
   circleText: {
      color: '#FFF7D6',
      fontWeight: '800',
   },
});
