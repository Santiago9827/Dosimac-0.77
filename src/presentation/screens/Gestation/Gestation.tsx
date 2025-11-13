// screens/Gestation/GestationScreen.tsx
import React from 'react';
import { View, Text, Pressable, FlatList, TouchableOpacity, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DonutChart } from '../../components/shared/DonutChart';

const SURFACE_BG = '#F6F8FC';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E6EAF2';
const BRAND = '#4F46E5';

const INCIDENT_BLOCK_BG = '#FFFFFF';
const INCIDENT_ITEM_BG = '#FEE2E2';
const INCIDENT_ITEM_BORDER = '#FECACA';
const INCIDENT_PILL_BG = '#FCA5A5';
const INCIDENT_PILL_TEXT = '#7F1D1D';
// ⚠️ usa HEX en android_ripple
const INCIDENT_RIPPLE_HEX = '#fee2e2';

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

const DESC_LINES = 2;
const LINE_H = 18;
const CHIP_H = 22;
const PAD_V = 16;
const GAP = 8;
const CARD_H = PAD_V + CHIP_H + GAP + (LINE_H * DESC_LINES) + PAD_V; // ≈100
const MAX_INCIDENCIAS_WEB = 12;
const isWeb = Platform.OS === 'web';

type DatosGestacion = { alimentados: number; noAlimentados: number };
type Incidencia = {
  id: string | number;
  area: 'Gestación';
  corral: string | number;
  descripcion: string;
};

