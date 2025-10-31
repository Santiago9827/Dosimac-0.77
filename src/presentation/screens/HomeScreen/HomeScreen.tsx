/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Pressable,
  ScrollView,
  useWindowDimensions,
  FlatList
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
import { DonutChart } from '../../components/shared/DonutChart';


// ===== Tipos / const =====
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

const ITEM_BG_SOFT = '#FEE2E2';
const ITEM_BORDER_SOFT = '#FECACA';
const PILL_BG_STRONG = '#FCA5A5';
const PILL_TEXT_STRONG = '#7F1D1D';
const RIPPLE_RED = 'rgba(127, 29, 29, 0.18)';

const SHADOW: ViewStyle = {
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

  const { width, height } = useWindowDimensions();
  const isMd = width >= 768;
  const isLg = width >= 1024;
  const pagePX = isLg ? 48 : isMd ? 24 : 16;
  const incHeight = !isMd
    ? Math.round(Math.max(260, Math.min(420, height * 0.38))) // alto del bloque en móvil
    : undefined;

  // —— Datos demo —— 
  const maternidad = { alimentados: 180, noAlimentados: 20 };
  const gestacion = { alimentados: 135, noAlimentados: 115 };
  const totalM = maternidad.alimentados + maternidad.noAlimentados;
  const totalG = gestacion.alimentados + gestacion.noAlimentados;
  const pctM = totalM ? Math.round((maternidad.alimentados / totalM) * 100) : 0;
  const pctG = totalG ? Math.round((gestacion.alimentados / totalG) * 100) : 0;

  const donutSize = isLg ? 150 : isMd ? 170 : 120;
  const donutStroke = isLg ? 26 : isMd ? 24 : 22;
  const statsWidth = isLg ? 240 : 210;
  const statsTopOffset = isLg ? 16 : isMd ? 12 : 10;
  const stackGap = isMd ? 32 : 16;

  const StatRowCompact = ({ label, value }: { label: string; value: number }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',   // mejor que 'baseline' para móvil
        marginTop: 8,
      }}
    >
      <Text
        style={{
          flex: 1,               // el label ocupa el espacio disponible
          paddingRight: 14,      // 👈 separación fija con el número
          fontSize: 13,
          color: '#64748B',
          lineHeight: 18,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"     // si no cabe, añade "..."
      >
        {label}
      </Text>

      <Text
        style={{
          minWidth: 36,          // 👈 reserva ancho para el número
          textAlign: 'right',    // pegado a la derecha de su cajita
          fontSize: 16,
          fontWeight: '700',
          color: '#0F172A',
          lineHeight: 20,
        }}
      >
        {value}
      </Text>
    </View>
  );

  const incidencias: Incidencia[] = [
    { id: 1, area: 'Maternidad', corral: '1', descripcion: 'Bebedero con caudal bajo.' },
    { id: 2, area: 'Gestación', corral: '2', descripcion: 'Comedero bloqueado.' },
    { id: 3, area: 'Gestación', corral: '3', descripcion: 'Sensor de paso intermitente.' },
    { id: 4, area: 'Maternidad', corral: '4', descripcion: 'Puerta sin cierrelllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll.' },
    { id: 5, area: 'Gestación', corral: '5', descripcion: 'Fallo de báscula.' },
    { id: 6, area: 'Maternidad', corral: '6', descripcion: 'Alarma de temperatura alta.' },
    { id: 7, area: 'Gestación', corral: '7', descripcion: 'Luz de emergencia encendida.' },
    { id: 8, area: 'Maternidad', corral: '8', descripcion: 'Fuga de agua detectada.' },
    { id: 9, area: 'Gestación', corral: '9', descripcion: 'Problema de ventilación.' },
    { id: 10, area: 'Maternidad', corral: '10', descripcion: 'Alarma de movimiento inusual.' },
    { id: 11, area: 'Gestación', corral: '11', descripcion: 'Fallo en el sistema de alimentación.' },
    { id: 12, area: 'Maternidad', corral: '12', descripcion: 'Sensor de humedad fuera de rango.' },
    { id: 13, area: 'Gestación', corral: '13', descripcion: 'Problema eléctrico detectadolllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll.' },

  ];

  // —— Helpers UI —— 
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
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: 'rgba(226,232,240,0.7)',
          }}
        >
          <Text style={{ fontSize: 12, color: '#334155' }}>{count}</Text>
        </View>
      )}
    </View>
  );

  const IndicadorCard = ({
    label,
    alimentados,
    noAlimentados,
    percent,
  }: {
    label: string;
    alimentados: number;
    noAlimentados: number;
    percent: number;
  }) => (
    <View
      style={{
        padding: isLg ? 20 : 16,
        borderWidth: 1,
        borderRadius: 16,
        backgroundColor: CARD_BG,
        borderColor: CARD_BORDER,
        ...SHADOW,
        minHeight: donutSize + (isLg ? 40 : 32),
      }}
    >
      <View
        style={{
          flexDirection: isMd ? 'row' : 'column',
          alignItems: isMd ? 'flex-start' : 'center',
          gap: stackGap,
        }}
      >
        {/* Donut a la izquierda */}
        <View
          style={{
            width: donutSize,
            height: donutSize,
            alignItems: 'center',
            justifyContent: 'center',
            // evita que el donut “baje” cuando el texto tenga más líneas
            flexShrink: 0,
          }}
        >
          <DonutChart
            size={donutSize}
            strokeWidth={donutStroke}
            label={label}
            segmentA={alimentados}
            segmentB={noAlimentados}
            colorA="#22C55E"
            colorB="#EF4444"
            lineCap="butt"
            gapDegrees={0}
            centerPercent={percent}
          />
        </View>

        <View style={[
          { flexGrow: 1 },
          isMd
            ? { width: statsWidth, paddingTop: statsTopOffset } // desktop/tablet
            : { marginTop: statsTopOffset },                    // móvil: separa del donut
        ]}
        >
          <StatRowCompact label="Alimentados" value={alimentados} />
          <StatRowCompact label="No Alimentados" value={noAlimentados} />
          <View style={{ height: 1, marginVertical: 10, backgroundColor: CARD_BORDER }} />
          <StatRowCompact label="Totales" value={alimentados + noAlimentados} />
        </View>

      </View>
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

  // —— Navegación —— 
  const goMaternidad = () => navigation.getParent()?.navigate(TAB_MATERNIDAD as never);
  const goGestacion = () => navigation.getParent()?.navigate(TAB_GESTACION as never);

  // Grid responsivo incidencias
  const gridCol = (isLg ? '32%' : isMd ? '48%' : '100%') as any;

  return (
    <View style={{ flex: 1, backgroundColor: SURFACE_BG }}>
      <HamburgerMenu />

      <ScrollView
        style={{ flex: 1 }}
        nestedScrollEnabled
        contentContainerStyle={{
          paddingHorizontal: pagePX,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ——— Indicadores ——— */}
        <SectionTitle icon="analytics-outline" text={t('common:Indicadores') || 'Indicadores'} />

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
            style={[{ borderRadius: 16, overflow: 'hidden' }, isMd && { flex: 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Ir a Maternidad"
          >
            <IndicadorCard
              label={t('common:Maternidad') || 'Maternidad'}
              alimentados={maternidad.alimentados}
              noAlimentados={maternidad.noAlimentados}
              percent={pctM}
            />
          </Pressable>

          {/* Gestación */}
          <Pressable
            onPress={goGestacion}
            android_ripple={{ color: '#dbeafe' }}
            style={[{ borderRadius: 16, overflow: 'hidden' }, isMd && { flex: 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Ir a Gestación"
          >
            <IndicadorCard
              label={t('common:Gestación') || 'Gestación'}
              alimentados={gestacion.alimentados}
              noAlimentados={gestacion.noAlimentados}
              percent={pctG}
            />
          </Pressable>
        </View>

        {/* ——— Incidencias ——— */}
        {/* ——— Incidencias ——— */}
        <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidencias.length} />

        {!isMd ? (
          // ===== MÓVIL: bloque con scroll propio =====
          <View
            style={{
              borderWidth: 1,
              borderRadius: 16,
              borderColor: CARD_BORDER,
              backgroundColor: CARD_BG,
              ...SHADOW,
              maxHeight: incHeight,         // 👈 limita altura y activa scroll interno
              marginBottom: 16,
            }}
          >
            <FlatList<Incidencia>
              data={incidencias}
              keyExtractor={(i) => String(i.id)}
              renderItem={({ item }) => renderIncidenciaCard(item)}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            />
          </View>
        ) : (
          // ===== TABLET/ESCRITORIO: grid como ya te gustaba =====
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: 8,
              columnGap: 8,
              marginBottom: 16,
            }}
          >
            {incidencias.map((it) => (
              <View key={String(it.id)} style={{ flexBasis: gridCol, maxWidth: gridCol }}>
                {renderIncidenciaCard(it)}
              </View>
            ))}
          </View>
        )}


        {/* CTA inferior */}
        {/* CTA inferior (misma lógica, ancho compacto en web) */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('TareasProgramadas' as never)}
          activeOpacity={0.85}
          style={[
            {
              marginTop: 8,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: isMd ? 10 : 12,
              backgroundColor: BRAND,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            },
            isMd
              ? {
                width: '100%',    // ocupa el ancho disponible…
                maxWidth: 580,    // …pero nunca más de 320px
                alignSelf: 'center',
              }
              : {
                alignSelf: 'stretch', // full-width en móvil
              },
          ]}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
            Tareas Programadas
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
