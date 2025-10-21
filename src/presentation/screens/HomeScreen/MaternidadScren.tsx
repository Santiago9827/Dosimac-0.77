// screens/Maternity/MaternidadScreen.tsx
/* eslint-disable prettier/prettier */
import React from 'react';
import { View, Text, Pressable, FlatList, TouchableOpacity, Modal, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SURFACE_BG = '#F6F8FC';
const CARD_BG = '#FFFFFF';
const CARD_BORDER = '#E6EAF2';
const BRAND = '#4F46E5';

const INCIDENT_BLOCK_BG = '#FFFFFF';
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

type DatosMaternidad = { alimentados: number; noAlimentados: number };
type Incidencia = {
    id: string | number;
    area: 'Maternidad' | 'Gestación';
    corral: string | number;
    descripcion: string;
};

export default function MaternidadScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    // ===== Header: botón de 3 puntos + menú =====
    const [menuOpen, setMenuOpen] = React.useState(false);
    const btnRef = React.useRef<TouchableOpacity>(null);
    const [btnPos, setBtnPos] = React.useState({ x: 0, y: 0, w: 0, h: 0 });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    ref={btnRef}
                    onLayout={() => btnRef.current?.measureInWindow((x, y, w, h) => setBtnPos({ x, y, w, h }))}
                    onPress={() =>
                        btnRef.current?.measureInWindow((x, y, w, h) => {
                            setBtnPos({ x, y, w, h });
                            setMenuOpen(true);
                        })
                    }
                    style={{ marginRight: 12, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#0f172a" />
                </TouchableOpacity>
            ),
            title: 'Maternidad',
        });
    }, [navigation]);

    // ===== Datos de demo =====
    const maternidad: DatosMaternidad = { alimentados: 180, noAlimentados: 20 };
    const total = maternidad.alimentados + maternidad.noAlimentados;
    const pct = total ? Math.round((maternidad.alimentados / total) * 100) : 0;

    const incidenciasMaternidad: Incidencia[] = [
        { id: 1, area: 'Maternidad', corral: '02', descripcion: 'Bebedero con caudal bajo.' },
        { id: 2, area: 'Maternidad', corral: '05', descripcion: 'Puerta sin cierre.' },
        { id: 3, area: 'Maternidad', corral: '07', descripcion: 'Sensor de paso intermitente.' },
        { id: 4, area: 'Maternidad', corral: '15', descripcion: 'Fallo de báscula.' },
        { id: 5, area: 'Maternidad', corral: '03', descripcion: 'Comedero bloqueado.' },
        { id: 6, area: 'Maternidad', corral: '2008', descripcion: 'Fallo comedero.' },
        { id: 7, area: 'Maternidad', corral: '2009', descripcion: 'Fallo sensor.' },
    ];

    const DANGER = '#DC2626';
    const OK = '#16A34A';

    // ===== Donut responsivo =====
    const [donutSize, setDonutSize] = React.useState(132);
    const computeDonutSize = (rowWidth: number) => {
        const leftPct = LEFT_FLEX / (LEFT_FLEX + RIGHT_FLEX);
        const leftColWidth = rowWidth * leftPct;
        const safe = leftColWidth - 24;
        return Math.max(110, Math.min(132, Math.round(safe)));
    };

    // ===== Rows =====
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
                    <Text style={{ flex: 1, color: labelColor ?? '#475569', marginRight: 8, flexShrink: 1, minWidth: 0 }}>{label}</Text>

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

    const noAl = maternidad.noAlimentados;
    const noAlColor = noAl === 0 ? OK : DANGER;

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
            className="rounded-2xl p-4 border"
            style={{ backgroundColor: INCIDENT_ITEM_BG, borderColor: INCIDENT_ITEM_BORDER, ...SHADOW }}
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
                {/* Bloque 1: Donut + métricas */}
                <View className="px-5 mb-6">
                    <View className="rounded-2xl border p-5 overflow-hidden" style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER, ...SHADOW }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }} onLayout={(e) => setDonutSize(computeDonutSize(e.nativeEvent.layout.width))}>
                            {/* Donut */}
                            <View style={{ flex: LEFT_FLEX }} className="items-center pr-2">
                                <DonutChart
                                    size={donutSize}
                                    strokeWidth={donutSize >= 128 ? 22 : donutSize >= 118 ? 20 : 18}
                                    label="Maternidad"
                                    segmentA={maternidad.alimentados}
                                    segmentB={maternidad.noAlimentados}
                                    colorA="#22C55E"
                                    colorB="#EF4444"
                                    lineCap="butt"
                                    gapDegrees={0}
                                    centerPercent={pct}
                                />
                            </View>

                            {/* Separador */}
                            <View className="w-px self-stretch mx-3" style={{ backgroundColor: CARD_BORDER }} />

                            {/* Métricas (sin "Buscar corral") */}
                            <View style={{ flex: RIGHT_FLEX }} className="pr-1">
                                <Row label="Alimentados" value={maternidad.alimentados} />
                                <Row
                                    label="No Alimentados"
                                    value={noAl}
                                    divider
                                    action
                                    onPress={() => navigation.navigate('NoAlimentadosMaternidad')}
                                    labelColor={noAlColor}
                                    valueColor={noAlColor}
                                />
                                <Row
                                    label="Totales animales"
                                    value={total}
                                    strong
                                    divider
                                    action
                                    onPress={() => navigation.navigate('TodosAnimalesMaternidad')}
                                />
                                {/* <-- Se eliminó el LinkRow de Buscar corral aquí */}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Incidencias */}
                <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasMaternidad.length} />

                <View className="px-5" style={{ flex: 1 }}>
                    <View
                        className="rounded-2xl overflow-hidden"
                        style={{ backgroundColor: INCIDENT_BLOCK_BG, paddingVertical: 12, paddingHorizontal: 12, ...SHADOW, flex: 1 }}
                    >
                        <FlatList
                            data={incidenciasMaternidad}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderIncidencia}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            showsVerticalScrollIndicator
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 4 }}
                        />
                    </View>
                </View>

                {/* CTA inferior: Buscar corral */}
                <View className="px-5">
                    <TouchableOpacity
                        onPress={() => navigation.navigate('MAT-CORRAL' as never)}
                        className="mt-4 rounded-xl px-4 py-3 active:opacity-90"
                        style={{
                            backgroundColor: BRAND,
                            shadowColor: '#000',
                            shadowOpacity: 0.18,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 3,
                        }}
                    >
                        <Text className="text-white text-center font-semibold">Buscar corral</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ===== Menú flotante (3 puntos) ===== */}
            <Modal visible={menuOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenuOpen(false)}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMenuOpen(false)} />
                    {(() => {
                        const W = Dimensions.get('window').width;
                        const MENU_W = 220;
                        const GAP = 8;
                        const top = btnPos.y + btnPos.h + GAP;
                        const left = Math.min(Math.max(btnPos.x + btnPos.w - MENU_W, 12), W - MENU_W - 12);

                        return (
                            <View
                                style={{
                                    position: 'absolute',
                                    top,
                                    left,
                                    width: MENU_W,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                    borderColor: CARD_BORDER,
                                    borderRadius: 12,
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowRadius: 12,
                                    shadowOffset: { width: 0, height: 6 },
                                    elevation: 12,
                                    overflow: 'hidden',
                                }}
                            >
                                <Text style={{ paddingHorizontal: 12, paddingVertical: 10, color: '#64748B', fontWeight: '700' }}>Acciones</Text>

                                <TouchableOpacity
                                    onPress={() => {
                                        setMenuOpen(false);
                                        navigation.navigate('MAT-INTRO-LOTE' as never);
                                    }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>Introducir animales por lote</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
