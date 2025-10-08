// NoAlimentadosScreenMaternidad.tsx (versión grande)
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = {
    crotal: string;   // 15 dígitos
    corral: string;   // ej. C-12
    total: number;
    consumida: number;
    nota?: string;
};

// const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
// const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);
// const fmt = (n: number) => n.toLocaleString('es-ES');

// Barra de progreso “pill” alta con % centrado
const ProgressPill = ({ value, total }: { value: number; total: number }) => {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    const BAR_H = 24;

    return (
        <View style={{ marginTop: 8 }}>
            <Text className="text-slate-500 mb-1">
                {value.toLocaleString('es-ES')} / {total.toLocaleString('es-ES')}
            </Text>

            {/* contenedor de la barra */}
            <View
                style={{
                    height: BAR_H,
                    borderRadius: BAR_H / 2,
                    backgroundColor: '#E5E7EB', // slate-200
                    overflow: 'hidden',
                    position: 'relative',       // <= necesario para centrar el overlay
                }}
            >
                {/* relleno */}
                <View
                    style={{
                        width: `${Math.min(100, Math.max(0, percent))}%`,
                        height: '100%',
                        backgroundColor: '#22C55E',
                        borderRadius: BAR_H / 2,
                    }}
                />

                {/* % centrado en toda la barra */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
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


export default function NoAlimentadosGestacion() {
    const data: Animal[] = [
        { crotal: '123456789012345', corral: '01', total: 2837, consumida: 2000 },
        { crotal: '987654321098765', corral: '02', total: 1500, consumida: 730 },
        { crotal: '555666777888999', corral: '05', total: 2100, consumida: 210 },
        { crotal: '111222333444555', corral: '03', total: 1800, consumida: 1260 },
        { crotal: '999888777666555', corral: '08', total: 2500, consumida: 500, },
        { crotal: '444333222111000', corral: '07', total: 3000, consumida: 1500 },
        { crotal: '222333444555666', corral: '04', total: 2750, consumida: 825, },
        { crotal: '777888999000111', corral: '09', total: 1600, consumida: 400, },
        { crotal: '333444555666777', corral: '10', total: 2200, consumida: 1100 },
        { crotal: '666555444333222', corral: '11', total: 2400, consumida: 600, },
        { crotal: '121212121212121', corral: '12', total: 2000, consumida: 100, },
        { crotal: '343434343434343', corral: '13', total: 1950, consumida: 0, },
        { crotal: '565656565656565', corral: '14', total: 1800, consumida: 50, },
        { crotal: '787878787878787', corral: '15', total: 2200, consumida: 2200, },
        { crotal: '909090909090909', corral: '16', total: 2500, consumida: 1250, },


    ]

    const Item = ({ item }: { item: Animal }) => (
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

            {/* Caja de consumo */}
            <View
                className="mt-3 rounded-xl border p-3"
                style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
                <Text className="text-slate-600">Consumo</Text>
                <ProgressPill value={item.consumida} total={item.total} />
            </View>

            {item.nota ? <Text className="mt-2 text-slate-600">{item.nota}</Text> : null}
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="px-5 pt-4 pb-2 flex-row items-center">
                <Ionicons name="alert-circle-outline" size={20} color="#0f172a" />
                <Text className="ml-2 text-slate-900 text-[18px] font-extrabold">
                    No alimentados · Gestacion
                </Text>
            </View>

            <FlatList
                className="px-5 pt-2"
                data={data}
                keyExtractor={(it) => it.crotal}
                renderItem={Item}
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
