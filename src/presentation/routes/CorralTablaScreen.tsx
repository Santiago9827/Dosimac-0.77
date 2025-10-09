// screens/Gestation/CorralTablaScreen.tsx
import React, { useMemo, useRef } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = { corral: string; total: number; consumida: number };
type Row = {
    corral: string; animales: number; noAlimentados: number;
    total: number; consumida: number; pct: number; ceColor: string;
};

const SEP = '#E2E8F0';
const DOT = '#64748B';

// anchos
const W_LEFT = 140;  // columna fija "Corral"
const W_COL = 100;  // Animales / No alim
const W_PCT = 160;  // % alimentado
const W_CE = 44;   // CE
const ROW_H = 48;
const HEAD_H = 52;      // alto del header (más grande)
const HEAD_FS = 14;     // tamaño de letra del header


const HeaderCell = ({
    w,
    center,
    children,
}: {
    w: number;
    center?: boolean;
    children: React.ReactNode;
}) => (
    <View
        style={{
            width: w,
            height: HEAD_H,              // ← alto grande del header
            justifyContent: 'center',    // ← centra vertical
            paddingHorizontal: 10,
        }}
    >
        <Text
            style={{
                color: '#0f172a',
                fontWeight: '800',
                fontSize: HEAD_FS,         // ← texto más grande
                textAlign: center ? 'center' : 'left', // ← centrado opcional
            }}
            numberOfLines={1}
        >
            {children}
        </Text>
    </View>
);

const CellText = ({ w, center, strong, children }: { w: number; center?: boolean; strong?: boolean; children: React.ReactNode }) => (
    <View style={{ width: w, paddingHorizontal: 10, alignItems: center ? 'center' : 'flex-start' }}>
        <Text style={{ color: '#0f172a', fontWeight: strong ? '700' : '500', fontVariant: ['tabular-nums'] }} numberOfLines={1}>
            {children}
        </Text>
    </View>
);

const VSep = () => <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: SEP }} />;

const CEDot = ({ color = DOT }) => (
    <View style={{ width: W_CE, alignItems: 'center' }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
    </View>
);

// arriba: import { StyleSheet } from 'react-native';

const clampPct = (n?: number) =>
    Math.max(0, Math.min(100, Math.round(Number.isFinite(n as number) ? (n as number) : 0)));

const Progress = ({
    percent,
    width,
    height = 18,
}: {
    percent: number;
    width: number;
    height?: number;
}) => {
    const p = clampPct(percent);
    return (
        <View
            style={{
                width,                 // <- ancho numérico, sin '100%'
                height,
                borderRadius: height / 2,
                backgroundColor: '#E5E7EB',
                overflow: 'hidden',
            }}
        >
            <View
                style={{
                    width: `${p}%`,
                    height: '100%',
                    backgroundColor: '#22C55E',
                    borderRadius: height / 2,
                }}
            />
            <View
                style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}
            >
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: 12 }}>{p}%</Text>
            </View>
        </View>
    );
};


export default function CorralTablaScreen() {
    // demo
    const animals: Animal[] = [
        { corral: '01', total: 2837, consumida: 2000 },
        { corral: '01', total: 1400, consumida: 900 },
        { corral: '02', total: 1500, consumida: 730 },
        { corral: '05', total: 2100, consumida: 0 },
        { corral: '03', total: 1800, consumida: 1260 },
        { corral: '03', total: 800, consumida: 640 },
    ];

    const rows: Row[] = useMemo(() => {
        const map = new Map<string, Row>();
        animals.forEach(a => {
            const r = map.get(a.corral) ?? { corral: a.corral, animales: 0, noAlimentados: 0, total: 0, consumida: 0, pct: 0, ceColor: DOT };
            r.animales += 1;
            r.total += a.total;
            r.consumida += a.consumida;
            if (a.consumida === 0) r.noAlimentados += 1;
            map.set(a.corral, r);
        });
        const out = Array.from(map.values()).map(r => ({ ...r, pct: r.total > 0 ? (r.consumida / r.total) * 100 : 0 }));
        out.sort((a, b) => a.corral.localeCompare(b.corral, undefined, { numeric: true }));
        return out;
    }, [animals]);

    // refs para sincronizar header ⇄ body
    const headerRightRef = useRef<ScrollView>(null);
    const bodyRightRef = useRef<ScrollView>(null);

    const onBodyHScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        headerRightRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Resumen por corral</Text>
                <Text style={{ color: '#64748B', marginTop: 4 }}>Animales y porcentaje alimentado total por corral.</Text>
            </View>

            <View style={{ marginHorizontal: 20, marginTop: 12, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' }}>
                {/* HEADER */}
                <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                    {/* izquierda fija */}
                    <HeaderCell w={W_LEFT} center>Corral</HeaderCell>
                    <VSep />
                    {/* derecha sincronizada */}
                    <ScrollView
                        ref={headerRightRef}
                        horizontal
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <HeaderCell w={W_COL} center>Animales</HeaderCell>
                            <VSep />
                            <HeaderCell w={W_COL} center>No alim.</HeaderCell>
                            <VSep />
                            <HeaderCell w={W_PCT} center>% alimentado</HeaderCell>
                            <VSep />
                            <HeaderCell w={W_CE} center>CE</HeaderCell>
                        </View>
                    </ScrollView>
                </View>

                {/* BODY: vertical + **UN** horizontal para TODAS las filas */}
                <ScrollView showsVerticalScrollIndicator>
                    <View style={{ flexDirection: 'row' }}>
                        {/* Columna izquierda fija (todas las filas) */}
                        <View style={{ width: W_LEFT }}>
                            {rows.map((r, idx) => (
                                <View
                                    key={`L-${r.corral}`}
                                    style={{
                                        height: ROW_H,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 10,
                                        backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                        borderBottomWidth: idx === rows.length - 1 ? 0 : 1,
                                        borderBottomColor: SEP,
                                    }}
                                >
                                    <Ionicons name="home-outline" size={16} color="#0f172a" />
                                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '600' }} numberOfLines={1}>
                                        {`Corral ${r.corral}`}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <VSep />

                        {/* Derecha: **UN** ScrollView horizontal con TODAS las filas */}
                        <ScrollView
                            ref={bodyRightRef}
                            horizontal
                            onScroll={onBodyHScroll}
                            scrollEventThrottle={16}
                            showsHorizontalScrollIndicator
                        >
                            <View>
                                {rows.map((r, idx) => (
                                    <View
                                        key={`R-${r.corral}`}
                                        style={{
                                            height: ROW_H,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                            borderBottomWidth: idx === rows.length - 1 ? 0 : 1,
                                            borderBottomColor: SEP,
                                        }}
                                    >
                                        <CellText w={W_COL} center strong>{r.animales}</CellText>
                                        <VSep />
                                        <CellText w={W_COL} center>{r.noAlimentados}</CellText>
                                        <VSep />
                                        <View style={{ width: W_PCT, overflow: 'hidden' }}>
                                            <View style={{ marginHorizontal: 8 }}>
                                                {/* restamos el padding horizontal (8 + 8) */}
                                                <Progress percent={r.pct ?? 0} width={W_PCT - 16} />
                                            </View>
                                        </View>

                                        <VSep />
                                        <View style={{ width: W_CE, alignItems: 'center' }}>
                                            <CEDot color={r.ceColor} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
