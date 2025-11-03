// screens/Maternity/TodosAnimalesMaternidad.tsx
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Animal = {
    crotal: string;
    corral: string;
    total: number;
    consumida: number;
};

const BRAND = '#3F0BAE';
const CARD_BORDER = '#E2E8F0';
const BG = '#F8FAFC';

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

export default function TodosAnimalesMaternidad() {
    const navigation = useNavigation<NavigationProp<any>>();
    const { width } = useWindowDimensions();

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

    const [sort, setSort] = useState<{ key: 'none' | 'pct' | 'crotal' | 'corral'; dir: 'asc' | 'desc' }>({
        key: 'none',
        dir: 'asc',
    });

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
                    padding: 16,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 1,
                }}
            >
                {/* Crotal + Corral */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="pricetag-outline" size={18} color="#0f172a" />
                        <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '600' }}>{item.crotal}</Text>
                    </View>
                    <View style={{ backgroundColor: '#F1F5F9', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                        <Text style={{ color: '#475569', fontWeight: '500' }}>Corral {item.corral}</Text>
                    </View>
                </View>

                {/* Consumo */}
                <View
                    style={{
                        marginTop: 12,
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
        </TouchableOpacity>
    );

    return (
        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: BG }}>
            {/* Header */}
            <View
                style={{
                    paddingHorizontal: 20,
                    paddingTop: 10,
                    paddingBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="list-outline" size={20} color="#0f172a" />
                    <Text style={{ marginLeft: 8, fontWeight: '800', fontSize: 18, color: '#0f172a' }}>
                        Todos los animales · Maternidad
                    </Text>
                </View>
            </View>

            {/* Scroll vertical centrado */}
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
        </SafeAreaView>
    );
}
