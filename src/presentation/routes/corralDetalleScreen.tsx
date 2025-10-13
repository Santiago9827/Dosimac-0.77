// screens/Gestation/CorralDetalleScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    LayoutAnimation, Platform, UIManager, Modal
} from 'react-native';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dimensions, Alert } from 'react-native';


// Animaciones Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Animal = {
    id?: string | number;
    crotal?: string;               // puede tener letras y números
    diaInseminacion?: number;
    curva?: string;                // "DEFECTO" | "PRIMALAS 2 FASE" ...
    corral: string;
    total: number;
    consumida: number;
};

// Interno para render con datos enriquecidos y fallbacks estables
type RenderAnimal = Animal & {
    _idx: number;       // índice original
    _crotal: string;    // crotal definitivo a mostrar/ordenar
    _dias: number;      // días inseminación mostrado
    _curva: string;     // curva mostrada
};

const CARD_BORDER = '#E2E8F0';
const CARD_BG = 'white';
const HEADER_EXTRA_TOP = 14;

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

// Fallbacks deterministas (se calculan contra el índice ORIGINAL, no el visible)
const genCrotal = (corral: string, idxOriginal: number) => {
    const corralNum = (corral.match(/\d+/)?.[0] ?? '0').padStart(2, '0');
    const base = 100000000000; // 12 dígitos
    const n = base + Number(corralNum) * 1000 + (idxOriginal + 1);
    return String(n);
};
const genDiasInseminacion = (corral: string, idxOriginal: number) => {
    const c = parseInt(corral.replace(/\D/g, ''), 10) || 0;
    return ((c * 13 + (idxOriginal + 1) * 7) % 115) + 1; // 1..115
};
const pct = (a: Animal) => (a.total > 0 ? (a.consumida / a.total) * 100 : 0);

// --- utils para ordenar por crotal (letras primero) ---
const splitCrotal = (crotal: string) => {
    const letters = (crotal.match(/[A-Za-z]+/g)?.join('') ?? '').toUpperCase(); // todas las letras
    const digits = (crotal.match(/\d+/g)?.join('') ?? '');                      // todos los dígitos (string)
    const hasLetters = letters.length > 0;
    return { hasLetters, letters, digits };
};

const cmpNumStrAsc = (a: string, b: string) => {
    // compara numéricamente strings grandes: primero por longitud, luego lexicográfico
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b);
};

