// screens/Gestation/CorralGridScreen.tsx  (dual: tarjetas <-> tabla)
import React, { useMemo, useState, useRef } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    LayoutAnimation, Platform, UIManager, ScrollView, StyleSheet, useWindowDimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type Animal = { corral: string; total: number; consumida: number };
type Row = { corral: string; animales: number; noAlimentados: number; pct: number; ceColor: string };

const DOT = '#64748B';
const DOT_GREEN = '#22C55E';
const DOT_RED = '#EF4444';

const CARD_GAP = 12;
const CARD_BORDER = '#E2E8F0';
const CARD_BG = 'white';

// Animaciones Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// —— Estilos auxiliares (tarjetas) ——
const ROW_LABEL: any = { color: '#64748B', fontSize: 13 };
const ROW_VALUE: any = { color: '#0f172a', fontWeight: '800', fontSize: 18, fontVariant: ['tabular-nums'], minWidth: 24, textAlign: 'right' };
const HR: any = { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8, opacity: 0.9 };

const colorForCorral = (id: string) => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return (h & 1) === 0 ? DOT_GREEN : DOT_RED; // mitad verde, mitad rojo
};

// —— Barra progreso común ——
const Progress = ({ percent, height = 18 }: { percent: number; height?: number }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <View style={{ height, borderRadius: height / 2, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <View style={{ width: `${p}%`, height: '100%', backgroundColor: '#22C55E', borderRadius: height / 2 }} />
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: Math.max(12, Math.round(height * 0.6)) }}>{p}%</Text>
            </View>
        </View>
    );
};

const EmptyState = ({ text = 'No se ha encontrado ningún corral' }) => (
    <View style={{
        paddingHorizontal: 20,
        paddingVertical: 24,
        alignItems: 'center',
        justifyContent: 'center'
    }}>
        <Ionicons name="search-outline" size={28} color="#94A3B8" />
        <Text style={{ marginTop: 8, color: '#64748B', fontSize: 16, textAlign: 'center' }}>
            {text}
        </Text>
    </View>
);


