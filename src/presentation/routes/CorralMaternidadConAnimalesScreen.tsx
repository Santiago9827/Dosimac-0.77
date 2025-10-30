// CorralMaternidadResumenScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, Pressable, Animated, Dimensions, Modal, FlatList, Alert, TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

type RouteParams = {
    corral?: string | number;
    stats?: { total?: number; noFeed?: number };
    animals?: Animal[];
};

type Animal = {
    id: number | string;
    crotal: string;
    alimentado?: boolean;
    diaInseminacion?: number;
    curva?: string;
    condicion?: string;
    subEstado?: string;
    subEstadoFecha?: string;
    salidaAnimal?: string;
    total?: number;
    consumida?: number;
};

const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';
const OK = '#16A34A';

const Progress = ({ percent, height = 18 }: { percent: number; height?: number }) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    return (
        <View style={{ height, borderRadius: height / 2, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
            <View style={{ width: `${p}%`, height: '100%', backgroundColor: OK, borderRadius: height / 2 }} />
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#111827', fontWeight: '700', fontSize: Math.max(12, Math.round(height * 0.6)) }}>{p}%</Text>
            </View>
        </View>
    );
};

const useRightDrawer = () => {
    const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
    const [open, setOpen] = useState(false);
    const tx = useRef(new Animated.Value(w)).current;
    const show = () => { setOpen(true); Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start(); };
    const hide = () => { Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true }).start(({ finished }) => finished && setOpen(false)); };
    return { open, show, hide, tx, width: w };
};

const DrawerItem = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <Pressable onPress={onPress} android_ripple={{ color: '#e5e7eb' }} style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 }}>
        <Text style={{ color: '#0f172a', fontWeight: '600' }}>{label}</Text>
    </Pressable>
);

const pct = (a: { total?: number; consumida?: number }) =>
    a.total && a.total > 0 ? ((a.consumida ?? 0) / a.total) * 100 : 0;

const fmt = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/* ---------- Tarjeta Animal (selección por long press 1s) ---------- */
function AnimalCard({
    animal, selected, onLongPress,
}: { animal: Animal; selected: boolean; onLongPress: () => void; }) {
    const idx = Number(animal.id) - 1 || 0;
    const tot = animal.total ?? [2837, 1400, 2837, 2000][idx % 4];
    const curva = animal.curva ?? 'DEFECTO';
    const dias = animal.diaInseminacion ?? (((idx + 1) * 7) % 115) + 1;
    const consumida = animal.consumida ?? Math.round(tot * [0.7, 0.64, 0.72, 0.58][idx % 4]);
    const p = pct({ total: tot, consumida });

    return (
        <Pressable
            android_ripple={{ color: '#e5e7eb' }}
            delayLongPress={1000}            // ← 1 segundo
            onLongPress={onLongPress}
            style={{
                borderWidth: 1,
                borderColor: selected ? BRAND : CARD_BORDER,
                backgroundColor: selected ? '#EEF2FF' : '#fff',
                borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 12,
                shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1,
            }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="paw-outline" size={16} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '800', fontSize: 16 }}>ID {String(animal.id)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#0f172a', fontWeight: '700', fontVariant: ['tabular-nums'], letterSpacing: 0.3 }} numberOfLines={1}>
                        Crotal {animal.crotal}
                    </Text>
                    {selected && <Ionicons name="checkmark-circle" size={18} color={BRAND} style={{ marginLeft: 8 }} />}
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#64748B', marginRight: 6 }}>Días inseminación</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '700' }}>{dias}</Text>
                </View>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE' }}>
                    <Text style={{ color: '#3730A3', fontWeight: '700' }}>{curva}</Text>
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#64748B' }}>Total</Text>
                <Text style={{ color: '#0f172a', fontWeight: '700' }}>{tot}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: '#64748B' }}>Consumida</Text>
                <Text style={{ color: '#0f172a', fontWeight: '700' }}>{consumida}</Text>
            </View>

            <Text style={{ color: '#64748B', marginTop: 6, marginBottom: 6 }}>% alimentado</Text>
            <Progress percent={p} />
        </Pressable>
    );
}

