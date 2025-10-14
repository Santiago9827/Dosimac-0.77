// CorralMaternidadResumenScreen.tsx
import React, { useMemo, useRef, useState } from 'react';
import {
    View, Text, TouchableOpacity, Pressable, Animated, Dimensions, Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RouteParams = {
    corral?: string | number;
    stats?: { total?: number; noFeed?: number };
};

const CARD_BORDER = '#E2E8F0';
const DOT_RED = '#EF4444';
const BRAND = '#4F46E5';

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

/** ---------- Drawer lateral (derecha) con secciones expandibles ---------- */
const useRightDrawer = () => {
    const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
    const [open, setOpen] = useState(false);
    // desde la derecha: parte fuera con +w y entra a 0
    const tx = useRef(new Animated.Value(w)).current;

    const show = () => {
        setOpen(true);
        Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    };
    const hide = () => {
        Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true }).start(({ finished }) => {
            if (finished) setOpen(false);
        });
    };

    return { open, show, hide, tx, width: w };
};

export default function CorralMaternidadResumenScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { corral, stats }: RouteParams = route.params ?? {};

    const { total, noFeed, pct } = useMemo(() => {
        const total = Number(stats?.total ?? 0);
        const noFeed = Number(stats?.noFeed ?? 0);
        const pct = total > 0 ? Math.round(((total - noFeed) / total) * 100) : 0;
        return { total, noFeed, pct };
    }, [stats]);

    const drawer = useRightDrawer();

    // acordeón: solo una sección abierta a la vez
    const [openMat, setOpenMat] = useState(true);
    const [openOps, setOpenOps] = useState(false);
    const toggleMat = () => setOpenMat(v => { const n = !v; if (n) setOpenOps(false); return n; });
    const toggleOps = () => setOpenOps(v => { const n = !v; if (n) setOpenMat(false); return n; });

    const DrawerItem = ({ label, onPress }: { label: string; onPress: () => void }) => (
        <Pressable
            onPress={onPress}
            android_ripple={{ color: '#e5e7eb' }}
            style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 }}
        >
            <Text style={{ color: '#0f172a', fontWeight: '600' }}>{label}</Text>
        </Pressable>
    );

    const DrawerSection = ({
        icon, title, open, onToggle, children,
    }: {
        icon: string; title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
    }) => (
        <View style={{ marginBottom: 12 }}>
            <Pressable
                onPress={onToggle}
                android_ripple={{ color: '#e5e7eb' }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 }}
            >
                <Ionicons name={icon as any} size={18} color={BRAND} />
                <Text style={{ marginLeft: 8, color: BRAND, fontWeight: '800', flex: 1 }}>{title}</Text>
                <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={16} color={BRAND} />
            </Pressable>

            {open && (
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, paddingVertical: 6 }}>
                    {children}
                </View>
            )}
        </View>
    );

    const go = (what: string) => {
        drawer.hide();
        console.log('acción:', what, 'corral:', corral);
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ padding: 20 }}>
            {/* Card resumen */}
            <View className="rounded-2xl border p-4 bg-white" style={{ borderColor: CARD_BORDER }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons name="home-outline" size={18} color="#0f172a" />
                        <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                            {String(corral ?? '—')}
                        </Text>
                    </View>
                    <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: DOT_RED }} />
                </View>

                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>Animales</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{total}</Text>
                </View>

                <View style={{ paddingVertical: 6 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>No alimentados</Text>
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, opacity: 0.8 }} />
                    <Text style={{ color: '#0f172a', fontWeight: '800', textAlign: 'right', marginTop: 6 }}>{noFeed}</Text>
                </View>

                <View style={{ paddingTop: 8 }}>
                    <Text style={{ color: '#64748B', marginBottom: 6 }}>% alimentado</Text>
                    <Progress percent={pct} />
                </View>
            </View>

            {/* Botones */}
            <View style={{ marginTop: 16, gap: 12 }}>
                {total === 0 ? (
                    <>
                        <TouchableOpacity
                            onPress={() => { }}
                            activeOpacity={0.9}
                            style={{ backgroundColor: BRAND, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-white font-semibold">Meter animales</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.9}
                            style={{ backgroundColor: '#E5E7EB', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-slate-900 font-semibold">Volver</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={drawer.show}
                            activeOpacity={0.9}
                            style={{ backgroundColor: BRAND, borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-white font-semibold">Opciones</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.9}
                            style={{ backgroundColor: '#E5E7EB', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text className="text-slate-900 font-semibold">Volver</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Drawer lateral derecho */}
            <Modal visible={drawer.open} transparent animationType="none" onRequestClose={drawer.hide}>
                {/* fondo */}
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={drawer.hide} />
                {/* panel */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,                 // 👈 anclado a la derecha
                        width: drawer.width,
                        backgroundColor: '#fff',
                        paddingTop: 14,
                        paddingHorizontal: 12,
                        borderTopLeftRadius: 16,  // 👈 redondeo del lado izquierdo
                        borderBottomLeftRadius: 16,
                        transform: [{ translateX: drawer.tx }], // desde +w → 0
                        elevation: 12,
                        shadowColor: '#000',
                        shadowOpacity: 0.18,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 6 },
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="options-outline" size={18} color="#0f172a" />
                        <Text style={{ marginLeft: 8, color: '#0f172a', fontWeight: '900', fontSize: 16 }}>Acciones</Text>
                    </View>

                    {/* <DrawerSection icon="female-outline" title="Maternidad" open={openMat} onToggle={toggleMat}>
            <DrawerItem label="Curva" onPress={() => go('curva')} />
            <DrawerItem label="Condición corporal" onPress={() => go('condicionCorporal')} />
            <DrawerItem label="SubEstado" onPress={() => go('subEstado')} />
            <DrawerItem label="Salida animal" onPress={() => go('salidaAnimal')} />
            <DrawerItem label="Sustituir crotal" onPress={() => go('sustituirCrotal')} />
            <DrawerItem label="Identificador animal anónimo" onPress={() => go('identificadorAnonimo')} />
            <DrawerItem label="Salida maternidad" onPress={() => go('salidaMaternidad')} />
          </DrawerSection> */}

                    {/* <DrawerSection icon="construct-outline" title="Operaciones" open={openOps} onToggle={toggleOps}> */}
                    {/* Si quieres que esta tenga otras opciones, cámbialas aquí */}
                    <DrawerItem label="Curva" onPress={() => go('ops_curva')} />
                    <DrawerItem label="Condición corporal" onPress={() => go('ops_condicionCorporal')} />
                    <DrawerItem label="SubEstado" onPress={() => go('ops_subEstado')} />
                    <DrawerItem label="Salida animal" onPress={() => go('ops_salidaAnimal')} />
                    <DrawerItem label="Sustituir crotal" onPress={() => go('ops_sustituirCrotal')} />
                    <DrawerItem label="Identificador animal anónimo" onPress={() => go('ops_identificadorAnonimo')} />
                    <DrawerItem label="Salida maternidad" onPress={() => go('ops_salidaMaternidad')} />
                    {/* </DrawerSection> */}
                </Animated.View>
            </Modal>
        </View>
    );
}
