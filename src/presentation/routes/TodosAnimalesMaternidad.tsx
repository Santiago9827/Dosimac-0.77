// screens/Maternity/TodosAnimalesMaternidad.tsx
/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = {
    crotal: string;
    corral: string;   // ej. "01"
    total: number;
    consumida: number;
};

const BRAND = '#3F0BAE';
const CARD_BORDER = '#E2E8F0';
const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

const ProgressPill = ({ value, total }: { value: number; total: number }) => {
    const percent = pct(value, total);
    const BAR_H = 24;
    return (
        <View style={{ marginTop: 8 }}>
            <Text className="text-slate-500 mb-1">
                {value.toLocaleString('es-ES')} / {total.toLocaleString('es-ES')}
            </Text>
            <View style={{ height: BAR_H, borderRadius: BAR_H / 2, backgroundColor: '#E5E7EB', overflow: 'hidden', position: 'relative' }}>
                <View style={{ width: `${Math.min(100, Math.max(0, percent))}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: BAR_H / 2 }} />
                <View pointerEvents="none" style={{ ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#1F2937', fontWeight: '700' }}>{percent}%</Text>
                </View>
            </View>
        </View>
    );
};

export default function TodosAnimalesMaternidad() {
    // MOCK: todos (alimentados y no alimentados)
    const data: Animal[] = [
        { crotal: '123456789012345', corral: '01', total: 2837, consumida: 2000 },
        { crotal: '987654321098765', corral: '02', total: 1500, consumida: 1500 },
        { crotal: '555666777888999', corral: '05', total: 2100, consumida: 210 },
        { crotal: '111222333444555', corral: '03', total: 1800, consumida: 1260 },
        { crotal: '999888777666555', corral: '08', total: 2500, consumida: 2500 },
        { crotal: '444333222111000', corral: '07', total: 3000, consumida: 1500 },
        { crotal: '222333444555666', corral: '04', total: 2750, consumida: 825 },
        { crotal: '777888999000111', corral: '09', total: 1600, consumida: 400 },
        { crotal: '333444555666777', corral: '10', total: 2200, consumida: 2200 },
        { crotal: '666555444333222', corral: '11', total: 2400, consumida: 600 },
    ];

    type SortKey = 'none' | 'pct' | 'crotal' | 'corral';
    type SortDir = 'asc' | 'desc';
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'none', dir: 'asc' });
    const [menuOpen, setMenuOpen] = useState(false);

    // Anclaje del menú al botón
    const btnRef = useRef<View>(null);
    const [btnPos, setBtnPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [headerBox, setHeaderBox] = useState({ y: 0, h: 0 });

    const dataSorted = useMemo(() => {
        const copy = [...data];
        const dir = sort.dir === 'asc' ? 1 : -1;
        if (sort.key === 'pct') {
            copy.sort((a, b) => dir * (pct(a.consumida, a.total) - pct(b.consumida, b.total)));
        } else if (sort.key === 'crotal') {
            copy.sort((a, b) => dir * a.crotal.localeCompare(b.crotal, 'es'));
        } else if (sort.key === 'corral') {
            copy.sort((a, b) => dir * a.corral.localeCompare(b.corral, 'es', { numeric: true }));
        }
        return copy;
    }, [data, sort]);

    const Item = ({ item }: { item: Animal }) => (
        <View
            className="rounded-2xl p-4 bg-white border border-slate-200 mb-3"
            style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="pricetag-outline" size={18} color="#0f172a" />
                    <Text className="ml-2 text-slate-900 font-semibold">{item.crotal}</Text>
                </View>
                <View className="px-3 py-1 rounded-full bg-slate-100">
                    <Text className="text-slate-700 font-medium">Corral {item.corral}</Text>
                </View>
            </View>

            <View className="mt-3 rounded-xl border p-3" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                <Text className="text-slate-600">Consumo</Text>
                <ProgressPill value={item.consumida} total={item.total} />
            </View>
        </View>
    );

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header + botón filtro */}
            <View
                onLayout={(e) => setHeaderBox({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
                style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="list-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                        Todos los animales · Maternidad
                    </Text>
                </View>

                <TouchableOpacity
                    ref={btnRef as any}
                    onLayout={() => btnRef.current?.measureInWindow((x, y, w, h) => setBtnPos({ x, y, w, h }))}
                    onPress={() => btnRef.current?.measureInWindow((x, y, w, h) => { setBtnPos({ x, y, w, h }); setMenuOpen(true); })}
                    style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: CARD_BORDER }}
                    activeOpacity={0.85}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Ionicons name="funnel-outline" size={18} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Chip activo (si hay orden aplicado) */}
            {sort.key !== 'none' && (
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setSort(s => (s.key === 'none' ? s : { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))}
                            style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F3E8FF', borderWidth: 1, borderColor: '#E9D5FF' }}
                        >
                            <Ionicons name={sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'} size={20} color={BRAND} style={{ marginRight: 4 }} />
                            <Ionicons name="funnel-outline" size={16} color={BRAND} />
                            <Text style={{ color: BRAND, fontWeight: '800', marginLeft: 6 }}>
                                {sort.key === 'pct' ? 'Orden: % consumido' : sort.key === 'corral' ? 'Orden: Corral' : 'Orden: Crotal'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setSort({ key: 'none', dir: 'asc' })} style={{ marginLeft: 10, padding: 6 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close" size={16} color={BRAND} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                className="px-5 pt-2"
                data={dataSorted}
                keyExtractor={(it) => it.crotal}
                renderItem={Item}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Menú de filtros (anclado al botón) */}
            <Modal visible={menuOpen} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenuOpen(false)}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMenuOpen(false)} />
                    {(() => {
                        const W = Dimensions.get('window').width;
                        const MENU_W = 260;
                        const GAP = 10;
                        const top = Math.max(btnPos.y + btnPos.h, headerBox.y + headerBox.h) + GAP;
                        const left = Math.min(Math.max(btnPos.x + btnPos.w - MENU_W, 12), W - MENU_W - 12);
                        return (
                            <View
                                style={{
                                    position: 'absolute', top, left, width: MENU_W,
                                    backgroundColor: 'white', borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12,
                                    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 12, overflow: 'hidden',
                                }}
                            >
                                <Text style={{ paddingHorizontal: 12, paddingVertical: 10, color: '#64748B', fontWeight: '700' }}>
                                    Filtros
                                </Text>

                                {/* % consumido */}
                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'pct', dir: 'desc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="speedometer-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        % consumido ({sort.key === 'pct' ? (sort.dir === 'asc' ? '↑' : '↓') : '↓'})
                                    </Text>
                                    {sort.key === 'pct' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>

                                {/* Crotal */}
                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'crotal', dir: 'asc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="pricetags-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        Crotal ({sort.key === 'crotal' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'})
                                    </Text>
                                    {sort.key === 'crotal' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>

                                {/* Corral */}
                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'corral', dir: 'asc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="home-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        Corral ({sort.key === 'corral' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'})
                                    </Text>
                                    {sort.key === 'corral' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>

                                {sort.key !== 'none' && (
                                    <TouchableOpacity
                                        onPress={() => { setSort({ key: 'none', dir: 'asc' }); setMenuOpen(false); }}
                                        activeOpacity={0.8}
                                        style={{ paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: CARD_BORDER, flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <Ionicons name="close-circle-outline" size={16} color="#0f172a" style={{ marginRight: 10 }} />
                                        <Text style={{ color: '#0f172a' }}>Quitar filtro</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })()}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