export default function CorralDetalleScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<NavigationProp<any>>();
    const listRef = useRef<FlatList<RenderAnimal>>(null);

    const corral: string = route.params?.corral ?? '—';
    const animals: Animal[] = route.params?.animals ?? [];

    // ── Estado de orden y menú ─────────────────────────────────────────────
    type SortKey = 'none' | 'pct' | 'crotal' | 'dias';
    type SortDir = 'asc' | 'desc';
    const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'none', dir: 'asc' });
    const [menuOpen, setMenuOpen] = useState(false);
    const [headerBox, setHeaderBox] = useState({ y: 0, h: 0 });

    const [itemMenu, setItemMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        item?: RenderAnimal;
    }>({ visible: false, x: 0, y: 0 });

    const openItemMenu = (item: RenderAnimal, e: any) => {
        const { pageX, pageY } = e.nativeEvent;
        setItemMenu({ visible: true, x: pageX, y: pageY, item });
    };

    const closeItemMenu = () => setItemMenu({ visible: false, x: 0, y: 0, item: undefined });



    // Enriquecemos una sola vez por dataset (mantiene fallbacks estables)
    const baseData: RenderAnimal[] = useMemo(
        () =>
            animals.map((a, idx) => ({
                ...a,
                _idx: idx,
                _crotal: a.crotal ?? genCrotal(corral, idx),
                _dias: typeof a.diaInseminacion === 'number' ? a.diaInseminacion : genDiasInseminacion(corral, idx),
                _curva: a.curva ?? 'DEFECTO',
            })),
        [animals, corral]
    );

    // Resumen
    const stats = useMemo(() => {
        const total = animals.length;
        const noAlimentados = animals.filter(a => a.consumida === 0).length;
        const pctMedio =
            animals.length === 0
                ? 0
                : Math.round((animals.reduce((acc, a) => acc + pct(a), 0) / animals.length));
        return { total, noAlimentados, pctMedio };
    }, [animals]);

    // Datos ordenados según opción + dirección
    const dataSorted = useMemo(() => {
        const copy = [...baseData];
        const dir = sort.dir === 'asc' ? 1 : -1;

        if (sort.key === 'pct') {
            copy.sort((a, b) => dir * (pct(a) - pct(b)));
        } else if (sort.key === 'crotal') {
            copy.sort((a, b) => {
                const A = splitCrotal(a._crotal);
                const B = splitCrotal(b._crotal);

                if (A.hasLetters !== B.hasLetters) return dir * (A.hasLetters ? -1 : 1);
                if (A.hasLetters && B.hasLetters) {
                    const byLetters = A.letters.localeCompare(B.letters);
                    if (byLetters !== 0) return dir * byLetters;
                    return dir * cmpNumStrAsc(A.digits, B.digits);
                }
                return dir * cmpNumStrAsc(A.digits, B.digits);
            });
        } else if (sort.key === 'dias') {
            copy.sort((a, b) => dir * (a._dias - b._dias));
        }
        return copy;
    }, [baseData, sort]);

    // Animar solo en iOS y subir al top al cambiar orden
    useEffect(() => {
        if (Platform.OS === 'ios') {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, [sort]);

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            {/* Header fijo con embudo */}
            <View
                onLayout={(e) => setHeaderBox({ y: e.nativeEvent.layout.y, h: e.nativeEvent.layout.height })}
                style={{
                    paddingHorizontal: 16,
                    paddingTop: 12 + HEADER_EXTRA_TOP,
                    paddingBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 6 }}>
                        <Ionicons name="chevron-back" size={22} color="#0f172a" />
                    </TouchableOpacity>
                    <Ionicons name="home-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 20 }}>
                        Corral {corral}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setMenuOpen(v => !v)}
                    style={{
                        width: 36, height: 36, borderRadius: 10, backgroundColor: 'white',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: '#E2E8F0'
                    }}
                    activeOpacity={0.85}
                >
                    <Ionicons name="funnel-outline" size={18} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Chip de orden (fijo) con toggle tocando TODO el chip */}
            {sort.key !== 'none' && (
                <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Chip entero = toggle ASC/DSC */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() =>
                                setSort(s => (s.key === 'none' ? s : { ...s, dir: s.dir === 'asc' ? 'desc' : 'asc' }))
                            }
                            style={{
                                alignSelf: 'flex-start',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 999,
                                backgroundColor: '#ECFEFF',
                                borderWidth: 1,
                                borderColor: '#A5F3FC',
                            }}
                        >
                            {/* Flecha gorda y larga al INICIO */}
                            <Ionicons
                                name={sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'}
                                size={22}            // súbelo a 24 si quieres aún más presencia
                                color="#0E7490"
                                style={{ marginRight: 4 }}
                            />

                            <Ionicons name="funnel-outline" size={16} color="#0E7490" />
                            <Text style={{ color: '#0E7490', fontWeight: '800', marginLeft: 6 }}>
                                {sort.key === 'pct'
                                    ? 'Orden: % alimentado'
                                    : sort.key === 'dias'
                                        ? 'Orden: Días inseminación'
                                        : 'Orden: Crotal'}
                            </Text>

                        </TouchableOpacity>

                        {/* Botón para quitar el filtro */}
                        <TouchableOpacity
                            onPress={() => setSort({ key: 'none', dir: 'asc' })}
                            style={{ marginLeft: 10, padding: 6 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close" size={16} color="#0E7490" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Tarjeta resumen (fija) */}
            <View
                style={{
                    marginHorizontal: 16,
                    marginBottom: 10,
                    padding: 14,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: CARD_BORDER,
                    borderRadius: 16,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#64748B' }}>Animales</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '800' }}>{stats.total}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: '#64748B' }}>No alimentados</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '800' }}>{stats.noAlimentados}</Text>
                </View>
                <Text style={{ color: '#64748B', marginTop: 6, marginBottom: 6 }}>% alimentado medio</Text>
                <Progress percent={stats.pctMedio} />
            </View>

            {/* Lista */}
            <FlatList
                ref={listRef}
                data={dataSorted}
                keyExtractor={(item) => `${corral}-${item._idx}`}
                removeClippedSubviews={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                renderItem={({ item }) => {
                    const p = pct(item);
                    const displayId = item.id ?? item._idx + 1;

                    return (
                        <View
                            style={{
                                borderWidth: 1, borderColor: CARD_BORDER, backgroundColor: CARD_BG, borderRadius: 16,
                                padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8,
                                shadowOffset: { width: 0, height: 3 }, elevation: 1,
                            }}
                        >
                            {/* ID + Crotal */}
                            {/* ID + Crotal */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="paw-outline" size={16} color="#0f172a" />
                                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '800', fontSize: 16 }}>
                                        ID {String(displayId)}
                                    </Text>
                                </View>

                                {/* Crotal + 3 puntitos */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text
                                        style={{ color: '#0f172a', fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 0.3 }}
                                        numberOfLines={1}
                                    >
                                        Crotal {item._crotal}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={(e) => openItemMenu(item, e)}
                                        style={{ marginLeft: 8, padding: 6 }}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            </View>


                            {/* Días + Curva */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ color: '#64748B', marginRight: 6 }}>Días inseminación</Text>
                                    <Text style={{ color: '#0f172a', fontWeight: '700' }}>{item._dias}</Text>
                                </View>
                                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' }}>
                                    <Text style={{ color: '#3730A3', fontWeight: '700' }}>{item._curva}</Text>
                                </View>
                            </View>

                            {/* Totales */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: '#64748B' }}>Total</Text>
                                <Text style={{ color: '#0f172a', fontWeight: '700' }}>{item.total}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                <Text style={{ color: '#64748B' }}>Consumida</Text>
                                <Text style={{ color: '#0f172a', fontWeight: '700' }}>{item.consumida}</Text>
                            </View>

                            <Text style={{ color: '#64748B', marginTop: 6, marginBottom: 6 }}>% alimentado</Text>
                            <Progress percent={p} />
                        </View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                        <Ionicons name="search-outline" size={18} color="#94A3B8" />
                        <Text style={{ color: '#64748B', marginTop: 6 }}>No hay animales en este corral</Text>
                    </View>
                )}
            />

            {/* Menú contextual del ítem */}
            <Modal
                visible={itemMenu.visible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeItemMenu}
            >
                <View style={{ flex: 1 }}>
                    {/* Clic fuera para cerrar */}
                    <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeItemMenu} />

                    {/* Cálculo simple de posición */}
                    {(() => {
                        const W = Dimensions.get('window').width;
                        const MENU_W = 200;
                        const left = Math.min(Math.max(itemMenu.x - MENU_W + 24, 12), W - MENU_W - 12);
                        const top = Math.max(itemMenu.y + 6, 80);

                        return (
                            <View
                                style={{
                                    position: 'absolute',
                                    top,
                                    left,
                                    width: MENU_W,
                                    backgroundColor: 'white',
                                    borderWidth: 1,
                                    borderColor: '#E2E8F0',
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
                                    Acciones
                                </Text>

                                {/* Acción: Buscar */}
                                <TouchableOpacity
                                    onPress={() => {
                                        closeItemMenu();
                                        Alert.alert('Buscar', `Buscar por crotal: ${itemMenu.item?._crotal}`);
                                        // Si luego quieres navegar:
                                        // navigation.navigate('Buscar' as never, { q: itemMenu.item?._crotal } as never);
                                    }}
                                    activeOpacity={0.8}
                                    style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                                >
                                    <Ionicons name="search-outline" size={18} color="#0f172a" style={{ marginRight: 10 }} />
                                    <Text style={{ color: '#0f172a' }}>Buscar</Text>
                                </TouchableOpacity>
                            </View>
                        );
                    })()}
                </View>
            </Modal>


            {/* Menú flotante */}
            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setMenuOpen(false)}
            >
                <View style={{ flex: 1 }}>
                    {/* Clic fuera para cerrar */}
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setMenuOpen(false)}
                    />

                    {/* Menú */}
                    <View
                        style={{
                            position: 'absolute',
                            top: headerBox.y + headerBox.h + 4,
                            right: 16,
                            width: 260,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
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
                            Filtros
                        </Text>

                        {/* No alimentados (empieza asc) */}
                        <TouchableOpacity
                            onPress={() => { setSort({ key: 'pct', dir: 'asc' }); setMenuOpen(false); }}
                            activeOpacity={0.8}
                            style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Ionicons name="trending-down-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#0f172a', flex: 1 }}>
                                No alimentados ({sort.key === 'pct' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'})
                            </Text>
                            {sort.key === 'pct' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                        </TouchableOpacity>

                        {/* Crotal (empieza asc) */}
                        <TouchableOpacity
                            onPress={() => { setSort({ key: 'crotal', dir: 'asc' }); setMenuOpen(false); }}
                            activeOpacity={0.8}
                            style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Ionicons name="pricetags-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#0f172a', flex: 1 }}>
                                Crotal ({sort.key === 'crotal' ? (sort.dir === 'asc' ? '↑' : '↓') : '↑'})
                            </Text>
                            {sort.key === 'crotal' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                        </TouchableOpacity>

                        {/* Días inseminación (empieza DESC) */}
                        <TouchableOpacity
                            onPress={() => { setSort({ key: 'dias', dir: 'desc' }); setMenuOpen(false); }}
                            activeOpacity={0.8}
                            style={{ paddingHorizontal: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Ionicons name="calendar-outline" size={20} color="#0f172a" style={{ marginRight: 10 }} />
                            <Text style={{ color: '#0f172a', flex: 1 }}>
                                Días inseminación ({sort.key === 'dias' ? (sort.dir === 'asc' ? '↑' : '↓') : '↓'})
                            </Text>
                            {sort.key === 'dias' && <Ionicons name="checkmark" size={18} color="#22C55E" />}
                        </TouchableOpacity>


                        {sort.key !== 'none' && (
                            <TouchableOpacity
                                onPress={() => { setSort({ key: 'none', dir: 'asc' }); setMenuOpen(false); }}
                                activeOpacity={0.8}
                                style={{ paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}
                            >
                                <Ionicons name="close-circle-outline" size={16} color="#0f172a" style={{ marginRight: 10 }} />
                                <Text style={{ color: '#0f172a' }}>Quitar filtro</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
