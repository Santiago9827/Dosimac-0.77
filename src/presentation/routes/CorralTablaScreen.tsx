// screens/Gestation/CorralTablaScreen.tsx
import React, { useMemo, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Animal = { corral: string; total: number; consumida: number };
type Row = {
    corral: string;
    animales: number;
    noAlimentados: number;
    total: number;
    consumida: number;
    pct: number;
    ceColor: string;
};

const SEP = '#E2E8F0';
const DOT = '#64748B';

// === Escala global de la tabla ===
const SCALE = 1.12;

// Anchos de columnas
const W_LEFT = Math.round(100 * SCALE);
const W_COL = Math.round(100 * SCALE);
const W_PCT = Math.round(160 * SCALE);
const W_CE = Math.round(44 * SCALE);

// Alturas
const ROW_H = Math.round(48 * SCALE);
const HEAD_H = Math.round(50 * SCALE);

// Tipografías
const HEAD_FS = Math.round(14 * SCALE);
const ROW_FS = Math.round(14 * SCALE);

// Espaciado interno horizontal
const PADX = Math.round(10 * SCALE);

// Altura de la barra de progreso
const PROG_H = Math.round(18 * SCALE);

// ⬇️ NUEVO: cuántas filas visibles antes de activar scroll vertical
const BODY_MAX_VISIBLE_ROWS = 11;
const TABLE_BODY_MAX_H = BODY_MAX_VISIBLE_ROWS * ROW_H;

const HeaderCell = ({ w, center, children }: { w: number; center?: boolean; children: React.ReactNode }) => (
    <View style={{ width: w, paddingHorizontal: PADX, height: HEAD_H, justifyContent: 'center' }}>
        <Text
            style={{ color: '#334155', fontWeight: '700', fontSize: HEAD_FS, textAlign: center ? 'center' : 'left' }}
            numberOfLines={1}
        >
            {children}
        </Text>
    </View>
);

const CellText = ({ w, center, strong, children }: { w: number; center?: boolean; strong?: boolean; children: React.ReactNode }) => (
    <View style={{ width: w, paddingHorizontal: PADX, alignItems: center ? 'center' : 'flex-start' }}>
        <Text
            style={{ color: '#0f172a', fontWeight: strong ? '700' : '500', fontVariant: ['tabular-nums'], fontSize: ROW_FS }}
            numberOfLines={1}
        >
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

const Progress = ({ percent, height = PROG_H }: { percent: number; height?: number }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <View style={{ width: '100%', height, borderRadius: height / 2, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <View style={{ width: `${p}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: height / 2 }} />
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: Math.max(12, Math.round(height * 0.6)) }}>
                    {p}%
                </Text>
            </View>
        </View>
    );
};

export default function CorralTablaScreen() {
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

    // sync scroll horizontal
    const headerRightRef = useRef<ScrollView>(null);
    const bodyRightRef = useRef<ScrollView>(null);
    const onBodyHScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        headerRightRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Título */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '800' }}>Resumen por corral</Text>
                {/* <Text style={{ color: '#64748B', marginTop: 4 }}>Animales y porcentaje alimentado total por corral.</Text> */}
            </View>

            {/* Tabla */}
            <View
                style={{
                    marginHorizontal: 20,
                    marginTop: 12,
                    borderRadius: 16,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    overflow: 'hidden',
                }}
            >
                {/* HEADER */}
                <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                    <HeaderCell w={W_LEFT} center>Corral</HeaderCell>
                    <VSep />
                    <ScrollView ref={headerRightRef} horizontal scrollEnabled={false} showsHorizontalScrollIndicator>
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

                {/* BODY -> ahora con scroll vertical propio */}
                <View style={{ maxHeight: TABLE_BODY_MAX_H }}>
                    <ScrollView showsVerticalScrollIndicator>
                        <View style={{ flexDirection: 'row' }}>
                            {/* Izquierda fija */}
                            <View style={{ width: W_LEFT }}>
                                {rows.map((r, idx) => (
                                    <View
                                        key={`L-${r.corral}`}
                                        style={{
                                            height: ROW_H,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: PADX,
                                            backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                            borderBottomWidth: idx === rows.length - 1 ? 0 : 1,
                                            borderBottomColor: SEP,
                                        }}
                                    >
                                        <Ionicons name="home-outline" size={Math.round(16 * SCALE)} color="#0f172a" />
                                        <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '600', fontSize: ROW_FS }} numberOfLines={1}>
                                            {`${r.corral}`}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <VSep />

                            {/* Derecha: una sola banda horizontal con todas las filas */}
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
                                                    <Progress percent={r.pct} />
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
        </View>
    );
}
