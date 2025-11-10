// screens/Maternity/NoAlimentadosScreenMaternidad.tsx
/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';


type Animal = {
    crotal: string;
    corral: string;
    total: number;
    consumida: number;
    diasSinAlimentar?: number;
};

const BRAND = '#3F0BAE';
const CARD_BORDER = '#E2E8F0';
const BG = '#F1F5F9';
const MAX_W = 850;
const PAGE_PX = 24;
const FILTER_W = 48;
const GAP_Y = 12;
const PALETTE = {

    mint: {
        bg: '#10B981',
        accent: '#34D399',
        text: '#F0FDF4',
        pillBg: 'rgba(255,255,255,0.18)',
        pillBorder: 'rgba(255,255,255,0.48)',
    },
    limePop: {
        bg: '#22C55E',
        accent: '#84CC16',
        text: '#F7FEE7',
        pillBg: 'rgba(255,255,255,0.18)',
        pillBorder: 'rgba(255,255,255,0.48)',
    },
    tealCandy: {
        bg: '#06B6D4',
        accent: '#22D3EE',
        text: '#ECFEFF',
        pillBg: 'rgba(255,255,255,0.16)',
        pillBorder: 'rgba(255,255,255,0.45)',
    },
    oceanBlue: {
        bg: '#2563EB',
        accent: '#60A5FA',
        text: '#F5F9FF',
        pillBg: 'rgba(255,255,255,0.18)',
        pillBorder: 'rgba(255,255,255,0.46)',
    },
    royalBlue: {
        bg: '#4a71e0',
        accent: '#93C5FD',
        text: '#F8FAFF',
        pillBg: 'rgba(255,255,255,0.18)',
        pillBorder: 'rgba(255,255,255,0.48)',
    },
    indigoGlow: {
        bg: '#4F46E5',
        accent: '#A5B4FC',
        text: '#EEF2FF',
        pillBg: 'rgba(255,255,255,0.16)',
        pillBorder: 'rgba(255,255,255,0.44)',
    },
    skyBreeze: {
        bg: '#0EA5E9',
        accent: '#38BDF8',
        text: '#F0F9FF',
        pillBg: 'rgba(255,255,255,0.16)',
        pillBorder: 'rgba(255,255,255,0.42)',
    },
    cobaltWave: {
        bg: '#1E40AF',
        accent: '#3B82F6',
        text: '#EAF2FF',
        pillBg: 'rgba(255,255,255,0.14)',
        pillBorder: 'rgba(255,255,255,0.40)',
    },
    midnightBlue: {
        bg: '#0F172A',
        accent: '#1E3A8A',
        text: '#E2E8F0',
        pillBg: 'rgba(255,255,255,0.12)',
        pillBorder: 'rgba(255,255,255,0.32)',
    },
} as const;

// Usa uno así:
const t = PALETTE.cobaltWave; // o oceanBlue / skyBreeze / royalBlue / cobaltWave / midnightBlue







const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