/* ---------- Diálogo genérico de radio opciones ---------- */
function RadioDialog({
    visible, title, options, current, onClose, onAccept,
}: {
    visible: boolean; title: string; options: string[]; current?: string;
    onClose: () => void; onAccept: (val: string) => void;
}) {
    const [val, setVal] = useState(current || options[0]);
    useEffect(() => setVal(current || options[0]), [current, options]);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
            <View style={{
                position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
            }}>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>{title}</Text>
                {options.map(op => (
                    <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                        <Ionicons name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                        <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
                    </Pressable>
                ))}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onAccept(val)} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/* ---------- Diálogo SubEstado (opción + fecha actual) ---------- */
function SubEstadoDialog({
    visible, current, dateStr, onClose, onAccept,
}: {
    visible: boolean; current?: string; dateStr?: string;
    onClose: () => void; onAccept: (estado: string, fecha: string) => void;
}) {
    const opciones = ['PREPARTO', 'LACTANCIA', 'DESTETE'];
    const [val, setVal] = useState(current || opciones[0]);
    const hoy = useMemo(() => dateStr ?? fmt(new Date()), [dateStr]);
    useEffect(() => setVal(current || opciones[0]), [current]);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
            <View style={{
                position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
            }}>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>SubEstado</Text>

                {opciones.map(op => (
                    <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                        <Ionicons name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                        <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
                    </Pressable>
                ))}

                <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10 }}>
                    <Text style={{ color: '#64748B' }}>Fecha</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 4 }}>{hoy}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onAccept(val, hoy)} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/* ---------- Diálogo Sustituir crotal ---------- */
