// screens/Gestation/GestationScreen.tsx
import React from 'react';
import { View, Text, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

/** ====== Tokens de diseño (coherentes con Home/Maternidad) ====== */
const SURFACE_BG = '#F6F8FC';   // fondo de pantalla
const CARD_BG = '#FFFFFF';   // fondo de la card
const CARD_BORDER = '#E6EAF2';   // borde sutil
const BRAND = '#4F46E5';

const INCIDENT_ITEM_BG = '#FEE2E2';
const INCIDENT_ITEM_BORDER = '#FECACA';
const INCIDENT_PILL_BG = '#FCA5A5';
const INCIDENT_PILL_TEXT = '#7F1D1D';
const INCIDENT_RIPPLE = 'rgba(127, 29, 29, 0.18)';

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

const LEFT_FLEX = 35;
const RIGHT_FLEX = 68;
const VALUE_W = 80;
const CHEVRON_W = 18;

type DatosGestacion = { alimentados: number; noAlimentados: number };
type Incidencia = {
  id: string | number;
  area: 'Gestación';
  corral: string | number;
  descripcion: string;
};

export const GestationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();

  // Datos demo
  const gestacion: DatosGestacion = { alimentados: 135, noAlimentados: 115 };
  const total = gestacion.alimentados + gestacion.noAlimentados;
  const pct = total ? Math.round((gestacion.alimentados / total) * 100) : 0;

  // Incidencias SOLO de Gestación (demo)
  const incidenciasGestacion: Incidencia[] = [
    { id: 1, area: 'Gestación', corral: '03', descripcion: 'Comedero bloqueado.' },
    { id: 2, area: 'Gestación', corral: '07', descripcion: 'Sensor de paso intermitente.' },
    { id: 3, area: 'Gestación', corral: '10', descripcion: 'Fallo de báscula.' },
    { id: 4, area: 'Gestación', corral: '04', descripcion: 'Bebedero con caudal bajo.' },
    { id: 5, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
  ];

  const DANGER = '#DC2626';
  const OK = '#16A34A';
  const noAl = gestacion.noAlimentados;
  const noAlColor = noAl === 0 ? OK : DANGER;

  // Fila de métrica
  const Row = ({
    label,
    value,
    onPress,
    strong = false,
    divider = false,
    action = false,
    labelColor,
    valueColor,
  }: {
    label: string;
    value: number | string;
    onPress?: () => void;
    strong?: boolean;
    divider?: boolean;
    action?: boolean;
    labelColor?: string;
    valueColor?: string;
  }) => {
    const Comp: any = onPress ? Pressable : View;
    return (
      <>
        {divider ? <View className="h-px" style={{ backgroundColor: CARD_BORDER }} /> : null}
        <Comp
          onPress={onPress}
          android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
        >
          <Text
            style={{
              flex: 1,
              color: labelColor ?? '#475569',
              marginRight: 8,
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {label}
          </Text>

          <Text
            style={{
              width: VALUE_W,
              textAlign: 'right',
              color: valueColor ?? '#0F172A',
              fontWeight: strong ? '800' : '600',
            }}
          >
            {value}
          </Text>

          <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
            {action ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
          </View>
        </Comp>
      </>
    );
  };

  // Fila de navegación (CTA) con icono + texto alineado y chevron
  const NavRow = ({
    icon = 'grid-outline',
    label,
    onPress,
    divider = true,
  }: {
    icon?: string;
    label: string;
    onPress: () => void;
    divider?: boolean;
  }) => (
    <>
      {divider ? <View className="h-px" style={{ backgroundColor: CARD_BORDER }} /> : null}
      <Pressable
        onPress={onPress}
        android_ripple={{ color: '#e5e7eb' }}
        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons name={icon as any} size={16} color={BRAND} />
          <Text style={{ marginLeft: 8, color: BRAND, fontWeight: '700' }}>{label}</Text>
        </View>
        <View style={{ width: VALUE_W }} />
        <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
          <Ionicons name="chevron-forward" size={16} color={BRAND} />
        </View>
      </Pressable>
    </>
  );

  const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
    <View className="flex-row items-center justify-between mb-3 px-5">
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={18} color="#0f172a" />
        <Text className="ml-2 text-slate-900 text-[18px] font-extrabold">{text}</Text>
      </View>
      {typeof count === 'number' && (
        <View className="px-2 py-0.5 rounded-full bg-slate-200/70">
          <Text className="text-xs text-slate-700">{count}</Text>
        </View>
      )}
    </View>
  );

  // Tarjeta de incidencia
  const renderIncidencia = ({ item }: { item: Incidencia }) => (
    <Pressable
      onPress={() => { }}
      android_ripple={{ color: INCIDENT_RIPPLE }}
      className="rounded-2xl border"
      style={{
        backgroundColor: INCIDENT_ITEM_BG,
        borderColor: INCIDENT_ITEM_BORDER,
        paddingVertical: 12,
        paddingHorizontal: 14,
        ...SHADOW,
      }}
    >
      <View className="flex-row items-center">
        <Text
          className="px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ backgroundColor: INCIDENT_PILL_BG, color: INCIDENT_PILL_TEXT }}
        >
          {item.area}
        </Text>
        <Text className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
          Corral {item.corral}
        </Text>
      </View>
      <Text className="mt-2 text-slate-900">{item.descripcion}</Text>
    </Pressable>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: SURFACE_BG, paddingBottom: insets.bottom + 8 }}>
      {/* Bloque 1: Donut + métricas */}
      <View className="px-5 mt-4 mb-6">
        <View
          className="rounded-2xl border p-5 overflow-hidden"
          style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER, ...SHADOW }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Donut */}
            <View style={{ flex: LEFT_FLEX }} className="items-center pr-2">
              <DonutChart
                size={132}
                strokeWidth={22}
                label="Gestación"
                segmentA={gestacion.alimentados}
                segmentB={gestacion.noAlimentados}
                colorA="#22C55E"
                colorB="#EF4444"
                lineCap="butt"
                gapDegrees={0}
                centerPercent={pct}
              />
            </View>

            {/* Separador */}
            <View className="w-px self-stretch mx-3" style={{ backgroundColor: CARD_BORDER }} />

            {/* Métricas + CTA */}
            <View style={{ flex: RIGHT_FLEX }} className="pr-1">
              <Row label="Alimentados" value={gestacion.alimentados} />
              <Row
                label="No Alimentados"
                value={noAl}
                divider
                action
                onPress={() => navigation.navigate('GES-NOFEED')}
                labelColor={noAlColor}
                valueColor={noAlColor}
              />
              <Row label="Totales animales" value={total} strong divider />

              <NavRow
                label="Ver corrales"
                icon="grid-outline"
                onPress={() => navigation.navigate('GES-CORRALPC' as never)}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Bloque 2: Incidencias (scroll interno) */}
      <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasGestacion.length} />

      <View className="px-5">
        <View
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 8, ...SHADOW }}
        >
          <View style={{ maxHeight: 320 }}>
            <FlatList
              data={incidenciasGestacion}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderIncidencia}
              showsVerticalScrollIndicator
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ paddingVertical: 2 }}
            />
          </View>
        </View>

        {/* CTAs alineados */}
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            marginTop: 12,
            marginBottom: insets.bottom + 8,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('GES-CORRALPC' as never)}
            activeOpacity={0.9}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: BRAND,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 2,
            }}
          >
            <Text className="text-white font-semibold">Ir al Corral</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('GES-CORRALPC' as never) /* ajusta ruta si tienes pantalla de Ops */}
            activeOpacity={0.9}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: BRAND,
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
              elevation: 2,
            }}
          >
            <Text className="text-white font-semibold">Operaciones</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
