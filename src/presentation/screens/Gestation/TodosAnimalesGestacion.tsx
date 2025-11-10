/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type Animal = { crotal: string; corral: string; total: number; consumida: number; };

const CARD_BORDER = '#E2E8F0';
const BG = '#F8FAFC';

// Paleta igual que Maternidad
const PALETTE = {
    cobaltWave: {
        bg: '#1E40AF',     // azul base
        accent: '#3B82F6', // azul acento
        text: '#EAF2FF',   // texto sobre azul
    },
} as const;

const t = PALETTE.cobaltWave;
const MAX_W = 850;
const PAGE_PX = 24;

// helpers
const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

// barra con % centrado (igual que Maternidad)
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

export default function TodosAnimalesGestacion() {
    const navigation = useNavigation<NavigationProp<any>>();

    // Mock (igual estructura)
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

    // Orden (mantenemos por si luego añades chip)
    type SortKey = 'none' | 'pct' | 'crotal' | 'corral';
    type SortDir = 'asc' | 'desc';
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'none', dir: 'asc' });

    const dataSorted = useMemo(() => {
        const copy = [...data];
        const dir = sort.dir === 'asc' ? 1 : -1;
        if (sort.key === 'pct') copy.sort((a, b) => dir * (pct(a.consumida, a.total) - pct(b.consumida, b.total)));
        else if (sort.key === 'crotal') copy.sort((a, b) => dir * a.crotal.localeCompare(b.crotal, 'es'));
        else if (sort.key === 'corral') copy.sort((a, b) => dir * a.corral.localeCompare(b.corral, 'es', { numeric: true }));
        return copy;
    }, [data, sort]);

    const openAnimal = (item: Animal) => {
        const mockData = {
            animal: {
                crotal: item.crotal,
                corral: item.corral,
                consumo: { objetivo: item.total, actual: item.consumida },
                subEstado: 'GESTACIÓN',
                curva: '—',
                correccion: '—',
                fechas: { entrada: '—', parto: '—' },
                nave: '—',
            },
            deviceError: false,
            diasSinAlimentar: false,
            statusMessage: '',
        };

        navigation.navigate('GET-ANIMAL-DETAIL', {
            corralId: Number(item.corral) || item.corral,
            mockData,
            deviceError: mockData.deviceError,
            diasSinAlimentar: mockData.diasSinAlimentar,
            statusMessage: mockData.statusMessage,
        });
    };

    // Item con header azul (igual que Maternidad)
    const Item = ({ item }: { item: Animal }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => openAnimal(item)}>
            <View
                style={{
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: CARD_BORDER,
                    marginBottom: 16,
                    overflow: 'hidden', // importante para redondear el header
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                }}
            >
                {/* HEADER AZUL (cobaltWave) */}
                <View
                    style={{
                        backgroundColor: t.bg,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(0,0,0,0.06)',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        {/* Chip Crotal */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: 'rgba(255,255,255,0.14)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.40)',
                            }}
                        >
                            <Ionicons name="pricetag-outline" size={14} color={t.text} />
                            <Text style={{ marginLeft: 6, color: t.text, fontWeight: '700' }}>
                                Crotal {item.crotal}
                            </Text>
                        </View>

                        {/* Chip Corral */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                                borderRadius: 999,
                                backgroundColor: 'rgba(255,255,255,0.14)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.40)',
                            }}
                        >
                            <Ionicons name="home-outline" size={14} color={t.text} />
                            <Text style={{ marginLeft: 6, color: t.text, fontWeight: '700' }}>
                                Corral {item.corral}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CUERPO */}
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
                        <Text style={{ color: '#475569', marginBottom: 4 }}>Consumo</Text>
                        <ProgressPill value={item.consumida} total={item.total} />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: BG }}>
            {/* Header centrado igual que Maternidad */}
            <View style={{ alignItems: 'center', paddingHorizontal: PAGE_PX, paddingTop: 18, paddingBottom: 12 }}>
                <View style={{ width: '100%', maxWidth: MAX_W, alignItems: 'center', marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="list-outline" size={24} color="#0f172a" />
                        <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 18, color: '#0f172a', textAlign: 'center' }}>
                            Todos los animales · Gestación
                        </Text>
                    </View>
                </View>
            </View>

            {/* Scroll + columna centrada */}
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 60,
                    alignItems: 'center',
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: '100%', maxWidth: MAX_W }}>
                    {dataSorted.map((item) => (
                        <Item key={item.crotal} item={item} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
