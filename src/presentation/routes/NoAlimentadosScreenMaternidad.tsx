// screens/Maternity/NoAlimentadosScreenMaternidad.tsx
/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Dimensions, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';


type Animal = {
    crotal: string;   // 15 dígitos (puede tener letras)
    corral: string;   // ej. "01" o "C-12"
    total: number;
    consumida: number;
    nota?: string;
    diasSinAlimentar?: number;
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

export default function NoAlimentadosScreenMaternidad() {
    // ── DATA (mock) ─────────────────────────────────────────────────────────
    const data: Animal[] = [
        { crotal: '123456789012345', corral: '01', total: 2837, consumida: 2000, diasSinAlimentar: 2 },
        { crotal: '987654321098765', corral: '02', total: 1500, consumida: 730, diasSinAlimentar: 5 },
        { crotal: '555666777888999', corral: '05', total: 2100, consumida: 210, diasSinAlimentar: 1 },
        { crotal: '111222333444555', corral: '03', total: 1800, consumida: 1260, diasSinAlimentar: 3 },
        { crotal: '999888777666555', corral: '08', total: 2500, consumida: 500, diasSinAlimentar: 4 },
        { crotal: '444333222111000', corral: '07', total: 3000, consumida: 1500, diasSinAlimentar: 3 },
        { crotal: '222333444555666', corral: '04', total: 2750, consumida: 825, diasSinAlimentar: 2 },
        { crotal: '777888999000111', corral: '09', total: 1600, consumida: 400, diasSinAlimentar: 4 },
        { crotal: '333444555666777', corral: '10', total: 2200, consumida: 1100, diasSinAlimentar: 3 },
        { crotal: '666555444333222', corral: '11', total: 2400, consumida: 600, diasSinAlimentar: 1, },
    ];

    const navigation = useNavigation<NavigationProp<any>>();


    // ── ESTADO DE FILTRO/ORDEN ──────────────────────────────────────────────
    // --- tipos de orden ---
    type SortKey = 'dias' | 'corral' | 'pct';   // si no quieres 'pct', puedes quitarlo
    type SortDir = 'asc' | 'desc';

    // por defecto: días ↓
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
        key: 'dias',
        dir: 'desc',
    });

    const [menuOpen, setMenuOpen] = useState(false);
    const isDefaultSort = sort.key === 'dias' && sort.dir === 'desc';


    // Posiciones para anclar el menú
    const [btnPos, setBtnPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const btnRef = useRef<View>(null);
    const [headerBox, setHeaderBox] = useState({ y: 0, h: 0 });

    const dayPillColors = (d: number) => {
        // 0 días: OK (verde), 1–4: aviso (ámbar), 5+: riesgo (rojo)
        if (d >= 1) return { bg: '#FEE2E2', fg: '#7F1D1D' };   // rojo claro
        // if (d >= 1) return { bg: '#FEF3C7', fg: '#92400E' };   // ámbar
        return { bg: '#DCFCE7', fg: '#166534' };                // verde
    };


    // Datos ordenados
    const dataSorted = useMemo(() => {
        const copy = [...data];

        if (sort.key === 'dias') {
            copy.sort((a, b) => {
                const ad = a.diasSinAlimentar ?? 0;
                const bd = b.diasSinAlimentar ?? 0;
                if (ad !== bd) {
                    return sort.dir === 'asc' ? ad - bd : bd - ad; // días primero
                }
                // empate: menos % consumido primero (más crítico)
                return pct(a.consumida, a.total) - pct(b.consumida, b.total);
            });
        } else if (sort.key === 'pct') {
            copy.sort((a, b) =>
                sort.dir === 'asc'
                    ? pct(a.consumida, a.total) - pct(b.consumida, b.total)
                    : pct(b.consumida, b.total) - pct(a.consumida, a.total)
            );
        } else if (sort.key === 'corral') {
            copy.sort((a, b) =>
                sort.dir === 'asc'
                    ? a.corral.localeCompare(b.corral, 'es', { numeric: true })
                    : b.corral.localeCompare(a.corral, 'es', { numeric: true })
            );
        }

        return copy;
    }, [data, sort]);

    const ORDER_LABEL: Record<SortKey, string> = {
        dias: 'Orden: Días sin alimentar',
        pct: 'Orden: % consumido',
        corral: 'Orden: Corral',
    };

    const openAnimal = (item: Animal) => {
        const mockData = {
            animal: {
                // Lo importante para que el detalle pinte bien:
                crotal: item.crotal,
                corral: item.corral,                  // preserva “03” si viene con cero
                consumo: { objetivo: item.total, actual: item.consumida },

                // Relleno opcional (el detalle mostrará “—” si faltan):
                subEstado: 'LACTANCIA',
                curva: '—',
                correccion: '—',
                fechas: { entrada: '—', parto: '—' },
                nave: '—',
                ciclo: undefined,
                dia: undefined,
            },
            deviceError: false,
            diasSinAlimentar: false,
            statusMessage: '',
        };

        navigation.navigate('MAT-CORRALDETAIL', {
            corralId: Number(item.corral) || item.corral, // para el título/uso interno
            mockData,
            deviceError: mockData.deviceError,
            diasSinAlimentar: mockData.diasSinAlimentar,
            statusMessage: mockData.statusMessage,
        });
    };

    const Item = ({ item }: { item: Animal }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => openAnimal(item)}>
            <View
                className="rounded-2xl p-4 bg-white border border-slate-200 mb-3"
                style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                }}
            >
                {/* Cabecera: crotal + chip corral */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <Ionicons name="pricetag-outline" size={18} color="#0f172a" />
                        <Text className="ml-2 text-slate-900 font-semibold">{item.crotal}</Text>
                    </View>
                    <View className="px-3 py-1 rounded-full bg-slate-100">
                        <Text className="text-slate-700 font-medium">Corral {item.corral}</Text>
                    </View>
                </View>

                {/* Consumo (con chip de días a la derecha) */}
                <View className="mt-3 rounded-xl border p-3" style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text className="text-slate-600" style={{ flex: 1 }}>Consumo</Text>

                        {typeof item.diasSinAlimentar === 'number' && (() => {
                            const { bg, fg } = dayPillColors(item.diasSinAlimentar);
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

                    {/* Barra + números */}
                    <ProgressPill value={item.consumida} total={item.total} />
                </View>

                {item.nota ? <Text className="mt-2 text-slate-600">{item.nota}</Text> : null}
            </View>
        </TouchableOpacity>
    );


    // ── UI ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header con embudo */}
            <View
                onLayout={(e) => setHeaderBox({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 6,     // aire arriba
                    paddingBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="alert-circle-outline" size={20} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                        No alimentados · Maternidad
                    </Text>
                </View>

                <TouchableOpacity
                    ref={btnRef as any}
                    onLayout={() => btnRef.current?.measureInWindow((x, y, w, h) => setBtnPos({ x, y, w, h }))}
                    onPress={() => {
                        // medimos y abrimos *después* de tener la medida
                        btnRef.current?.measureInWindow((x, y, w, h) => {
                            setBtnPos({ x, y, w, h });
                            setMenuOpen(true);
                        });
                    }}
                    style={{
                        width: 36, height: 36, borderRadius: 10, backgroundColor: 'white',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: CARD_BORDER,
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    activeOpacity={0.85}
                >
                    <Ionicons name="funnel-outline" size={18} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Chip de orden activo con toggle ASC/DSC */}
            {/* Chip de orden activo con toggle ASC/DESC */}
            {sort.key && (
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        {/* Chip con el orden actual; toca para alternar asc/desc */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                setSort(s => ({ ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))
                            }
                            style={{
                                alignSelf: 'flex-start',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 999,
                                backgroundColor: '#F3E8FF',
                                borderWidth: 1,
                                borderColor: '#E9D5FF',
                            }}
                        >
                            <Ionicons
                                name={sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'}
                                size={20}
                                color={BRAND}
                                style={{ marginRight: 4 }}
                            />
                            <Ionicons name="funnel-outline" size={16} color={BRAND} />
                            <Text style={{ color: BRAND, fontWeight: '800', marginLeft: 6 }}>
                                {ORDER_LABEL[sort.key]}
                            </Text>
                        </TouchableOpacity>

                        {/* Solo mostrar la X cuando NO es el orden por defecto */}
                        {!isDefaultSort && (
                            <TouchableOpacity
                                onPress={() => setSort({ key: 'dias', dir: 'desc' })} // volver al default
                                style={{ marginLeft: 10, padding: 6 }}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={16} color={BRAND} />
                            </TouchableOpacity>
                        )}
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

            {/* Menú flotante de filtros anclado al botón */}
            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setMenuOpen(false)}
            >
                <View style={{ flex: 1 }}>
                    {/* Clic fuera para cerrar */}
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMenuOpen(false)} />

                    {(() => {
                        const W = Dimensions.get('window').width;
                        const MENU_W = 260;
                        const GAP = 10;

                        // Debajo del botón; si por lo que sea el botón mide raro,
                        // cae al menos debajo del header.
                        const top = Math.max(btnPos.y + btnPos.h, headerBox.y + headerBox.h) + GAP;

                        // Alinear a la derecha del botón, sin salir de pantalla.
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

                                {/* DÍAS SIN ALIMENTAR (default) */}
                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'dias', dir: 'desc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="time-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        Días sin alimentar {sort.key === 'dias' ? (sort.dir === 'asc' ? '↑' : '↓') : '↓'}
                                    </Text>
                                    {sort.key === 'dias' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => { setSort({ key: 'corral', dir: 'asc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="home-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        Corral {sort.key === 'corral' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'}
                                    </Text>
                                    {sort.key === 'corral' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity>
                                {/* <TouchableOpacity
                                    onPress={() => { setSort({ key: 'corral', dir: 'asc' }); setMenuOpen(false); }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="home-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a', flex: 1 }}>
                                        Corral ({sort.key === 'corral' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'})
                                    </Text>
                                    {sort.key === 'corral' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                                </TouchableOpacity> */}

                                {/* {sort.key !== 'none' && (
                                    <TouchableOpacity
                                        onPress={() => { setSort({ key: 'none', dir: 'asc' }); setMenuOpen(false); }}
                                        activeOpacity={0.8}
                                        style={{ paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: CARD_BORDER, flexDirection: 'row', alignItems: 'center' }}
                                    >
                                        <Ionicons name="close-circle-outline" size={16} color="#0f172a" style={{ marginRight: 10 }} />
                                        <Text style={{ color: '#0f172a' }}>Quitar filtro</Text>
                                    </TouchableOpacity>
                                )} */}
                            </View>
                        );
                    })()}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
