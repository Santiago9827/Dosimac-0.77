/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
import { DonutChart } from '../../components/shared/DonutChart';

type Incidencia = {
  id: string | number;
  area: 'Maternidad' | 'Gestación';
  corral: string | number;
  descripcion: string;
};

const TAB_MATERNIDAD = 'MaternidadTab';
const TAB_GESTACION = 'GestacionTab';

const SURFACE_BG = '#F6F8FC';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E6EAF2';
const BRAND = '#4F46E5';

const BLOCK_BG_DARK = '#FFFFFF';
const ITEM_BG_SOFT = '#FEE2E2';
const ITEM_BORDER_SOFT = '#FECACA';
const PILL_BG_STRONG = '#FCA5A5';
const PILL_TEXT_STRONG = '#7F1D1D';
const RIPPLE_RED = 'rgba(127, 29, 29, 0.18)';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

export const HomeScreen = () => {
  const { t } = useTranslation(['common']);
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();
  const isMd = width >= 768;
  const isLg = width >= 1024;

  // Demo data
  const maternidad = { alimentados: 180, noAlimentados: 20 };
  const gestacion = { alimentados: 135, noAlimentados: 115 };
  const totalM = maternidad.alimentados + maternidad.noAlimentados;
  const totalG = gestacion.alimentados + gestacion.noAlimentados;
  const pctM = totalM ? Math.round((maternidad.alimentados / totalM) * 100) : 0;
  const pctG = totalG ? Math.round((gestacion.alimentados / totalG) * 100) : 0;

  const incidencias: Incidencia[] = [
    { id: 1, area: 'Maternidad', corral: '12', descripcion: 'Bebedero con caudal bajo.' },
    { id: 2, area: 'Gestación', corral: '03', descripcion: 'Comedero bloqueado.' },
    { id: 3, area: 'Gestación', corral: '07', descripcion: 'Sensor de paso intermitente.' },
    { id: 4, area: 'Maternidad', corral: '05', descripcion: 'Puerta sin cierre.' },
    { id: 5, area: 'Gestación', corral: '10', descripcion: 'Fallo de báscula.' },
    // añade más para probar el scroll
  ];

  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 }}>
      <Text style={{ color: '#334155' }}>{label}</Text>
      <Text style={{ color: '#0f172a', fontWeight: '600' }}>{value}</Text>
    </View>
  );

  const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon as any} size={18} color="#0f172a" />
        <Text
          style={{
            marginLeft: 8,
            color: '#0f172a',
            fontWeight: '800',
            fontSize: isLg ? 22 : isMd ? 20 : 18,
          }}
        >
          {text}
        </Text>
      </View>
      {typeof count === 'number' && (
        <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(226,232,240,0.7)' }}>
          <Text style={{ fontSize: 12, color: '#334155' }}>{count}</Text>
        </View>
      )}
    </View>
  );

  const renderIncidenciaCard = (item: Incidencia) => (
    <Pressable
      key={String(item.id)}
      onPress={() => { }}
      android_ripple={{ color: RIPPLE_RED }}
      style={{
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        backgroundColor: ITEM_BG_SOFT,
        borderColor: ITEM_BORDER_SOFT,
        ...SHADOW,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: '600',
            backgroundColor: PILL_BG_STRONG,
            color: PILL_TEXT_STRONG,
          }}
        >
          {item.area}
        </Text>
        <Text
          style={{
            marginLeft: 8,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: '#F1F5F9',
            color: '#475569',
            fontSize: 12,
          }}
        >
          Corral {item.corral}
        </Text>
      </View>
      <Text style={{ marginTop: 8, color: '#0f172a' }}>{item.descripcion}</Text>
    </Pressable>
  );

  const goMaternidad = () => navigation.getParent()?.navigate(TAB_MATERNIDAD as never);
  const goGestacion = () => navigation.getParent()?.navigate(TAB_GESTACION as never);

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE_BG }}>
      <HamburgerMenu />

      {/* 👉 Un único contenedor de scroll para toda la pantalla */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: isMd ? 24 : 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Indicadores */}
        <SectionTitle icon="analytics-outline" text={t('common:Indicadores') || 'Indicadores'} />

        {/* Fila responsive (1 col móvil / 2 cols md+) */}
        <View
          style={{
            flexDirection: isMd ? 'row' : 'column',
            gap: isMd ? 24 : 12,
            marginBottom: 24,
          }}
        >
          {/* Maternidad */}
          <Pressable
            onPress={goMaternidad}
            android_ripple={{ color: '#dbeafe' }}
            style={[isMd && { flex: 1 }, { borderRadius: 16, overflow: 'hidden' }]}
            accessibilityRole="button"
            accessibilityLabel="Ir a Maternidad"
          >
            <View style={[styles.card, SHADOW]}>
              <View style={{ alignItems: 'center' }}>
                <DonutChart
                  size={120}
                  strokeWidth={22}
                  label={t('common:Maternidad') || 'Maternidad'}
                  segmentA={maternidad.alimentados}
                  segmentB={maternidad.noAlimentados}
                  colorA="#22C55E"
                  colorB="#EF4444"
                  lineCap="butt"
                  gapDegrees={0}
                  centerPercent={pctM}
                />
              </View>
              <View style={{ marginTop: 12 }}>
                <StatRow label="Alimentados" value={maternidad.alimentados} />
                <StatRow label="No Alimentados" value={maternidad.noAlimentados} />
                <View style={{ height: 1, marginVertical: 8, backgroundColor: CARD_BORDER }} />
                <StatRow label="Totales" value={totalM} />
              </View>
            </View>
          </Pressable>

          {/* Gestación */}
          <Pressable
            onPress={goGestacion}
            android_ripple={{ color: '#dbeafe' }}
            style={[isMd && { flex: 1 }, { borderRadius: 16, overflow: 'hidden' }]}
            accessibilityRole="button"
            accessibilityLabel="Ir a Gestación"
          >
            <View style={[styles.card, SHADOW]}>
              <View style={{ alignItems: 'center' }}>
                <DonutChart
                  size={120}
                  strokeWidth={22}
                  label={t('common:Gestación') || 'Gestación'}
                  segmentA={gestacion.alimentados}
                  segmentB={gestacion.noAlimentados}
                  colorA="#22C55E"
                  colorB="#EF4444"
                  lineCap="butt"
                  gapDegrees={0}
                  centerPercent={pctG}
                />
              </View>
              <View style={{ marginTop: 12 }}>
                <StatRow label="Alimentados" value={gestacion.alimentados} />
                <StatRow label="No Alimentados" value={gestacion.noAlimentados} />
                <View style={{ height: 1, marginVertical: 8, backgroundColor: CARD_BORDER }} />
                <StatRow label="Totales" value={totalG} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Incidencias */}
        <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidencias.length} />

        {/* Bloque incidencias con tarjetas */}
        <View style={[styles.incidencias, SHADOW]}>
          {incidencias.map((it) => (
            <View key={String(it.id)} style={{ marginBottom: 8 }}>
              {renderIncidenciaCard(it)}
            </View>
          ))}
        </View>

        {/* CTA inferior */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('TareasProgramadas' as never)}
          style={{
            marginTop: 16,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: BRAND,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
            width: '100%',
            maxWidth: 1200,
            alignSelf: 'center',
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
            Tareas Programadas
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,                      // 👈 importante para ScrollView web
    width: '100%' as `${number}%`,
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 24,            // lo sobreescribimos dinámicamente
    paddingTop: 16,
  } satisfies ViewStyle,

  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderColor: CARD_BORDER,
  } satisfies ViewStyle,

  incidencias: {
    width: '100%' as `${number}%`,
    maxWidth: 900,
    alignSelf: 'center',
    borderRadius: 16,
    minHeight: 160,
    backgroundColor: BLOCK_BG_DARK,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 0,
  } satisfies ViewStyle,
});
