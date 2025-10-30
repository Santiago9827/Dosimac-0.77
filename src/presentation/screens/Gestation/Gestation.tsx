// screens/Gestation/GestationScreen.tsx
import React from 'react';
import { View, Text, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SURFACE_BG = '#F6F8FC';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E6EAF2';
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
  const navigation = useNavigation<NavigationProp<any>>();

  const gestacion: DatosGestacion = { alimentados: 135, noAlimentados: 115 };
  const total = gestacion.alimentados + gestacion.noAlimentados;
  const pct = total ? Math.round((gestacion.alimentados / total) * 100) : 0;

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

  // Donut responsivo, igual que Maternidad
  const [donutSize, setDonutSize] = React.useState(132);
  const computeDonutSize = (rowWidth: number) => {
    const leftPct = LEFT_FLEX / (LEFT_FLEX + RIGHT_FLEX);
    const leftColWidth = rowWidth * leftPct;
    const safe = leftColWidth - 24;
    return Math.max(110, Math.min(132, Math.round(safe)));
  };

  const Row = ({
    label, value, onPress, strong = false, divider = false, action = false, labelColor, valueColor,
  }: {
    label: string; value: number | string; onPress?: () => void; strong?: boolean;
    divider?: boolean; action?: boolean; labelColor?: string; valueColor?: string;
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
          <Text style={{ flex: 1, color: labelColor ?? '#475569', marginRight: 8, flexShrink: 1, minWidth: 0 }}>
            {label}
          </Text>
          <Text style={{ width: VALUE_W, textAlign: 'right', color: valueColor ?? '#0F172A', fontWeight: strong ? '800' : '600' }}>
            {value}
          </Text>
          <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
            {action ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
          </View>
        </Comp>
      </>
    );
  };

  const LinkRow = ({ icon = 'grid-outline', label, onPress, divider = true }: {
    icon?: string; label: string; onPress: () => void; divider?: boolean;
  }) => (
    <>
      {divider ? <View className="h-px" style={{ backgroundColor: CARD_BORDER }} /> : null}
      <Pressable onPress={onPress} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
        <Ionicons name={icon as any} size={16} color={BRAND} />
        <Text style={{ marginLeft: 8, color: BRAND, fontWeight: '700', flex: 1 }}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
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

  const renderIncidencia = ({ item }: { item: Incidencia }) => (
    <Pressable
      onPress={() => { }}
      android_ripple={{ color: INCIDENT_RIPPLE }}
      className="rounded-2xl border"
      style={{ backgroundColor: INCIDENT_ITEM_BG, borderColor: INCIDENT_ITEM_BORDER, paddingVertical: 12, paddingHorizontal: 14, ...SHADOW }}
    >
      <View className="flex-row items-center">
        <Text className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: INCIDENT_PILL_BG, color: INCIDENT_PILL_TEXT }}>
          {item.area}
        </Text>
        <Text className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">Corral {item.corral}</Text>
      </View>
      <Text className="mt-2 text-slate-900">{item.descripcion}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE_BG }}>
      <View style={{ flex: 1 }}>
        {/* Donut + métricas */}
        <View className="px-5 mt-4 mb-6">
          <View className="rounded-2xl border p-5 overflow-hidden" style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER, ...SHADOW }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }} onLayout={(e) => setDonutSize(computeDonutSize(e.nativeEvent.layout.width))}>
              <View style={{ flex: LEFT_FLEX }} className="items-center pr-2">
                <DonutChart
                  size={donutSize}
                  strokeWidth={donutSize >= 128 ? 22 : donutSize >= 118 ? 20 : 18}
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
              <View className="w-px self-stretch mx-3" style={{ backgroundColor: CARD_BORDER }} />
              <View style={{ flex: RIGHT_FLEX }} className="pr-1">
                <Row label="Alimentados" value={gestacion.alimentados} />
                <Row label="No Alimentados" value={noAl} divider action onPress={() => navigation.navigate('GES-NOFEED')}
                  labelColor={noAlColor} valueColor={noAlColor} />
                <Row
                  label="Totales animales"
                  value={total}
                  strong
                  divider
                  action
                  onPress={() => navigation.navigate('GES-TODOS')}
                />
              </View>
            </View>
          </View>
        </View>
        {/* —— Ver corrales (suelto entre bloque 1 y bloque 2) —— */}
        <View className="px-5 mb-4">
          <Pressable
            onPress={() => navigation.navigate('GES-CORRALPC' as never)}
            android_ripple={{ color: '#e5e7eb' }}
            style={{
              backgroundColor: CARD_BG,
              borderColor: CARD_BORDER,
              borderWidth: 1,
              borderRadius: 16,
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              ...SHADOW,
            }}
          >
            <Ionicons name="grid-outline" size={18} color={BRAND} />
            <Text style={{ marginLeft: 8, color: BRAND, fontWeight: '800', flex: 1 }}>
              Ver corrales
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        </View>


        {/* Incidencias ocupa el resto */}
        <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasGestacion.length} />

        <View className="px-5" style={{ flex: 1 }}>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', paddingVertical: 8, paddingHorizontal: 8, ...SHADOW, flex: 1, marginBottom: 14 }}
          >
            <FlatList
              data={incidenciasGestacion}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderIncidencia}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              showsVerticalScrollIndicator
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 2, paddingBottom: 4, flexGrow: 1 }}
            />
          </View>
        </View>

        {/* Botones */}
        <View className="px-5" style={{ paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12, paddingTop: 6 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('GES-CORRAL-LOOKUP' as never)}
              activeOpacity={0.9}
              style={{
                flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                backgroundColor: BRAND, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 }, elevation: 2
              }}
            >
              <Text className="text-white font-semibold">Buscar Corral</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity
              onPress={() => navigation.navigate('GES-CORRALPC' as never)}
              activeOpacity={0.9}
              style={{
                flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                backgroundColor: BRAND, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 }, elevation: 2
              }}
            >
              <Text className="text-white font-semibold">Operaciones</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