const ProgressPill = ({ value, total }: { value: number; total: number }) => {
    const percent = pct(value, total);
    const BAR_H = 24;
    return (
        <View style={{ marginTop: 8 }}>
            <Text style={{ color: '#64748B', marginBottom: 4 }}>
                {value.toLocaleString('es-ES')} / {total.toLocaleString('es-ES')}
            </Text>
            <View
                style={{
                    height: BAR_H,
                    borderRadius: BAR_H / 2,
                    backgroundColor: '#E5E7EB',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <View
                    style={{
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        height: '100%',
                        backgroundColor: '#22C55E',
                        borderRadius: BAR_H / 2,
                    }}
                />
                <View
                    pointerEvents="none"
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#1F2937', fontWeight: '700' }}>{percent}%</Text>
                </View>
            </View>
        </View>
    );
};

export default function NoAlimentadosScreenMaternidad() {
    const navigation = useNavigation<NavigationProp<any>>();
    const { width } = useWindowDimensions();

    const data: Animal[] = [
        { crotal: '987654321098765', corral: '02', total: 1500, consumida: 730, diasSinAlimentar: 5 },
        { crotal: '999888777666555', corral: '08', total: 2500, consumida: 500, diasSinAlimentar: 4 },
        { crotal: '777888999000111', corral: '09', total: 1600, consumida: 400, diasSinAlimentar: 4 },
        { crotal: '444333222111000', corral: '07', total: 3000, consumida: 1500, diasSinAlimentar: 3 },
        { crotal: '333444555666777', corral: '10', total: 2200, consumida: 1100, diasSinAlimentar: 3 },
        { crotal: '222333444555666', corral: '05', total: 1800, consumida: 900, diasSinAlimentar: 2 },
        { crotal: '111222333444555', corral: '01', total: 2000, consumida: 1000, diasSinAlimentar: 2 },
        { crotal: '666555444333222', corral: '03', total: 2700, consumida: 1350, diasSinAlimentar: 1 },
        { crotal: '555666777888999', corral: '04', total: 2400, consumida: 1200, diasSinAlimentar: 1 },
        { crotal: '123456789012345', corral: '06', total: 2000, consumida: 1800 },
        { crotal: '112233445566778', corral: '11', total: 2100, consumida: 1050, diasSinAlimentar: 6 },
        { crotal: '887766554433221', corral: '12', total: 2300, consumida: 1150, diasSinAlimentar: 7 },
        { crotal: '998877665544332', corral: '13', total: 1900, consumida: 950, diasSinAlimentar: 8 },
        { crotal: '776655443322110', corral: '14', total: 2600, consumida: 1300, diasSinAlimentar: 9 },
        { crotal: '665544332211009', corral: '15', total: 2800, consumida: 1400, diasSinAlimentar: 10 },

    ]

    const [sort, setSort] = useState<{ key: 'dias' | 'corral'; dir: 'asc' | 'desc' }>({
        key: 'dias',
        dir: 'desc',
    });

    const [menuOpen, setMenuOpen] = useState(false);
    const [btnPos, setBtnPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const btnRef = useRef<View>(null);

    const dayPillColors = (d: number) => {
        if (d >= 5) return { bg: '#FEE2E2', fg: '#7F1D1D' };
        if (d >= 3) return { bg: '#FEF3C7', fg: '#92400E' };
        return { bg: '#DCFCE7', fg: '#166534' };
    };

    const dataSorted = useMemo(() => {
        const copy = [...data];
        copy.sort((a, b) => {
            if (sort.key === 'dias') {
                const ad = a.diasSinAlimentar ?? 0;
                const bd = b.diasSinAlimentar ?? 0;
                return sort.dir === 'asc' ? ad - bd : bd - ad;
            } else {
                const ac = parseInt(a.corral);
                const bc = parseInt(b.corral);
                return sort.dir === 'asc' ? ac - bc : bc - ac;
            }
        });
        return copy;
    }, [data, sort]);
    const Item = ({ item }: { item: Animal }) => (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
                navigation.navigate('MAT-CORRALDETAIL', {
                    corralId: Number(item.corral),
                    mockData: item,
                })
            }
        >
            <View
                style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: CARD_BORDER,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                    overflow: 'hidden',
                }}
            >
                {/* HEADER: color sólido + chip */}
                <View
                    style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        backgroundColor: t.bg,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                >
                    {/* Crotal (izquierda) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="pricetag-outline" size={16} color={t.text} />
                        <Text style={{ marginLeft: 8, color: t.text, fontWeight: '800' }}>
                            Crotal {item.crotal}
                        </Text>
                    </View>

                    {/* Chip Corral (derecha) */}
                    <View
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: t.pillBg,
                            borderWidth: 1,
                            borderColor: t.pillBorder,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Ionicons name="home-outline" size={14} color={t.text} />
                        <Text style={{ marginLeft: 6, color: t.text, fontWeight: '700' }}>
                            Corral {item.corral}
                        </Text>
                    </View>
                </View>

                {/* franja de acento debajo del header (sin gradiente) */}
                <View style={{ height: 3, backgroundColor: t.accent }} />

                {/* BODY */}
                <View style={{ padding: 16 }}>
                    <View
                        style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            padding: 12,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ color: '#475569', flex: 1 }}>Consumo</Text>

                            {typeof item.diasSinAlimentar === 'number' && (() => {
                                const { bg, fg } = dayPillColors(item.diasSinAlimentar ?? 0);
                                return (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: 10,
                                            paddingVertical: 6,
                                            borderRadius: 999,
                                            backgroundColor: bg,
                                        }}
                                    >
                                        <Ionicons name="time-outline" size={14} color={fg} />
                                        <Text style={{ marginLeft: 6, color: fg, fontWeight: '700' }}>
                                            {item.diasSinAlimentar} {item.diasSinAlimentar === 1 ? 'día' : 'días'}
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>

                        <ProgressPill value={item.consumida} total={item.total} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );



    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: BG }}>
            {/* Header centrado en columna de cards con botón a la derecha */}
            <View style={{ alignItems: 'center', paddingHorizontal: PAGE_PX, paddingTop: 10, paddingBottom: GAP_Y }}>
                <View
                    style={{
                        width: '100%',
                        maxWidth: MAX_W,
                        position: 'relative',
                        alignItems: 'center',
                        paddingRight: FILTER_W,
                        minHeight: 36,
                    }}
                >
                    {/* Botón de filtro anclado a la derecha */}
                    <TouchableOpacity
                        ref={btnRef as any}
                        onLayout={() => btnRef.current?.measureInWindow((x, y, w, h) => setBtnPos({ x, y, w, h }))}
                        onPress={() => btnRef.current?.measureInWindow((x, y, w, h) => { setBtnPos({ x, y, w, h }); setMenuOpen(true); })}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: CARD_BORDER,
                        }}
                        activeOpacity={0.85}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                        <Ionicons name="funnel-outline" size={18} color="#0f172a" />
                    </TouchableOpacity>

                    {/* Título centrado (con icono) */}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="alert-circle-outline" size={20} color="#0f172a" />
                        <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 18, color: '#0f172a', textAlign: 'center' }}>
                            No alimentados · Maternidad
                        </Text>
                    </View>
                </View>
            </View>


            {/* Filtro de orden visible centrado */}
            <View style={{ paddingHorizontal: 20, marginBottom: 15, }}>
                <View
                    style={{
                        width: '100%',
                        maxWidth: MAX_W,
                        alignSelf: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',  // centra el chip
                        gap: 10,
                        paddingRight: FILTER_W,
                        // transform: [{ translateX: -30 }]

                    }}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setSort((prev) => ({ ...prev, dir: prev.dir === 'asc' ? 'desc' : 'asc' }))}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#EDE9FE',
                            paddingHorizontal: 18,
                            paddingVertical: 10,
                            borderRadius: 999,
                            gap: 8,
                            shadowColor: '#000',
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                        }}
                    >
                        <Ionicons name={sort.key === 'dias' ? 'time-outline' : 'home-outline'} size={18} color={BRAND} />
                        <Text style={{ color: BRAND, fontWeight: '700', fontSize: 14 }}>
                            Orden: {sort.key === 'dias' ? 'Días sin alimentar' : 'Corral'}
                        </Text>
                        <Ionicons name={sort.dir === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'} size={18} color={BRAND} />
                    </TouchableOpacity>

                    {sort.key !== 'dias' && (
                        <TouchableOpacity
                            onPress={() => setSort({ key: 'dias', dir: 'desc' })}
                            style={{
                                width: 32, height: 32, borderRadius: 999, backgroundColor: '#F4F4F5',
                                alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB',
                            }}
                        >
                            <Ionicons name="close" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>




            {/* Scroll vertical, columna centrada */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 60,
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: '100%',
                        maxWidth: 850,
                    }}
                >
                    {dataSorted.map((item) => (
                        <Item key={item.crotal} item={item} />
                    ))}
                </View>
            </ScrollView>

            {/* Menú flotante */}
            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setMenuOpen(false)}
            >
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMenuOpen(false)} />
                    {(() => {
                        const W = Dimensions.get('window').width;
                        const MENU_W = 240;
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
                                <Text style={{ paddingHorizontal: 12, paddingVertical: 10, color: '#64748B', fontWeight: '700' }}>
                                    Ordenar por
                                </Text>

                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'dias', dir: 'desc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="time-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>Días sin alimentar</Text>
                                    {sort.key === 'dias' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'corral', dir: 'asc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="home-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>Corral</Text>
                                    {sort.key === 'corral' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            </Modal>

        </SafeAreaView>
    );
}
