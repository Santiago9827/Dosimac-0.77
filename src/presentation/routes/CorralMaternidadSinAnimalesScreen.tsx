import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

type RouteParams = {
    corral?: string | number;
    stats?: { total?: number; noFeed?: number };
};

const CARD_BORDER = '#E2E8F0';
const DOT_RED = '#EF4444';

const Progress = ({ percent, height = 18 }: { percent: number; height?: number }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <View style={{ height, borderRadius: height / 2, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <View style={{ width: `${p}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: height / 2 }} />
            <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: Math.max(12, Math.round(height * 0.6)) }}>{p}%</Text>
            </View>
        </View>
    );
};

export default function CorralMaternidadSinAnimalesScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { corral, stats }: RouteParams = route.params ?? {};

    // Si no llegan stats, dejamos todo a 0
    const { total, noFeed, pct } = useMemo(() => {
        const total = Number(stats?.total ?? 0);
        const noFeed = Number(stats?.noFeed ?? 0);
        const pct = total > 0 ? Math.round(((total - noFeed) / total) * 100) : 0;
        return { total, noFeed, pct };
    }, [stats]);

    return (
        <View className="flex-1 bg-slate-50" style={{ padding: 20 }}>
            {/* Card estilo "Resumen por corral" */}
            <View
                className="rounded-2xl border p-4 bg-white"
                style={{ borderColor: CARD_BORDER }}
            >
                {/* Cabecera*/}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="home-outline" size={18} color="#0f172a" />
                        <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                            {String(corral ?? '—')}
                        </Text>
                    </View>
                    {/* (estado) */}
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: DOT_RED }} />
                </View>

                {/* Animales */}
                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>Animales</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{total}</Text>
                </View>

                {/* No alimentados */}
                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>No alimentados</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{noFeed}</Text>
                </View>

                {/* % alimentado con barra */}
                <View style={{ paddingTop: 8 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>% alimentado</Text>
                    <Progress percent={pct} />
                </View>
            </View>

            {/* Mensaje contextual cuando total=0 */}
            {/* {total === 0 && (
                // <View
                //     className="rounded-2xl border p-4 mt-3 bg-white"
                //     style={{ borderColor: CARD_BORDER }}
                // >
                //     <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16, marginBottom: 4 }}>
                //         Corral {String(corral ?? '—')}
                //     </Text>
                //     <Text style={{ color: '#64748B' }}>Este corral no tiene animales registrados.</Text>
                // </View>
            )} */}

            {/* Botones */}
            <View style={{ marginTop: 16, gap: 12 }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('MAT-ADD-ANIMALS', { corral } as never)}
                    style={{
                        backgroundColor: '#4F46E5',
                        borderRadius: 12,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOpacity: 0.16,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 3,
                    }}
                    activeOpacity={0.9}
                >
                    <Text className="text-white font-semibold">Meter animales</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: '#E5E7EB',
                        borderRadius: 12,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    activeOpacity={0.9}
                >
                    <Text className="text-slate-900 font-semibold">Volver</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