export default function CorralGridScreen() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [query, setQuery] = useState('');

    // Demo (igual que antes, truncado por brevedad)
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

    // Agregación -> filas
    const rows = useMemo<Row[]>(() => {
        const map = new Map<string, Row>();
        for (const a of animals) {
            const r = map.get(a.corral) ?? { corral: a.corral, animales: 0, noAlimentados: 0, pct: 0, ceColor: '#64748B' };
            r.animales += 1;
            if (a.consumida === 0) r.noAlimentados += 1;
            const t = (r as any)._t ?? 0; const c = (r as any)._c ?? 0;
            (r as any)._t = t + a.total; (r as any)._c = c + a.consumida;
            map.set(a.corral, r);
        }
        const out = Array.from(map.values()).map(r => {
            const t = (r as any)._t ?? 0; const c = (r as any)._c ?? 0;
            return {
                ...r,
                pct: t > 0 ? (c / t) * 100 : 0,
                ceColor: colorForCorral(r.corral), // <<--- color verde/rojo
            };
        });
        out.sort((a, b) => a.corral.localeCompare(b.corral, undefined, { numeric: true }));
        return out;
    }, [animals]);


    const filtered = useMemo(() => rows.filter(r => r.corral.includes(query.trim())), [rows, query]);

    const toggleView = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setViewMode(v => (v === 'grid' ? 'table' : 'grid'));
    };

    // 👉 Navegar al detalle del corral
    const goToCorral = (corralId: string) => {
        const animalsOfCorral = animals.filter(a => a.corral === corralId);
        navigation.navigate('GES-CORRAL-DETALLE', {
            corral: corralId,
            animals: animalsOfCorral,
        });
    };


    // ======== TARJETAS ========
    const renderCard = ({ item }: { item: Row }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => goToCorral(item.corral)}
            style={{
                flex: 1, borderWidth: 1,
                borderColor: CARD_BORDER,
                backgroundColor: CARD_BG,
                borderRadius: 16,
                padding: 14, marginBottom: CARD_GAP,
                shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 }, elevation: 1,
            }}
        >
            {/* Cabecera */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="home-outline" size={16} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '800', fontSize: 18 }}>{item.corral}</Text>
                </View>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.ceColor, opacity: 0.95 }} />
            </View>

            {/* Métricas */}
            <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={ROW_LABEL}>Animales</Text><View style={{ flex: 1 }} />
                    <Text style={ROW_VALUE}>{item.animales}</Text>
                </View>
                <View style={HR} />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={ROW_LABEL}>No alimentados</Text><View style={{ flex: 1 }} />
                    <Text style={ROW_VALUE}>{item.noAlimentados}</Text>
                </View>
            </View>

            <Text style={{ color: '#64748B', marginTop: 12, marginBottom: 6, fontSize: 13 }}>% alimentado</Text>
            <Progress percent={item.pct} />
        </TouchableOpacity>
    );

    // ======== TABLA ========
    const SEP = '#E2E8F0';
    const SEP_W = 1; // mismo ancho que VSep
    const isWeb = Platform.OS === 'web';
    const { width: winW } = useWindowDimensions();
    const MOBILE_BREAKPOINT = 480;            // ← puedes ajustar
    const isNarrow = !isWeb || winW <= MOBILE_BREAKPOINT;
    const PAGE_PX = 20;
    const MAX_TABLE_W = 1850;
    const tableMaxW = Math.min(winW - PAGE_PX * 2, MAX_TABLE_W);
    const SCALE = isWeb && !isNarrow ? 1.10 : 1.12;
    const W_LEFT = isWeb ? 120 : Math.round(100 * SCALE);
    const W_COL = isWeb ? 110 : Math.round(100 * SCALE);
    const W_CE = isWeb ? 56 : Math.round(44 * SCALE);
    const W_PCT_BASE = (isWeb && !isNarrow) ? 400 : 140;   // ← móvil/estrecho: 140px (prueba 120–160)

    // reserva aproximada que ocupan separadores y paddings
    // const PADDING_OVERHEAD = isWeb ? 80 : 60;
    // const W_PCT =
    //     isWeb
    //         ? Math.max(
    //             W_PCT_BASE,
    //             tableMaxW - (W_LEFT + 2 * W_COL + W_CE + PADDING_OVERHEAD)
    //         )
    //         : W_PCT_BASE;

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const PCT_MIN_MOBILE = 120;
    const PCT_MAX_MOBILE = 240; // ajusta si quieres más ancho en móvil


    const ROW_H = isWeb ? 60 : Math.round(48 * SCALE);
    const HEAD_H = isWeb ? 64 : Math.round(50 * SCALE);
    const HEAD_FS = isWeb ? 15 : Math.round(14 * SCALE);
    const ROW_FS = isWeb ? 14 : Math.round(14 * SCALE);
    const PADX = isWeb ? 12 : Math.round(10 * SCALE);
    const PROG_H = isWeb ? 22 : Math.round(18 * SCALE);
    const webNoOutline: any = isWeb
        ? { outlineStyle: 'none', outlineWidth: 0, outlineColor: 'transparent' }
        : null;


    const BODY_MAX_VISIBLE_ROWS = 10;
    const TABLE_BODY_MAX_H = BODY_MAX_VISIBLE_ROWS * ROW_H;

    const HeaderCell = ({ w, center, children }: { w: number; center?: boolean; children: React.ReactNode }) => (
        <View style={{ width: w, paddingHorizontal: PADX, height: HEAD_H, justifyContent: 'center' }}>
            <Text style={{ color: '#334155', fontWeight: '700', fontSize: HEAD_FS, textAlign: center ? 'center' : 'left' }} numberOfLines={1}>
                {children}
            </Text>
        </View>
    );

    const CellText = ({ w, center, strong, children }: { w: number; center?: boolean; strong?: boolean; children: React.ReactNode }) => (
        <View style={{ width: w, paddingHorizontal: PADX, alignItems: center ? 'center' : 'flex-start' }}>
            <Text style={{ color: '#0f172a', fontWeight: strong ? '700' : '500', fontVariant: ['tabular-nums'], fontSize: ROW_FS }} numberOfLines={1}>
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
    const MIN_PCT_MOBILE = 140; // usa un único nombre para evitar duplicados
    const bandMinW = 2 * W_COL + MIN_PCT_MOBILE + W_CE + 4 * SEP_W;

    const TableView = ({ data, onRowPress }: { data: Row[]; onRowPress: (corral: string) => void }) => {
        const headerRightRef = useRef<ScrollView>(null);
        const bodyRightRef = useRef<ScrollView>(null);

        // WEB / ancho
        const [pctW, setPctW] = useState(W_PCT_BASE);
        const bandW = useMemo(() => 2 * W_COL + pctW + W_CE + 4 * SEP_W, [pctW]);

        const syncHeader = (e: any) => {
            headerRightRef.current?.scrollTo({ x: e.nativeEvent.contentOffset.x, animated: false });
        };

        if (isNarrow) {
            const MAX_VISIBLE_ROWS_MOBILE = 8;
            const useShrink = data.length <= MAX_VISIBLE_ROWS_MOBILE;

            return (
                <View
                    style={{
                        marginTop: 12,
                        marginBottom: 20,
                        borderRadius: 16,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                        overflow: 'hidden',
                        alignSelf: 'stretch',
                        ...(useShrink ? {} : { flex: 1 }),
                    }}
                >
                    {/* HEADER */}
                    <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' }}>
                        <HeaderCell w={W_LEFT} center>Corral</HeaderCell>
                        <VSep />
                        <ScrollView
                            ref={headerRightRef}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            bounces={false}
                            overScrollMode="never"
                            contentContainerStyle={{ minWidth: bandMinW }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <HeaderCell w={W_COL} center>Animales</HeaderCell>
                                <VSep />
                                <HeaderCell w={W_COL} center>No alim.</HeaderCell>
                                <VSep />
                                <HeaderCell w={MIN_PCT_MOBILE} center>% alimentado</HeaderCell>
                                <VSep />
                                <HeaderCell w={W_CE} center>CE</HeaderCell>
                            </View>
                        </ScrollView>
                    </View>

                    {/* BODY */}
                    {useShrink ? (
                        // 1–8 filas: se encoge sin scroll vertical
                        <View style={{ paddingBottom: 6 }}>
                            <View style={{ flexDirection: 'row' }}>
                                {/* izquierda fija */}
                                <View style={{ width: W_LEFT }}>
                                    {data.map((r, idx) => (
                                        <TouchableOpacity
                                            key={`L-${r.corral}`} activeOpacity={0.8} onPress={() => onRowPress(r.corral)}
                                            style={{
                                                height: ROW_H, flexDirection: 'row', alignItems: 'center',
                                                paddingHorizontal: PADX, backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                                borderBottomWidth: idx === data.length - 1 ? 0 : 1, borderBottomColor: '#E2E8F0',
                                            }}
                                        >
                                            <Ionicons name="home-outline" size={Math.round(16 * SCALE)} color="#0f172a" />
                                            <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '600', fontSize: ROW_FS }} numberOfLines={1}>
                                                {r.corral}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <VSep />

                                {/* derecha con H-scroll */}
                                <ScrollView
                                    ref={bodyRightRef}
                                    horizontal
                                    onScroll={syncHeader}
                                    scrollEventThrottle={16}
                                    showsHorizontalScrollIndicator
                                    bounces={false}
                                    overScrollMode="never"
                                    contentContainerStyle={{ minWidth: bandMinW }}
                                >
                                    <View style={{ width: '100%' }}>
                                        {data.map((r, idx) => (
                                            <TouchableOpacity
                                                key={`R-${r.corral}`} activeOpacity={0.8} onPress={() => onRowPress(r.corral)}
                                                style={{
                                                    height: ROW_H, flexDirection: 'row', alignItems: 'center',
                                                    backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                                    borderBottomWidth: idx === data.length - 1 ? 0 : 1, borderBottomColor: '#E2E8F0',
                                                    paddingRight: 8,
                                                }}
                                            >
                                                <CellText w={W_COL} center strong>{r.animales}</CellText>
                                                <VSep />
                                                <CellText w={W_COL} center>{r.noAlimentados}</CellText>
                                                <VSep />
                                                <View style={{ minWidth: MIN_PCT_MOBILE, flex: 1, paddingHorizontal: 8 }}>
                                                    <Progress percent={r.pct} height={PROG_H} />
                                                </View>
                                                <VSep />
                                                <View style={{ width: W_CE, alignItems: 'center' }}>
                                                    <CEDot color={r.ceColor} />
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    ) : (
                        // MUCHAS filas → **un solo ScrollView vertical** envolviendo izquierda + derecha
                        <View style={{ flex: 1, paddingBottom: 6 }}>
                            <ScrollView
                                style={{ flex: 1 }}
                                showsVerticalScrollIndicator
                                bounces={false}
                                overScrollMode="never"
                                nestedScrollEnabled
                            >
                                <View style={{ flexDirection: 'row' }}>
                                    {/* izquierda fija (sin su propio scroll) */}
                                    <View style={{ width: W_LEFT }}>
                                        {data.map((r, idx) => (
                                            <TouchableOpacity
                                                key={`L-${r.corral}`} activeOpacity={0.8} onPress={() => onRowPress(r.corral)}
                                                style={{
                                                    height: ROW_H, flexDirection: 'row', alignItems: 'center',
                                                    paddingHorizontal: PADX, backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                                    borderBottomWidth: idx === data.length - 1 ? 0 : 1, borderBottomColor: '#E2E8F0',
                                                }}
                                            >
                                                <Ionicons name="home-outline" size={Math.round(16 * SCALE)} color="#0f172a" />
                                                <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '600', fontSize: ROW_FS }} numberOfLines={1}>
                                                    {r.corral}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <VSep />

                                    {/* derecha: H-scroll (sin scroll vertical propio) */}
                                    <ScrollView
                                        ref={bodyRightRef}
                                        horizontal
                                        onScroll={syncHeader}
                                        scrollEventThrottle={16}
                                        showsHorizontalScrollIndicator
                                        bounces={false}
                                        overScrollMode="never"
                                        contentContainerStyle={{ minWidth: bandMinW }}
                                    >
                                        <View style={{ width: '100%' }}>
                                            {data.map((r, idx) => (
                                                <TouchableOpacity
                                                    key={`R-${r.corral}`} activeOpacity={0.8} onPress={() => onRowPress(r.corral)}
                                                    style={{
                                                        height: ROW_H, flexDirection: 'row', alignItems: 'center',
                                                        backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                                        borderBottomWidth: idx === data.length - 1 ? 0 : 1, borderBottomColor: '#E2E8F0',
                                                        paddingRight: 8,
                                                    }}
                                                >
                                                    <CellText w={W_COL} center strong>{r.animales}</CellText>
                                                    <VSep />
                                                    <CellText w={W_COL} center>{r.noAlimentados}</CellText>
                                                    <VSep />
                                                    <View style={{ minWidth: MIN_PCT_MOBILE, flex: 1, paddingHorizontal: 8 }}>
                                                        <Progress percent={r.pct} height={PROG_H} />
                                                    </View>
                                                    <VSep />
                                                    <View style={{ width: W_CE, alignItems: 'center' }}>
                                                        <CEDot color={r.ceColor} />
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            );
        }


        // ---------- WEB / ANCHO (igual que tenías) ----------
        return (
            <View
                onLayout={(e) => {
                    const total = e.nativeEvent.layout.width;
                    const calc = Math.max(W_PCT_BASE, Math.round(total - (W_LEFT + 2 * W_COL + W_CE + 4 * SEP_W)));
                    if (calc !== pctW) setPctW(calc);
                }}
                style={{
                    alignSelf: 'center',
                    width: isWeb ? '100%' : undefined,
                    maxWidth: isWeb ? tableMaxW : undefined,
                    marginTop: 12,
                    marginBottom: 20,
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
                    <ScrollView
                        ref={headerRightRef}
                        horizontal
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        overScrollMode="never"
                        contentContainerStyle={{ width: bandW }}
                    >
                        <View style={{ flexDirection: 'row' }}>
                            <HeaderCell w={W_COL} center>Animales</HeaderCell>
                            <VSep />
                            <HeaderCell w={W_COL} center>No alim.</HeaderCell>
                            <VSep />
                            <HeaderCell w={pctW} center>% alimentado</HeaderCell>
                            <VSep />
                            <HeaderCell w={W_CE} center>CE</HeaderCell>
                        </View>
                    </ScrollView>
                </View>

                {/* BODY */}
                <View style={{ maxHeight: TABLE_BODY_MAX_H }}>
                    <ScrollView showsVerticalScrollIndicator={false} bounces={false} overScrollMode="never">
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: W_LEFT }}>
                                {data.map((r, idx) => (
                                    <TouchableOpacity
                                        key={`L-${r.corral}`}
                                        activeOpacity={0.8}
                                        onPress={() => onRowPress(r.corral)}
                                        style={{
                                            height: ROW_H,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: PADX,
                                            backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                            borderBottomWidth: idx === data.length - 1 ? 0 : 1,
                                            borderBottomColor: '#E2E8F0',
                                        }}
                                    >
                                        <Ionicons name="home-outline" size={Math.round(16 * SCALE)} color="#0f172a" />
                                        <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '600', fontSize: ROW_FS }} numberOfLines={1}>
                                            {r.corral}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <VSep />

                            <ScrollView
                                ref={bodyRightRef}
                                horizontal
                                onScroll={syncHeader}
                                scrollEventThrottle={16}
                                showsHorizontalScrollIndicator={false}
                                bounces={false}
                                overScrollMode="never"
                            >
                                <View style={{ width: bandW }}>
                                    {data.map((r, idx) => (
                                        <TouchableOpacity
                                            key={`R-${r.corral}`}
                                            activeOpacity={0.8}
                                            onPress={() => onRowPress(r.corral)}
                                            style={{
                                                height: ROW_H,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: idx % 2 ? '#FFFFFF' : '#FCFDFE',
                                                borderBottomWidth: idx === data.length - 1 ? 0 : 1,
                                                borderBottomColor: '#E2E8F0',
                                                width: bandW,
                                            }}
                                        >
                                            <CellText w={W_COL} center strong>{r.animales}</CellText>
                                            <VSep />
                                            <CellText w={W_COL} center>{r.noAlimentados}</CellText>
                                            <VSep />
                                            <View style={{ width: pctW, paddingHorizontal: 8 }}>
                                                <Progress percent={r.pct} height={PROG_H} />
                                            </View>
                                            <VSep />
                                            <View style={{ width: W_CE, alignItems: 'center' }}>
                                                <CEDot color={r.ceColor} />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    };




    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Título + toggle + buscador */}
            <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#0f172a', fontSize: 22, fontWeight: '900' }}>Resumen por corral</Text>

                    <TouchableOpacity
                        onPress={toggleView}
                        activeOpacity={0.85}
                        style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 10, paddingVertical: 6,
                            borderRadius: 12, backgroundColor: 'white',
                            borderWidth: 1, borderColor: '#CBD5E1'
                        }}
                    >
                        <Ionicons
                            name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
                            size={18}
                            color="#4F46E5"
                        />
                    </TouchableOpacity>
                </View>

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
                        overflow: 'hidden',                // ⟵ por si algún outline intenta salirse
                    }}
                >
                    <Ionicons name="search-outline" size={18} color="#64748B" />


                    <TextInput
                        style={[
                            { flex: 1, marginLeft: 8, color: '#0f172a' },
                            webNoOutline,                  // ⟵ esto quita el rectángulo de foco en web
                        ]}
                        placeholder="Buscar corral"
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

            {/* Contenido según modo */}
            {/* Contenido según modo */}
            <View style={{ flex: 1 }}>
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : viewMode === 'grid' ? (
                    <FlatList
                        data={filtered}
                        keyExtractor={(it) => it.corral}
                        numColumns={1}
                        renderItem={renderCard}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={{ flex: 1, paddingHorizontal: 16 }}>
                        <TableView data={filtered} onRowPress={goToCorral} />
                    </View>
                )}
            </View>

        </View>
    );

}
