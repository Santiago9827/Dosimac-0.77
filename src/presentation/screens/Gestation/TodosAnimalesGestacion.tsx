/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Dimensions, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type Animal = { crotal: string; corral: string; total: number; consumida: number; };

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

export default function TodosAnimalesGestacion() {
    const navigation = useNavigation<NavigationProp<any>>();

    // Mock
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

    // Orden (opcional; igual que tu versión)
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
                subEstado: '—', curva: '—', correccion: '—',
                fechas: { entrada: '—', parto: '—' }, nave: '—',
            },
            deviceError: false, diasSinAlimentar: false, statusMessage: '',
        };

        navigation.navigate('GET-ANIMAL-DETAIL', {
            corralId: Number(item.corral) || item.corral,
            mockData,
            deviceError: mockData.deviceError,
            diasSinAlimentar: mockData.diasSinAlimentar,
            statusMessage: mockData.statusMessage,
        });
    };


    const Item = ({ item }: { item: Animal }) => (
        <TouchableOpacity activeOpacity={0.85} onPress={() => openAnimal(item)}>
            <View className="rounded-2xl p-4 bg-white border border-slate-200 mb-3" style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 }}>
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="list-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                        Todos los animales · Gestación
                    </Text>
                </View>
            </View>

            <FlatList
                className="px-5 pt-2"
                data={dataSorted}
                keyExtractor={(it) => it.crotal}
                renderItem={Item}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}
