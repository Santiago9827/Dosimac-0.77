// screens/Maternity/MaternidadScreen.tsx
/* eslint-disable prettier/prettier */
import React from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DonutChart } from '../../components/shared/DonutChart';

// ===== colores/const =====
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

// layout donut
const LEFT_FLEX = 35;
const RIGHT_FLEX = 68;
const VALUE_W = 80;
const CHEVRON_W = 18;

// altura uniforme incidencias (colapsado)
const CARD_H = 92;
const DESC_LINES = 2;

// ===== tipos =====
type DatosMaternidad = { alimentados: number; noAlimentados: number };
type Incidencia = {
    id: string | number;
    area: 'Maternidad' | 'Gestación';
    corral: string | number;
    descripcion: string;
};

export default function MaternidadScreen() {
    const navigation = useNavigation<NavigationProp<any>>();
    const { width, height } = useWindowDimensions();
    const isMd = width >= 768;
    const isLg = width >= 1024;
    const pagePX = isLg ? 48 : isMd ? 24 : 16;
    const incHeight = !isMd
        ? Math.round(Math.max(260, Math.min(420, height * 0.38)))
        : undefined;
    const gridCol = (isLg ? '32%' : isMd ? '48%' : '100%') as any;

    // ===== Header: 3 puntos + menú flotante =====
    const [menuOpen, setMenuOpen] = React.useState(false);
    const btnRef = React.useRef<TouchableOpacity>(null);
    const [btnPos, setBtnPos] = React.useState({ x: 0, y: 0, w: 0, h: 0 });

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Maternidad',
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
        });
    }, [navigation]);

    // ===== Datos demo =====
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
        { id: 8, area: 'Maternidad', corral: '2010', descripcion: 'Alarma de temperatura alta.' },
        { id: 9, area: 'Maternidad', corral: '2011', descripcion: 'Fallo de ventilación.' },
        { id: 10, area: 'Maternidad', corral: '2012', descripcion: 'Alarma de movimiento inusual.' },
        { id: 11, area: 'Maternidad', corral: '2013', descripcion: 'Fallo en el sistema de alimentación.' },
        { id: 12, area: 'Maternidad', corral: '2014', descripcion: 'Sensor de humedad fuera de rango.' },
        { id: 13, area: 'Maternidad', corral: '2015', descripcion: 'Problema eléctrico detectado.' },
        { id: 14, area: 'Maternidad', corral: '2016', descripcion: 'Alarma de intrusión activada.' },
        { id: 15, area: 'Maternidad', corral: '2017', descripcion: 'Fallo en el sistema de calefacción.' },
    ];


    // ===== Donut responsivo =====
    const [donutSize, setDonutSize] = React.useState(132);
    const computeDonutSize = (rowWidth: number) => {
        const leftPct = LEFT_FLEX / (LEFT_FLEX + RIGHT_FLEX);
        const leftColWidth = rowWidth * leftPct;
        const safe = leftColWidth - 24;
        return Math.max(110, Math.min(132, Math.round(safe)));
    };

    // ===== rows métricas =====
    const DANGER = '#DC2626';
    const OK = '#16A34A';
    const noAl = maternidad.noAlimentados;
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
                {divider ? <View style={{ height: 1, backgroundColor: CARD_BORDER }} /> : null}
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

    // ===== título de sección =====
    const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={icon as any} size={18} color="#0f172a" />
                <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '800', fontSize: isLg ? 22 : isMd ? 20 : 18 }}>{text}</Text>
            </View>
            {typeof count === 'number' && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(226,232,240,0.7)' }}>
                    <Text style={{ fontSize: 12, color: '#334155' }}>{count}</Text>
                </View>
            )}
        </View>
    );

    // ===== incidencias: expand/collapse =====
    const [expandedIds, setExpandedIds] = React.useState<Set<Incidencia['id']>>(new Set());
    const toggleExpanded = (id: Incidencia['id']) =>
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const renderIncidencia = ({ item }: { item: Incidencia }) => {
        const isExpanded = expandedIds.has(item.id);
        return (
            <Pressable
                onPress={() => toggleExpanded(item.id)}
                android_ripple={{ color: INCIDENT_RIPPLE }}
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
                accessibilityRole="button"
                accessibilityLabel={`Incidencia en ${item.area}, Corral ${item.corral}`}
                accessibilityHint={isExpanded ? 'Pulsa para contraer' : 'Pulsa para expandir'}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                        style={{
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: '600',
                            backgroundColor: INCIDENT_PILL_BG,
                            color: INCIDENT_PILL_TEXT,
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
                    <View style={{ flex: 1 }} />
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#7c3aed" />
                </View>

                <Text
                    style={[
                        {
                            marginTop: 8,
                            color: '#0f172a',
                            minWidth: 0,
                            lineHeight: 18,
                        },
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
                contentContainerStyle={{ paddingHorizontal: pagePX, paddingTop: 16, paddingBottom: 24 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Donut + métricas */}
                <View style={{ marginBottom: 24 }}>
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: CARD_BORDER,
                            backgroundColor: CARD_BG,
                            borderRadius: 16,
                            padding: 16,
                            overflow: 'hidden',
                            ...SHADOW,
                        }}
                        onLayout={(e) => setDonutSize(computeDonutSize(e.nativeEvent.layout.width))}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {/* donut izquierda */}
                            <View style={{ flex: LEFT_FLEX, alignItems: 'center', paddingRight: 8 }}>
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

                            {/* separador */}
                            <View style={{ width: 1, backgroundColor: CARD_BORDER, alignSelf: 'stretch', marginHorizontal: 12 }} />

                            {/* métricas derecha */}
                            <View style={{ flex: RIGHT_FLEX, paddingRight: 4 }}>
                                <Row label="Alimentados" value={maternidad.alimentados} />
                                <Row
                                    label="No Alimentados"
                                    value={maternidad.noAlimentados}
                                    divider
                                    action
                                    onPress={() => navigation.navigate('NoAlimentadosMaternidad' as never)}
                                    labelColor={noAlColor}
                                    valueColor={noAlColor}
                                />
                                <Row
                                    label="Totales animales"
                                    value={total}
                                    strong
                                    divider
                                    action
                                    onPress={() => navigation.navigate('TodosAnimalesMaternidad' as never)}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Incidencias */}
                <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasMaternidad.length} />

                {!isMd ? (
                    // móvil: bloque con scroll propio
                    <View
                        style={{
                            borderWidth: 1,
                            borderColor: CARD_BORDER,
                            backgroundColor: INCIDENT_BLOCK_BG,
                            borderRadius: 16,
                            ...SHADOW,
                            maxHeight: incHeight,
                            marginBottom: 16,
                        }}
                    >
                        <FlatList
                            data={incidenciasMaternidad}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderIncidencia}
                            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            contentContainerStyle={{ padding: 12 }}
                            showsVerticalScrollIndicator
                            nestedScrollEnabled
                            extraData={expandedIds} // esencial para re-layout al expandir
                        />
                    </View>
                ) : (
                    // tablet/escritorio: grid responsivo
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 8, marginBottom: 16 }}>
                        {incidenciasMaternidad.map((it) => (
                            <View key={String(it.id)} style={{ flexBasis: gridCol, maxWidth: gridCol }}>
                                {renderIncidencia({ item: it })}
                            </View>
                        ))}
                    </View>
                )}

                {/* CTA inferior: Buscar corral */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('MAT-CORRAL' as never)}
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
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Buscar corral</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Menú flotante (3 puntos) */}
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

const styles = StyleSheet.create({
    // (reservado si luego quieres mover estilos aquí)
});
