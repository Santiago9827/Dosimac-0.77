// screens/Gestation/GestationScreen.tsx
import React from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CARD_BG = '#F1F5F9';
const CARD_BORDER = '#E2E8F0';

const LEFT_FLEX = 35;
const RIGHT_FLEX = 68;
const VALUE_W = 80;
const CHEVRON_W = 18;

type DatosGestacion = { alimentados: number; noAlimentados: number };

export const GestationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();

  const gestacion: DatosGestacion = { alimentados: 135, noAlimentados: 115 };
  const total = gestacion.alimentados + gestacion.noAlimentados;
  const pct = total ? Math.round((gestacion.alimentados / total) * 100) : 0;

  const DANGER = '#DC2626';
  const OK = '#16A34A';
  const noAl = gestacion.noAlimentados;
  const noAlColor = noAl === 0 ? OK : DANGER;

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
        {divider ? <View className="h-px bg-slate-200 opacity-80" /> : null}
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

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom + 8 }}>
      <View className="px-5 mt-4">
        <View
          className="rounded-2xl border p-5 shadow-sm overflow-hidden"
          style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Donut izquierda */}
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
            <View className="w-px bg-slate-200 self-stretch mx-3" />

            {/* Métricas derecha */}
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

              {/* === Botones de navegación === */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                {/* Vista tabla (la que ya tenías) */}
                {/* <TouchableOpacity
                  onPress={() => navigation.navigate('GES-CORRAL' as never)}
                  className="flex-row items-center px-3 py-2 rounded-xl bg-white border"
                  style={{ borderColor: '#CBD5E1' }}
                  activeOpacity={0.9}
                >
                  <Ionicons name="list-outline" size={16} color="#4F46E5" />
                  <Text className="ml-1.5 text-indigo-600 font-semibold">Corrales (tabla)</Text>
                </TouchableOpacity> */}

                {/* Espacio */}
                <View style={{ width: 8 }} />

                {/* Nueva vista en tarjetas (grid tipo PCComponentes) */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('GES-CORRALPC' as never)}
                  className="flex-row items-center px-3 py-2 rounded-xl bg-white border"
                  style={{ borderColor: '#CBD5E1' }}
                  activeOpacity={0.9}
                >
                  <Ionicons name="grid-outline" size={16} color="#4F46E5" />
                  <Text className="ml-1.5 text-indigo-600 font-semibold">Corrales</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