function CrotalDialog({
    visible, oldCrotal, onClose, onAccept,
}: {
    visible: boolean; oldCrotal: string; onClose: () => void; onAccept: (nuevo: string) => void;
}) {
    const [nuevo, setNuevo] = useState('');
    useEffect(() => setNuevo(''), [visible]);

    const accept = () => {
        const clean = nuevo.trim();
        if (!clean) { Alert.alert('Introduce el crotal nuevo'); return; }
        onAccept(clean);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
            <View style={{
                position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
            }}>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>Sustituir crotal</Text>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ color: '#64748B' }}>Crotal antiguo</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 4 }}>{oldCrotal}</Text>
                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>Crotal nuevo</Text>
                    <TextInput
                        value={nuevo}
                        onChangeText={setNuevo}
                        placeholder="Introduce nuevo crotal"
                        keyboardType="numeric"
                        style={{ borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#0f172a' }}
                    />
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <TouchableOpacity onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={accept} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

/* =================== PANTALLA =================== */
export default function CorralMaternidadResumenScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();

    const { corral, stats, animals: animalsParam }: RouteParams = route.params ?? {};

    const animalsFromParams: Animal[] = useMemo(() => {
        if (Array.isArray(animalsParam) && animalsParam.length) return animalsParam;
        const total = Number(stats?.total ?? 0);
        if (total > 0) {
            return Array.from({ length: total }).map((_, i) => ({
                id: i + 1,
                crotal: String(100000000000 + (i + 1)),
                alimentado: i !== 0,
            }));
        }
        return [];
    }, [animalsParam, stats]);

    const [animals, setAnimals] = useState<Animal[]>(animalsFromParams);
    useEffect(() => setAnimals(animalsFromParams), [animalsFromParams]);

    const totals = useMemo(() => {
        const total = animals.length || Number(stats?.total ?? 0) || 0;
        const noFeed =
            (animals.length ? animals.filter(a => a.alimentado === false).length : Number(stats?.noFeed ?? 0)) || 0;
        const p = total > 0 ? Math.round(((total - noFeed) / total) * 100) : 0;
        return { total, noFeed, pct: p };
    }, [animals, stats]);

    const [selectedId, setSelectedId] = useState<number | string | null>(null);
    const selectedAnimal = animals.find(a => a.id === selectedId) || null;

    const drawer = useRightDrawer();

    const requireSelection = () => {
        if (!selectedId) {
            Alert.alert('Primero debes seleccionar un animal');
            return false;
        }
        return true;
    };

    // Diálogos visibles
    const [dlgCurva, setDlgCurva] = useState(false);
    const [dlgCond, setDlgCond] = useState(false);
    const [dlgSub, setDlgSub] = useState(false);
    const [dlgSalida, setDlgSalida] = useState(false);
    const [dlgCrotal, setDlgCrotal] = useState(false);

    const openAction = (key: string) => {
        if (!requireSelection()) return;
        drawer.hide();
        if (key === 'curva') setTimeout(() => setDlgCurva(true), 120);
        else if (key === 'condicionCorporal') setTimeout(() => setDlgCond(true), 120);
        else if (key === 'subEstado') setTimeout(() => setDlgSub(true), 120);
        else if (key === 'salidaAnimal') setTimeout(() => setDlgSalida(true), 120);
        else if (key === 'sustituirCrotal') setTimeout(() => setDlgCrotal(true), 120);
        else {
            // ident. anónimo / salida maternidad -> más adelante
            setTimeout(() => Alert.alert('Pendiente', 'Función aún no implementada'), 120);
        }
    };

    // Aplicaciones + volver a la anterior
    const doneAndBack = () => navigation.goBack();

    const applyCurva = (val: string) => {
        if (!selectedId) return;
        setAnimals(list => list.map(a => (a.id === selectedId ? { ...a, curva: val } : a)));
        setDlgCurva(false);
        doneAndBack();
    };
    const applyCondicion = (val: string) => {
        if (!selectedId) return;
        setAnimals(list => list.map(a => (a.id === selectedId ? { ...a, condicion: val } : a)));
        setDlgCond(false);
        doneAndBack();
    };
    const applySubEstado = (estado: string, fecha: string) => {
        if (!selectedId) return;
        setAnimals(list => list.map(a => (a.id === selectedId ? { ...a, subEstado: estado, subEstadoFecha: fecha } : a)));
        setDlgSub(false);
        doneAndBack();
    };
    const applySalida = (val: string) => {
        if (!selectedId) return;
        setAnimals(list => list.map(a => (a.id === selectedId ? { ...a, salidaAnimal: val } : a)));
        setDlgSalida(false);
        doneAndBack();
    };
    const applyCrotal = (nuevo: string) => {
        if (!selectedId) return;
        setAnimals(list => list.map(a => (a.id === selectedId ? { ...a, crotal: nuevo } : a)));
        setDlgCrotal(false);
        doneAndBack();
    };

    const HeaderResumen = () => (
        <View style={{ backgroundColor: '#F8FAFC', paddingTop: 10, paddingBottom: 12 }}>
            <View className="rounded-2xl border p-4 bg-white" style={{ borderColor: CARD_BORDER, marginHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="home-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                        {String(corral ?? '—')}
                    </Text>
                </View>
                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>Animales</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{totals.total}</Text>
                </View>
                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>No alimentados</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{totals.noFeed}</Text>
                </View>
                <View style={{ paddingTop: 8 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>% alimentado</Text>
                    <Progress percent={totals.pct} />
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <FlatList
                data={animals}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                    <AnimalCard
                        animal={item}
                        selected={selectedId === item.id}
                        onLongPress={() => setSelectedId(prev => (prev === item.id ? null : item.id))}
                    />
                )}
                ListHeaderComponent={HeaderResumen}
                stickyHeaderIndices={[0]}
                contentContainerStyle={{ paddingTop: 0, paddingBottom: 110 + insets.bottom }}
            />

            {/* Barra inferior */}
            <View
                style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 + insets.bottom,
                    backgroundColor: 'rgba(248,250,252,0.96)', borderTopWidth: 1, borderTopColor: '#E5E7EB',
                }}
            >
                {totals.total === 0 ? (
                    <TouchableOpacity
                        onPress={() => { }}
                        activeOpacity={0.9}
                        style={{ backgroundColor: BRAND, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Meter animales</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity
                            onPress={() => (selectedId ? drawer.show() : Alert.alert('Primero debes seleccionar un animal'))}
                            activeOpacity={0.9}
                            style={{ flex: 1, backgroundColor: BRAND, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Operaciones</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => (selectedId ? setSelectedId(null) : navigation.goBack())}
                            activeOpacity={0.9}
                            style={{ flex: 1, backgroundColor: '#E5E7EB', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ color: '#0f172a', fontWeight: '700' }}>{selectedId ? 'Cancelar' : 'Volver'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Drawer lateral derecho */}
            <Modal visible={drawer.open} transparent animationType="none" onRequestClose={drawer.hide}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={drawer.hide} />
                <Animated.View
                    style={{
                        position: 'absolute', top: 0, bottom: 0, right: 0, width: drawer.width,
                        backgroundColor: '#fff', paddingTop: 14, paddingHorizontal: 12,
                        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
                        transform: [{ translateX: drawer.tx }],
                        elevation: 12, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="options-outline" size={18} color="#0f172a" />
                        <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '900', fontSize: 16 }}>Acciones</Text>
                    </View>

                    <DrawerItem label="Curva" onPress={() => openAction('curva')} />
                    <DrawerItem label="Condición corporal" onPress={() => openAction('condicionCorporal')} />
                    <DrawerItem label="SubEstado" onPress={() => openAction('subEstado')} />
                    <DrawerItem label="Salida animal" onPress={() => openAction('salidaAnimal')} />
                    <DrawerItem label="Sustituir crotal" onPress={() => openAction('sustituirCrotal')} />
                    <DrawerItem label="Identificador animal anónimo" onPress={() => openAction('identificadorAnonimo')} />
                    <DrawerItem label="Salida maternidad" onPress={() => openAction('salidaMaternidad')} />
                </Animated.View>
            </Modal>

            {/* Diálogos */}
            <RadioDialog
                visible={dlgCurva}
                title="Seleccionar curva"
                options={['DEFECTO', 'PRIMALAS 2 FASE', 'CURVA GENERAL', 'ADAPTACION PRIM', 'ENFERMA', 'SEGUNDO CICLO']}
                current={selectedAnimal?.curva}
                onClose={() => setDlgCurva(false)}
                onAccept={applyCurva}
            />

            <RadioDialog
                visible={dlgCond}
                title="Condición corporal"
                options={['Extra gorda', 'Muy gorda', 'Gorda', 'Normal', 'Delgada', 'Muy delgada', 'Extra delgada']}
                current={selectedAnimal?.condicion}
                onClose={() => setDlgCond(false)}
                onAccept={applyCondicion}
            />

            <SubEstadoDialog
                visible={dlgSub}
                current={selectedAnimal?.subEstado}
                dateStr={selectedAnimal?.subEstadoFecha}
                onClose={() => setDlgSub(false)}
                onAccept={applySubEstado}
            />

            <RadioDialog
                visible={dlgSalida}
                title="Salida animal"
                options={['SIN SALIDA PROGRAMADA', 'SALIDA PROGRAMADA', 'SALIDA PROGRAMADA CON VACIO TOLVA', 'SALIDA MATERNIDAD']}
                current={selectedAnimal?.salidaAnimal}
                onClose={() => setDlgSalida(false)}
                onAccept={applySalida}
            />

            {selectedAnimal && (
                <CrotalDialog
                    visible={dlgCrotal}
                    oldCrotal={selectedAnimal.crotal}
                    onClose={() => setDlgCrotal(false)}
                    onAccept={applyCrotal}
                />
            )}
        </View>
    );
}
