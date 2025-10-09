// screens/Gestation/CorralGridScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = { corral: string; total: number; consumida: number };
type Row = { corral: string; animales: number; noAlimentados: number; pct: number; ceColor: string };

const DOT = '#64748B';
const CARD_GAP = 12;           // ⬅️ separación entre tarjetas
const CARD_BORDER = '#E2E8F0';
const CARD_BG = 'white';

const ROW_LABEL: any = { color: '#64748B', fontSize: 13 };
const ROW_VALUE: any = { color: '#0f172a', fontWeight: '800', fontSize: 18, fontVariant: ['tabular-nums'], minWidth: 24, textAlign: 'right' };
const HR: any = { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8, opacity: 0.9 };

const Progress = ({ percent }: { percent: number }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <View style={{ height: 18, borderRadius: 9, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <View style={{ width: `${p}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: 9 }} />
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: 12 }}>{p}%</Text>
            </View>
        </View>
    );
};

export default function CorralGridScreen() {
    // Demo
    const animals: Animal[] = [
        { corral: '01', total: 2837, consumida: 2000 },
        { corral: '01', total: 1400, consumida: 900 },
        { corral: '02', total: 1500, consumida: 730 },
        { corral: '05', total: 2100, consumida: 0 },
        { corral: '03', total: 1800, consumida: 1260 },
        { corral: '03', total: 800, consumida: 640 },
        { corral: '04', total: 1200, consumida: 0 },
        { corral: '08', total: 2500, consumida: 500 },
        { corral: '07', total: 3000, consumida: 1500 },
        { corral: '04', total: 1550, consumida: 825 },
        { corral: '06', total: 2000, consumida: 2000 },
        { corral: '06', total: 1800, consumida: 900 },
        { corral: '09', total: 2200, consumida: 1100 },
        { corral: '09', total: 1600, consumida: 400 },
        { corral: '10', total: 2200, consumida: 1100 },
        { corral: '10', total: 1300, consumida: 650 },
        { corral: '11', total: 900, consumida: 0 },
        { corral: '11', total: 2400, consumida: 600 },
        { corral: '12', total: 2000, consumida: 100 },
        { corral: '12', total: 1800, consumida: 900 },
        { corral: '12', total: 1600, consumida: 800 },
        { corral: '13', total: 2100, consumida: 2100 },
        { corral: '01', total: 2837, consumida: 2000 },
        { corral: '01', total: 1400, consumida: 900 },
        { corral: '02', total: 1500, consumida: 730 },
        { corral: '05', total: 2100, consumida: 0 },
        { corral: '03', total: 1800, consumida: 1260 },
        { corral: '03', total: 800, consumida: 640 },
        { corral: '04', total: 1200, consumida: 0 },
        { corral: '08', total: 2500, consumida: 500 },
        { corral: '07', total: 3000, consumida: 1500 },
        { corral: '04', total: 1550, consumida: 825 },
        { corral: '06', total: 2000, consumida: 2000 },
        { corral: '06', total: 1800, consumida: 900 },
        { corral: '09', total: 2200, consumida: 1100 },
        { corral: '09', total: 1600, consumida: 400 },
        { corral: '10', total: 2200, consumida: 1100 },
        { corral: '10', total: 1300, consumida: 650 },
        { corral: '11', total: 900, consumida: 0 },
        { corral: '11', total: 2400, consumida: 600 },
        { corral: '12', total: 2000, consumida: 100 },
        { corral: '12', total: 1800, consumida: 900 },
        { corral: '12', total: 1600, consumida: 800 },
        { corral: '13', total: 2100, consumida: 2100 },
        { corral: '14', total: 1950, consumida: 2000 },
        { corral: '15', total: 1800, consumida: 50 },
        { corral: '16', total: 2200, consumida: 2200 },
        { corral: '17', total: 2500, consumida: 1250 },
        { corral: '18', total: 2750, consumida: 825 },
        { corral: '19', total: 3000, consumida: 1500 },
        { corral: '20', total: 1600, consumida: 400 },
        { corral: '21', total: 2400, consumida: 600 },
        { corral: '22', total: 2100, consumida: 2100 },
        { corral: '23', total: 1950, consumida: 2000 },
        { corral: '24', total: 1800, consumida: 50 },
        { corral: '25', total: 2200, consumida: 2200 },
        { corral: '26', total: 2500, consumida: 1250 },
        { corral: '27', total: 2750, consumida: 825 },
        { corral: '28', total: 3000, consumida: 1500 },
        { corral: '29', total: 1600, consumida: 400 },
        { corral: '30', total: 2400, consumida: 600 },
        { corral: '31', total: 2100, consumida: 2100 },
        { corral: '32', total: 1950, consumida: 2000 },
        { corral: '33', total: 1800, consumida: 50 },
        { corral: '34', total: 2200, consumida: 2200 },
        { corral: '35', total: 2500, consumida: 1250 },
        { corral: '36', total: 2750, consumida: 825 },
        { corral: '37', total: 3000, consumida: 1500 },
        { corral: '38', total: 1600, consumida: 400 },
        { corral: '39', total: 2400, consumida: 600 },
        { corral: '40', total: 2100, consumida: 2100 },
        { corral: '41', total: 1950, consumida: 2000 },
        { corral: '42', total: 1800, consumida: 50 },
        { corral: '43', total: 2200, consumida: 2200 },
        { corral: '44', total: 2500, consumida: 1250 },
        { corral: '45', total: 2750, consumida: 825 },
        { corral: '46', total: 3000, consumida: 1500 },
        { corral: '47', total: 1600, consumida: 400 },
        { corral: '48', total: 2400, consumida: 600 },
        { corral: '49', total: 2100, consumida: 2100 },
        { corral: '50', total: 1950, consumida: 2000 },
        { corral: '51', total: 1800, consumida: 50 },
        { corral: '52', total: 2200, consumida: 2200 },
        { corral: '53', total: 2500, consumida: 1250 },
        { corral: '54', total: 2750, consumida: 825 },
        { corral: '55', total: 3000, consumida: 1500 },
        { corral: '56', total: 1600, consumida: 400 },
        { corral: '57', total: 2400, consumida: 600 },
        { corral: '58', total: 2100, consumida: 2100 },
        { corral: '59', total: 1950, consumida: 2000 },
        { corral: '60', total: 1800, consumida: 50 },
        { corral: '61', total: 2200, consumida: 2200 },
        { corral: '62', total: 2500, consumida: 1250 },
        { corral: '63', total: 2750, consumida: 825 },
        { corral: '64', total: 3000, consumida: 1500 },
        { corral: '65', total: 1600, consumida: 400 },
        { corral: '66', total: 2400, consumida: 600 },
        { corral: '67', total: 2100, consumida: 2100 },
        { corral: '68', total: 1950, consumida: 2000 },
        { corral: '69', total: 1800, consumida: 50 },
        { corral: '70', total: 2200, consumida: 2200 },
        { corral: '71', total: 2500, consumida: 1250 },
        { corral: '72', total: 2750, consumida: 825 },
        { corral: '73', total: 3000, consumida: 1500 },
        { corral: '74', total: 1600, consumida: 400 },
        { corral: '75', total: 2400, consumida: 600 },
        { corral: '76', total: 2100, consumida: 2100 },
        { corral: '77', total: 1950, consumida: 2000 },
        { corral: '78', total: 1800, consumida: 50 },
        { corral: '79', total: 2200, consumida: 2200 },
        { corral: '80', total: 2500, consumida: 1250 },
        { corral: '81', total: 2750, consumida: 825 },
        { corral: '82', total: 3000, consumida: 1500 },
        { corral: '83', total: 1600, consumida: 400 },
    ];
    const [query, setQuery] = useState('');

    const rows = useMemo<Row[]>(() => {
        const map = new Map<string, Row>();
        for (const a of animals) {
            const r = map.get(a.corral) ?? { corral: a.corral, animales: 0, noAlimentados: 0, pct: 0, ceColor: DOT };
            r.animales += 1;
            if (a.consumida === 0) r.noAlimentados += 1;
            // acumular para % (usamos suma simple)
            const prevTotal = (r as any)._t ?? 0;
            const prevCons = (r as any)._c ?? 0;
            (r as any)._t = prevTotal + a.total;
            (r as any)._c = prevCons + a.consumida;
            map.set(a.corral, r);
        }
        const out = Array.from(map.values()).map(r => {
            const t = (r as any)._t ?? 0;
            const c = (r as any)._c ?? 0;
            return { ...r, pct: t > 0 ? (c / t) * 100 : 0 };
        });
        out.sort((a, b) => a.corral.localeCompare(b.corral, undefined, { numeric: true }));
        return out;
    }, [animals]);

    const filtered = useMemo(
        () => rows.filter(r => r.corral.includes(query.trim())),
        [rows, query]
    );

    const renderItem = ({ item }: { item: Row }) => (
        <View
            style={{
                flex: 1,
                borderWidth: 1,
                borderColor: CARD_BORDER,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: 14,
                // ⬇️ hueco vertical entre tarjetas
                marginBottom: CARD_GAP,
                // sombra ligera
                shadowColor: '#000',
                shadowOpacity: 0.07,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 1,
            }}
        >
            {/* Cabecera */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="home-outline" size={16} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '800', fontSize: 18 }}>{item.corral}</Text>
                </View>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: DOT, opacity: 0.95 }} />
            </View>

            {/* Métricas: Animales | No alimentados */}
            <View style={{ marginTop: 10 }}>
                {/* Fila: Animales */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={ROW_LABEL}>Animales</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={ROW_VALUE}>{item.animales}</Text>
                </View>

                <View style={HR} />

                {/* Fila: No alimentados */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={ROW_LABEL}>No alimentados</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={ROW_VALUE}>{item.noAlimentados}</Text>
                </View>
            </View>

            {/* % alimentado */}
            <Text style={{ color: '#64748B', marginTop: 12, marginBottom: 6, fontSize: 13 }}>% alimentado</Text>
            <Progress percent={item.pct} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Título + buscador */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                <Text style={{ color: '#0f172a', fontSize: 22, fontWeight: '900' }}>Resumen por corral</Text>

                {/* Buscador */}
                <View
                    style={{
                        marginTop: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        height: 46,
                    }}
                >
                    <Ionicons name="search-outline" size={18} color="#64748B" />
                    <TextInput
                        style={{ flex: 1, marginLeft: 8, color: '#0f172a' }}
                        placeholder="Buscar corral (ej. 10)"
                        placeholderTextColor="#94A3B8"
                        value={query}
                        onChangeText={setQuery}
                    />
                    {!!query && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Grid */}
            <FlatList
                data={filtered}
                keyExtractor={(it) => it.corral}
                numColumns={2}
                renderItem={renderItem}
                // ⬇️ padding alrededor y separación horizontal entre columnas
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
                columnWrapperStyle={{ gap: CARD_GAP }}   // ⬅️ más separación entre columnas
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