export default function GestationScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { width, height } = useWindowDimensions();

  const isMd = width >= 768;
  const isLg = width >= 1024;
  const pagePX = isLg ? 48 : isMd ? 24 : 16;
  const incHeight = !isMd ? Math.round(Math.max(260, Math.min(420, height * 0.38))) : undefined;

  const gestacion: DatosGestacion = { alimentados: 135, noAlimentados: 115 };
  const total = gestacion.alimentados + gestacion.noAlimentados;
  const pct = total ? Math.round((gestacion.alimentados / total) * 100) : 0;

  const incidenciasGestacion: Incidencia[] = [
    { id: 1, area: 'Gestación', corral: '03', descripcion: 'Comedero bloqueado.' },
    { id: 2, area: 'Gestación', corral: '07', descripcion: 'Sensor de paso intermitente.' },
    { id: 3, area: 'Gestación', corral: '10', descripcion: 'Fallo de báscula Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo Bebedero con caudal bajo' },
    { id: 4, area: 'Gestación', corral: '04', descripcion: 'Bebedero con caudal bajo.' },
    { id: 5, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 6, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 7, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 8, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 9, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 10, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 11, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },
    { id: 12, area: 'Gestación', corral: '12', descripcion: 'Puerta sin cierre.' },

  ];

  const DANGER = '#DC2626';
  const OK = '#16A34A';
  const noAl = gestacion.noAlimentados;
  const noAlColor = noAl === 0 ? OK : DANGER;

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
        {divider ? <View style={{ height: 1, backgroundColor: CARD_BORDER }} /> : null}
        <Comp
          onPress={onPress}
          android_ripple={onPress ? { color: INCIDENT_RIPPLE_HEX } : undefined}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
        >
          <Text style={{ flex: 1, color: labelColor ?? '#475569', marginRight: 8, flexShrink: 1, minWidth: 0, fontSize: 15 }}>
            {label}
          </Text>
          <Text style={{ width: VALUE_W, textAlign: 'right', color: valueColor ?? '#0F172A', fontWeight: strong ? '800' : '600', fontSize: 16 }}>
            {value}
          </Text>
          <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
            {action ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
          </View>
        </Comp>
      </>
    );
  };

  const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={icon as any} size={18} color="#0f172a" />
        <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '800', fontSize: isLg ? 22 : isMd ? 20 : 18 }}>
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

  const [expandedIds, setExpandedIds] = React.useState<Set<Incidencia['id']>>(new Set());
  const toggleExpanded = (id: Incidencia['id']) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const renderIncidencia = ({ item }: { item: Incidencia }) => {
    const isExpanded = expandedIds.has(item.id);
    const clampWeb =
      !isExpanded && Platform.OS === 'web'
        ? ({ display: '-webkit-box', WebkitLineClamp: DESC_LINES, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any)
        : null;

    return (
      <Pressable
        onPress={() => toggleExpanded(item.id)}
        android_ripple={{ color: INCIDENT_RIPPLE_HEX }}
        style={[
          {
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            backgroundColor: INCIDENT_ITEM_BG,
            borderColor: INCIDENT_ITEM_BORDER,
            height: isExpanded ? undefined : CARD_H,
            minHeight: CARD_H,
          },
          SHADOW as any,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 12, fontWeight: '600', backgroundColor: INCIDENT_PILL_BG, color: INCIDENT_PILL_TEXT }}>
            {item.area}
          </Text>
          <Text style={{ marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: '#F1F5F9', color: '#475569', fontSize: 12 }}>
            Corral {item.corral}
          </Text>
          <View style={{ flex: 1 }} />
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#7c3aed" />
        </View>

        <Text
          style={[
            { marginTop: 8, color: '#0f172a', lineHeight: 18, minWidth: 0 },
            clampWeb,
            Platform.OS === 'web' ? ({ wordBreak: 'break-word' } as any) : null,
          ]}
          numberOfLines={isExpanded ? undefined : DESC_LINES}
          ellipsizeMode="tail"
        >
          {item.descripcion}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE_BG }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: pagePX,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* BLOQUE 1: Donut + métricas */}
        <View
          style={{
            borderRadius: 18,
            backgroundColor: CARD_BG,
            ...SHADOW,
            marginBottom: 24,
            overflow: 'hidden',
          }}
          onLayout={(e) => setDonutSize(computeDonutSize(e.nativeEvent.layout.width))}
        >
          <View
            style={{
              backgroundColor: BRAND,
              paddingVertical: 12,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontWeight: '700', color: '#fff', fontSize: 17 }}>Gestación</Text>
            <Ionicons name="analytics-outline" size={20} color="#fff" />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <View style={{ flex: LEFT_FLEX, alignItems: 'center', paddingRight: 8 }}>
              <DonutChart
                size={donutSize}
                strokeWidth={donutSize >= 128 ? 22 : donutSize >= 118 ? 20 : 18}
                label=""
                segmentA={gestacion.alimentados}
                segmentB={gestacion.noAlimentados}
                colorA="#22C55E"
                colorB="#EF4444"
                lineCap="butt"
                centerPercent={pct}
              />
            </View>

            <View style={{ width: 1, backgroundColor: CARD_BORDER, alignSelf: 'stretch', marginHorizontal: 12 }} />

            <View style={{ flex: RIGHT_FLEX, paddingRight: 4 }}>
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

        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('GES-CORRALPC' as never)}
            activeOpacity={0.85}
            style={{
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: isMd ? 10 : 12,
              backgroundColor: BRAND,
              shadowColor: '#000',
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
              alignSelf: isMd ? 'center' : 'stretch',
              width: isMd ? '100%' : undefined,
              maxWidth: isMd ? 580 : undefined,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="grid-outline" size={18} color="#fff" />
              <Text style={{ marginLeft: 8, color: '#fff', fontWeight: '600', textAlign: 'center' }}>
                Ver corrales
              </Text>
            </View>
          </TouchableOpacity>
        </View>


        {/* BLOQUE 2: Incidencias */}
        <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasGestacion.length} />

        {isWeb && isMd && incidenciasGestacion.length > MAX_INCIDENCIAS_WEB && (
          <Text style={{ marginBottom: 8, color: '#64748B', fontSize: 12 }}>
            {MAX_INCIDENCIAS_WEB} de {incidenciasGestacion.length}.
          </Text>
        )}

        {!isMd ? (
          <View style={{ borderWidth: 1, borderColor: CARD_BORDER, backgroundColor: INCIDENT_BLOCK_BG, borderRadius: 16, ...SHADOW, maxHeight: incHeight, marginBottom: 16 }}>
            <FlatList
              data={incidenciasGestacion}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderIncidencia}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              extraData={expandedIds}
            />
          </View>
        ) : (
          (() => {
            const src = isWeb ? incidenciasGestacion.slice(0, MAX_INCIDENCIAS_WEB) : incidenciasGestacion;
            const numCols = isLg ? 3 : 2;
            const cols: Incidencia[][] = Array.from({ length: numCols }, () => []);
            src.forEach((it, i) => cols[i % numCols].push(it));
            return (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', ...(Platform.OS === 'web' ? { gap: 8 } : {}), marginBottom: 16 }}>
                {cols.map((col, ci) => (
                  <View key={`col-${ci}`} style={{ flex: 1 }}>
                    {col.map((it, idx) => (
                      <View key={String(it.id)} style={idx > 0 ? { marginTop: 8 } : undefined}>
                        {renderIncidencia({ item: it })}
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          })()
        )}

        {/* CTA inferior */}
        <TouchableOpacity
          onPress={() => navigation.navigate('GES-CORRAL-LOOKUP' as never)}
          activeOpacity={0.85}
          style={{
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
            alignSelf: isMd ? 'center' : 'stretch',
            width: isMd ? '100%' : undefined,
            maxWidth: isMd ? 580 : undefined,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="search-outline" size={18} color="#fff" />
            <Text style={{ marginLeft: 8, color: '#fff', fontWeight: '600', textAlign: 'center' }}>
              Buscar corral
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
