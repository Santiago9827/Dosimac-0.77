import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Pressable, Animated, Dimensions, TextInput, StyleSheet, Platform } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import Icon from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { CerdoMaternidad } from '../../../assets';

type IoniconName = ComponentProps<typeof Icon>['name'];

const ipServer = 'http://192.168.1.238:3010';
const corralInfoUrl = (id: number) => `${ipServer}/corral/${id}`;

const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';

/** ===== util responsive ===== */
const useWinWidth = () => {
    const [w, setW] = React.useState(Dimensions.get('window').width);
    React.useEffect(() => {
        const sub = Dimensions.addEventListener('change', ({ window }) => setW(window.width));
        return () => (sub as any)?.remove?.();
    }, []);
    return w;
};

const useRightDrawer = () => {
    const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
    const [open, setOpen] = useState(false);
    const tx = useRef(new Animated.Value(w)).current;

    const show = () => {
        setOpen(true);
        Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    };

    const hide = (after?: () => void) => {
        Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true })
            .start(({ finished }) => {
                if (finished) {
                    setOpen(false);
                    requestAnimationFrame(() => after?.());
                }
            });
    };

    return { open, show, hide, tx, width: w };
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

/** ===== Diálogos reutilizados ===== */
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
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{title}</Text>
                {options.map(op => (
                    <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={styles.modalOptionRow}>
                        <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                        <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
                    </Pressable>
                ))}
                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGray]}><Text style={styles.btnGrayText}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => onAccept(val)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Aceptar</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function SubEstadoDialog({
    visible, current, dateStr, onClose, onAccept,
}: {
    visible: boolean; current?: string; dateStr?: string;
    onClose: () => void; onAccept: (estado: string, fecha: string) => void;
}) {
    const opciones = ['PREPARTO', 'LACTANCIA', 'DESTETE'];
    const [val, setVal] = useState(current || opciones[0]);
    const hoy = useMemo(() => dateStr ?? todayStr(), [dateStr]);
    useEffect(() => setVal(current || opciones[0]), [current]);
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>SubEstado</Text>
                {opciones.map(op => (
                    <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={styles.modalOptionRow}>
                        <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
                        <Text style={{ marginLeft: 10, color: '#0f172a', fontWeight: val === op ? '800' as const : '600' }}>{op}</Text>
                    </Pressable>
                ))}

                <View style={styles.fieldBox}>
                    <Text style={{ color: '#64748B' }}>Fecha</Text>
                    <Text style={{ color: '#0f172a', fontWeight: '800', marginTop: 4 }}>{hoy}</Text>
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGray]}><Text style={styles.btnGrayText}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => onAccept(val, hoy)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Aceptar</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function CrotalDialog({
    visible, oldCrotal, onClose, onAccept,
}: {
    visible: boolean; oldCrotal: string; onClose: () => void; onAccept: (nuevo: string) => void;
}) {
    const [nuevo, setNuevo] = useState('');
    useEffect(() => setNuevo(''), [visible]);
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={onClose} />
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Sustituir crotal</Text>
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
                        style={styles.input}
                    />
                </View>
                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGray]}><Text style={styles.btnGrayText}>Cancelar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => onAccept(nuevo.trim())} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Aceptar</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function ConfirmDialog({
    visible, title, message, onCancel, onAccept,
}: {
    visible: boolean; title: string; message?: string; onCancel: () => void; onAccept: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Pressable onPress={onCancel} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                <View style={styles.confirmCard}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    {message ? <Text style={{ color: '#334155', marginBottom: 12 }}>{message}</Text> : null}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.btnGray]}><Text style={styles.btnGrayText}>Cancelar</Text></TouchableOpacity>
                        <TouchableOpacity onPress={onAccept} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Aceptar</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function LactanciaFormModal({
    visible, onClose, onContinue,
}: {
    visible: boolean;
    onClose: () => void;
    onContinue: (data: { totalLechones?: string; nacidosVivos?: string; nacidosMuertos?: string; donados?: string; adoptados?: string; viables?: string; }) => void;
}) {
    const [form, setForm] = useState({
        totalLechones: '', nacidosVivos: '', nacidosMuertos: '',
        donados: '', adoptados: '', viables: '',
    });

    useEffect(() => {
        if (visible) {
            setForm({ totalLechones: '', nacidosVivos: '', nacidosMuertos: '', donados: '', adoptados: '', viables: '' });
        }
    }, [visible]);

    const onlyNum = (t: string) => t.replace(/[^0-9]/g, '');
    const step = (k: keyof typeof form, delta: number) =>
        setForm(s => {
            const n = parseInt(s[k] || '0', 10) || 0;
            const v = Math.max(0, n + delta);
            return { ...s, [k]: String(v) };
        });

    const MAX_BODY_H = Math.min(Dimensions.get('window').height * 0.48, 360);

    const Row = ({ label, k }: { label: string; k: keyof typeof form }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', flexShrink: 1, paddingRight: 12 }}>{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Pressable onPress={() => step(k, -1)} android_ripple={{ color: '#e5e7eb' }} style={styles.stepperBtn}><Text style={{ color: '#64748B', fontSize: 16 }}>–</Text></Pressable>
                <TextInput
                    value={form[k]}
                    onChangeText={(t) => setForm(s => ({ ...s, [k]: onlyNum(t) }))}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    inputMode="numeric"
                    maxLength={4}
                    style={styles.stepperInput}
                    accessibilityLabel={label}
                />
                <Pressable onPress={() => step(k, +1)} android_ripple={{ color: '#e5e7eb' }} style={styles.stepperBtn}><Text style={{ color: '#64748B', fontSize: 16 }}>+</Text></Pressable>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                <View style={styles.lactanciaCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={styles.roundIcon}><Icon name="medkit-outline" size={18} color={BRAND} /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a' }}>Pasar a lactancia</Text>
                            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>Todos los campos son opcionales</Text>
                        </View>
                        <Pressable onPress={onClose} hitSlop={10} android_ripple={{ color: '#e5e7eb', borderless: true }} style={{ padding: 4, marginLeft: 6 }}>
                            <Icon name="close" size={20} color="#64748B" />
                        </Pressable>
                    </View>

                    <ScrollView style={{ maxHeight: MAX_BODY_H }} contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                        <Row label="Total lechones" k="totalLechones" />
                        <Row label="Nacidos vivos" k="nacidosVivos" />
                        <Row label="Nacidos muertos" k="nacidosMuertos" />
                        <Row label="Donados" k="donados" />
                        <Row label="Adoptados" k="adoptados" />
                        <Row label="Viables" k="viables" />
                    </ScrollView>

                    <View style={styles.separator} />
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnOutline]}><Text style={styles.btnOutlineText}>Cancelar</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => onContinue(form)} style={[styles.btn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>Siguiente</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function NextStepModal({
    visible, onClose, onPasarDestete, onSalida,
}: { visible: boolean; onClose: () => void; onPasarDestete: () => void; onSalida: () => void; }) {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Pressable onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }} />
                <View style={styles.nextCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <View style={styles.roundIconSm}><Icon name="arrow-forward-circle-outline" size={16} color={BRAND} /></View>
                        <Text style={{ flex: 1, fontWeight: '900', fontSize: 16, color: '#0f172a' }}>Siguiente operación</Text>
                        <Pressable onPress={onClose} hitSlop={8} android_ripple={{ color: '#e5e7eb', borderless: true }}><Icon name="close" size={20} color="#64748B" /></Pressable>
                    </View>

                    <Text style={{ color: '#64748B', marginBottom: 8, fontSize: 13 }}>Elige una opción:</Text>

                    <View style={styles.groupBox}>
                        <Pressable onPress={onPasarDestete} android_ripple={{ color: '#e5e7eb' }} style={styles.groupItem}>
                            <Icon name="git-branch-outline" size={18} color={BRAND} />
                            <Text style={styles.groupText}>Pasar a destete</Text>
                            <View style={{ flex: 1 }} />
                            <Icon name="chevron-forward" size={18} color="#94A3B8" />
                        </Pressable>
                        <View style={styles.groupDivider} />
                        <Pressable onPress={onSalida} android_ripple={{ color: '#e5e7eb' }} style={styles.groupItem}>
                            <Icon name="exit-outline" size={18} color="#0f172a" />
                            <Text style={styles.groupText}>Salida</Text>
                            <View style={{ flex: 1 }} />
                            <Icon name="chevron-forward" size={18} color="#94A3B8" />
                        </Pressable>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                        <TouchableOpacity onPress={onClose} activeOpacity={0.9} style={styles.smallGrayBtn}>
                            <Text style={styles.btnGrayText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function DrawerGrabber() {
    return (
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <View style={{ width: 42, height: 4, borderRadius: 999, backgroundColor: '#CBD5E1' }} />
        </View>
    );
}

function SectionTitle({ icon, title, subtitle }: { icon: IoniconName; title: string; subtitle?: string }) {
    return (
        <View style={styles.sectionTitle}>
            <View style={styles.sectionIcon}><Icon name={icon} size={18} color={BRAND} /></View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 16 }}>{title}</Text>
                {!!subtitle && <Text style={{ color: '#64748B', fontSize: 12 }}>{subtitle}</Text>}
            </View>
        </View>
    );
}

function ListItem({ icon, label, onPress, disabled }: { icon?: IoniconName; label: string; onPress: () => void; disabled?: boolean; }) {
    return (
        <Pressable onPress={disabled ? undefined : onPress} disabled={disabled} android_ripple={disabled ? undefined : { color: '#e5e7eb' }} style={[styles.listItem, disabled && { opacity: 0.45 }]}>
            {icon && <Icon name={icon} size={18} color={disabled ? '#94A3B8' : '#334155'} />}
            <Text style={[styles.listItemText, { marginLeft: icon ? 10 : 0 }, disabled && { color: '#94A3B8' }]}>{label}</Text>
            <Icon name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>
    );
}

function ListGroup({ children }: { children: React.ReactNode }) {
    return (
        <View style={styles.listGroup}>{children}</View>
    );
}
const Divider = () => <View style={{ height: 1, backgroundColor: CARD_BORDER }} />;

/** ===== PANTALLA: GET ANIMAL DETAIL (Gestación) ===== */
export const GetAnimalDetail = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const params = route.params ?? {};
    const { corralId = 0, mockEmpty, mockData, deviceError, diasSinAlimentar, statusMessage } = params;
    const navigation = useNavigation<NavigationProp<any>>();

    const [corralInfo, setCorralInfo] = useState<any | null>(null);
    const [animalState, setAnimalState] = useState({ crotal: '—', curva: '—', condicion: '—', subEstado: '—', subEstadoFecha: todayStr() });
    const sub = (animalState.subEstado || '').toUpperCase();

    const [isDeviceError] = useState<boolean>(!!deviceError);
    const [hasDiasSinAlimentar] = useState<boolean>(!!diasSinAlimentar);

    const [dlgLactancia, setDlgLactancia] = useState(false);
    const [dlgNextStep, setDlgNextStep] = useState(false);
    const [dlgSalidaMotivo, setDlgSalidaMotivo] = useState(false);

    const [confirm, setConfirm] = useState<{ visible: boolean; title: string; message?: string; onAccept?: () => void; }>({ visible: false, title: '' });
    const [requestError, setRequestError] = useState(false);

    const drawer = useRightDrawer();
    const [dlgCurva, setDlgCurva] = useState(false);
    const [dlgCond, setDlgCond] = useState(false);
    const [dlgSub, setDlgSub] = useState(false);
    const [dlgSalida, setDlgSalida] = useState(false);
    const [dlgCrotal, setDlgCrotal] = useState(false);

    const [opsH, setOpsH] = useState(0);
    const winH = Dimensions.get('window').height;
    const isWeb = Platform.OS === 'web';

    // KPI / histogram responsive
    const winW = useWinWidth();
    const isDesktop = Platform.OS === 'web' && winW >= 900;
    const isLg = Platform.OS === 'web' && winW >= 1200;
    const isPhone = winW <= 420;
    const isMd = isDesktop && winW < 1200;

    const useRowForKpi = true;
    const KPI_HISTO_GAP = 10;
    const kpiFontSize = isLg ? 62 : (isDesktop ? 54 : (isPhone ? 52 : 46));
    const HISTO_BG_H = isMd ? 150 : 88;
    const barW = isDesktop ? 18 : (isPhone ? 9 : 14);
    const BAR_GAP = isDesktop ? 6 : 4;
    const HISTO_WIDTH = useRowForKpi ? (isDesktop ? Math.min(440, Math.round(winW * 0.34)) : 108) : 260;
    const HISTO_NUDGE_Y = isDesktop ? 8 : 0;

    const [contentW, setContentW] = useState(0);
    const THREE_COL_MIN = 980;
    const GRID_COLS = (Platform.OS === 'web' && contentW >= THREE_COL_MIN) ? 3 : 2;
    const GRID_GAP = isPhone ? 10 : 14;
    const CONTENT_PAD_H = isPhone ? 16 : 24;
    const GRID_AVAILABLE_W = (contentW || winW) - CONTENT_PAD_H * 2;
    const infoCellW = Math.floor((GRID_AVAILABLE_W - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS);
    const pctOffsetY = isDesktop ? -28 : -22;

    const [showKpiTip, setShowKpiTip] = useState(false);
    const [hoverBarIdx, setHoverBarIdx] = useState<number | null>(null);
    const placeTipAbove = Platform.OS !== 'web' || winW <= 560;
    const moveDayToTitle = winW <= 560;
    const isNarrow = winW <= 560;

    // datos
    useEffect(() => {
        if (mockEmpty) { setCorralInfo({}); return; }
        if (mockData) { setCorralInfo(mockData); return; }
        const url = corralInfoUrl(corralId || 19);
        axios.get(url).then(res => setCorralInfo(res.data)).catch(() => setRequestError(true));
    }, [corralId, mockEmpty, mockData]);

    const animal = corralInfo?.animal;
    const hasAnimal = !!animal;

    useEffect(() => {
        if (!animal) return;
        setAnimalState(s => ({
            ...s,
            crotal: animal.crotal ?? s.crotal,
            curva: animal.curva ?? s.curva,
            subEstado: animal.subEstado ?? s.subEstado,
            subEstadoFecha: animal.subEstadoFecha ?? s.subEstadoFecha,
        }));
    }, [animal]);

    const openAction = (key: string) => {
        drawer.hide(() => {
            if (key === 'curva') setDlgCurva(true);
            else if (key === 'condicionCorporal') setDlgCond(true);
            else if (key === 'subEstado') setDlgSub(true);
            else if (key === 'salidaAnimal') setDlgSalida(true);
            else if (key === 'sustituirCrotal') setDlgCrotal(true);
        });
    };

    const resetAnimalState = () => ({ crotal: '—', curva: '—', condicion: '—', subEstado: '—', subEstadoFecha: todayStr() });
    const simulateRemoveAnimal = () => { setCorralInfo((c: any) => ({ ...(c || {}), animal: null })); setAnimalState(resetAnimalState()); };

    const applyCurva = (val: string) => { setAnimalState(s => ({ ...s, curva: val })); setDlgCurva(false); };
    const applyCondicion = (val: string) => { setAnimalState(s => ({ ...s, condicion: val })); setDlgCond(false); };
    const applySubEstado = (estado: string, fecha: string) => { setAnimalState(s => ({ ...s, subEstado: estado, subEstadoFecha: fecha })); setDlgSub(false); };
    const applySalida = () => setDlgSalida(false);
    const applyCrotal = (nuevo: string) => { if (!nuevo) return; setAnimalState(s => ({ ...s, crotal: nuevo })); setDlgCrotal(false); };

    const askConfirm = (title: string, message: string, onAccept: () => void) => setConfirm({ visible: true, title, message, onAccept });

    const onContinueLactancia = (data: any) => {
        askConfirm('Pasar a lactancia', '¿Seguro de pasar a la siguiente operación?', () => {
            setAnimalState(s => ({ ...s, subEstado: 'LACTANCIA', subEstadoFecha: todayStr() }));
            setDlgLactancia(false);
        });
    };

    const onPasarDestete = () => {
        askConfirm('Pasar a destete', '¿Seguro de pasar a la siguiente operación?', () => {
            setAnimalState(s => ({ ...s, subEstado: 'DESTETE', subEstadoFecha: todayStr() }));
            setDlgNextStep(false);
        });
    };

    const onSalida = () => setDlgSalidaMotivo(true);
    const onAcceptSalidaMotivo = (motivo: string) => {
        askConfirm('Confirmar salida', `Motivo: ${motivo}. ¿Seguro?`, () => {
            setAnimalState(s => ({ ...s, subEstado: 'SALIDA', subEstadoFecha: todayStr() }));
            setDlgSalidaMotivo(false);
            setDlgNextStep(false);
            simulateRemoveAnimal();
        });
    };

    const objetivo = animal?.consumo?.objetivo ?? 12000;
    const actual = animal?.consumo?.actual ?? 11000;
    const pct = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: '#F1F5F9' }} contentContainerStyle={{ paddingBottom: opsH + insets.bottom + 8 }}>
                <View onLayout={(e) => setContentW(e.nativeEvent.layout.width)} style={[styles.card, { paddingHorizontal: isPhone ? 16 : 24, minHeight: winH - (opsH + (Platform.OS === 'web' ? 64 : 56) + insets.bottom) }]}>

                    {hasAnimal && (
                        <Image source={CerdoMaternidad} resizeMode="contain" style={[
                            styles.pigBg,
                            isLg ? { opacity: 0.30, transform: [{ scale: 1.28 }], top: 240 }
                                : isMd ? { opacity: 0.26, transform: [{ scale: 1.18 }], top: 240 }
                                    : { opacity: 0.22, transform: [{ scale: 1.08 }], top: 300 },
                        ]} />
                    )}

                    {(isDeviceError || !!statusMessage) && (
                        <View style={[styles.errorBand, { marginTop: 8 }]}>
                            <Text style={styles.errorText}>{statusMessage || 'Error: El motor no funciona'}</Text>
                        </View>
                    )}

                    {!hasAnimal ? (
                        <EmptyCorralCard
                            corralId={corralId}
                            onPressAdd={() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId } as never)}
                        />
                    ) : (
                        <>
                            {/* ID · Crotal · Día · Ciclo */}
                            <View style={[styles.metaRowEven, isNarrow && styles.metaRowTight]}>
                                <View style={styles.metaCellEven}>
                                    <Text style={[styles.chipLabel, isNarrow && styles.chipLabelSm]}>ID</Text>
                                    <Text style={[styles.chipValue, isNarrow && styles.chipValueSm]}>{animal?.id ?? '—'}</Text>
                                </View>

                                <View style={[styles.metaCellEven, styles.metaCellGrow2]}>
                                    <Text style={[styles.chipLabel, isNarrow && styles.chipLabelSm]}>Crotal</Text>
                                    <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={[styles.chipValue, isNarrow && styles.chipValueSm, { flexShrink: 1 }]}>{animal?.crotal ?? '—'}</Text>
                                </View>

                                {!moveDayToTitle && (
                                    <View style={styles.metaCellEven}>
                                        <Text style={[styles.chipLabel, isNarrow && styles.chipLabelSm]}>Día</Text>
                                        <Text style={[styles.chipValue, isNarrow && styles.chipValueSm]}>{animal?.dia ?? '—'}</Text>
                                    </View>
                                )}

                                <View style={styles.metaCellEven}>
                                    <Text style={[styles.chipLabel, isNarrow && styles.chipLabelSm]}>Ciclo</Text>
                                    <Text style={[styles.chipValue, isNarrow && styles.chipValueSm]}>{animal?.ciclo ?? '—'}</Text>
                                </View>
                            </View>

                            {/* Subestado + Día (movido) */}
                            <View style={[styles.headerRowMd, { justifyContent: 'space-between' }]}>
                                <Text style={styles.subTitle}>{animalState.subEstado ?? '—'}</Text>
                                {moveDayToTitle && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.chipLabel}>Día</Text>
                                        <Text style={styles.chipValue}>{animal?.dia ?? '—'}</Text>
                                    </View>
                                )}
                            </View>

                            {/* KPI + Histograma */}
                            <View style={[styles.kpiRow, styles.kpiRowMd]}>
                                <View style={[styles.kpiLeft, { marginRight: KPI_HISTO_GAP }]}>
                                    <View
                                        style={{ position: 'relative', alignSelf: 'flex-start' }}
                                        {...(isWeb ? { onMouseEnter: () => setShowKpiTip(true), onMouseLeave: () => setShowKpiTip(false) } : {})}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                                            <Text style={[styles.kpiNumber, { fontSize: kpiFontSize }]}>{actual.toLocaleString('es-ES')}</Text>
                                            <Text style={styles.kpiUnit}>gr</Text>
                                        </View>

                                        <View style={[styles.progressWrap, { width: '100%' }]}>
                                            <View style={styles.barBg} />
                                            <View style={[styles.barFill, { width: `${Math.min(100, pct)}%` }]} />
                                            <View style={[styles.pctAnchor, { left: `${Math.min(100, pct)}%`, top: pctOffsetY }]} />
                                        </View>

                                        {showKpiTip && (
                                            <View style={[
                                                placeTipAbove ? styles.tipTopBig : styles.tipRightBig,
                                                placeTipAbove ? { left: '50%', transform: [{ translateX: -90 }] } : null,
                                            ]}>
                                                <Text style={styles.tipTitle}>Consumo</Text>
                                                <Text style={styles.tipTextBig}>{`${actual.toLocaleString('es-ES')}/${objetivo.toLocaleString('es-ES')} gr`}</Text>
                                                <Text style={[styles.tipTextBig, { opacity: 0.85 }]}>{pct}%</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={[styles.histogram, { width: HISTO_WIDTH, flexShrink: 0, transform: [{ translateY: HISTO_NUDGE_Y }], marginTop: 0 }]}>
                                    <View style={styles.histoBarsRow}>
                                        {[
                                            { pct: 1.00, color: '#10B981' },
                                            { pct: 0.85, color: '#10B981' },
                                            { pct: 0.40, color: '#EF4444' },
                                            { pct: 0.75, color: '#10B981' },
                                            { pct: 0.33, color: '#10B981' },
                                            { pct: 0.00, color: '#94A3B8' },
                                            { pct: 0.00, color: '#94A3B8' },
                                            { pct: 0.00, color: '#94A3B8' },
                                        ].map((b, i) => {
                                            const CURRENT_BAR_INDEX = 4;
                                            const CURRENT_BAR_SCALE = isDesktop ? 1.8 : 1.6;
                                            const CURRENT_BORDER_W = 2;
                                            const isCurrent = i === CURRENT_BAR_INDEX;
                                            const w = isCurrent ? barW * CURRENT_BAR_SCALE : barW;
                                            const radius = Math.round(w / 2);
                                            const hFill = Math.round(Math.max(0, Math.min(1, b.pct)) * HISTO_BG_H);

                                            return (
                                                <View key={i} style={{ marginLeft: i ? BAR_GAP : 0, width: w, height: HISTO_BG_H, position: 'relative', justifyContent: 'flex-end' }}>
                                                    <Pressable
                                                        onPressIn={() => setHoverBarIdx(i)}
                                                        onPressOut={() => setHoverBarIdx(null)}
                                                        onHoverIn={() => setHoverBarIdx(i)}
                                                        onHoverOut={() => setHoverBarIdx(null)}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Intervalo ${i + 1}, ${Math.round(b.pct * 100)}%`}
                                                        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: radius }}
                                                    >
                                                        <View style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: HISTO_BG_H, backgroundColor: '#CBD5E1', borderRadius: radius, overflow: 'hidden', borderWidth: isCurrent ? CURRENT_BORDER_W : 0, borderColor: isCurrent ? '#000' : 'transparent', justifyContent: 'flex-end' }}>
                                                            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: hFill, backgroundColor: b.color, borderRadius: radius }} />
                                                        </View>
                                                    </Pressable>

                                                    {hoverBarIdx === i && (
                                                        <View style={styles.miniTip}>
                                                            <Text style={styles.tipText}>{Math.round(b.pct * 100)}%</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>

                            {hasDiasSinAlimentar && (
                                <>
                                    <View style={{ height: 20 }} />
                                    <View style={styles.errorBand}><Text style={styles.errorText}>2 días sin alimentar</Text></View>
                                    <View style={{ height: 2 }} />
                                </>
                            )}

                            {/* GRID de info */}
                            <View style={[styles.infoGrid, { columnGap: GRID_GAP, rowGap: GRID_GAP }]}>
                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Curva</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, styles.pill, isPhone && styles.pillSm]}>{animal?.curva ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Corrección</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.correccion ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Fecha entrada</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.fechas?.entrada ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Fecha parto</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.fechas?.parto ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Nave</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.nave ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: infoCellW }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Corral</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.corral ?? corralId ?? '—'}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCell, { width: '100%' }]}>
                                    <Text style={[styles.infoLabel, isPhone && styles.infoLabelSm]}>Última alimentación</Text>
                                    <View style={styles.infoRow}>
                                        <Icon name="book-outline" size={18} color="#0f172a" />
                                        <Text style={[styles.infoValue, isPhone && styles.infoValueSm]}>{animal?.ultimaAlimentacion ?? '—'}</Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Barra inferior (Operaciones) */}
            < View
                onLayout={e => setOpsH(e.nativeEvent.layout.height)}
                style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 8 + insets.bottom,
                    backgroundColor: 'rgba(248,250,252,0.96)',
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                }}
            >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => drawer.show()}
                        activeOpacity={0.9}
                        style={{
                            flex: 1,
                            backgroundColor: BRAND,
                            borderRadius: 12,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Operaciones</Text>
                    </TouchableOpacity>
                </View>
            </View >

            {/* Drawer lateral derecho */}
            <Modal visible={drawer.open} transparent animationType="none" onRequestClose={() => drawer.hide()}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} onPress={() => drawer.hide()} />
                <Animated.View
                    style={[
                        styles.drawerBase,
                        { width: drawer.width, transform: [{ translateX: drawer.tx }] }
                    ]}
                >
                    <DrawerGrabber />

                    {/* Encabezado igual que en maternidad */}
                    <SectionTitle icon="arrow-forward-circle-outline" title="Siguiente operación" subtitle="Elige la siguiente acción para este animal" />

                    {!hasAnimal ? (
                        <ListGroup>
                            <ListItem icon="add-circle-outline" label="Introducir animal" onPress={() => drawer.hide(() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId } as never))} />
                        </ListGroup>
                    ) : sub === 'PREPARTO' ? (
                        <ListGroup>
                            <ListItem icon="medkit-outline" label="Pasar a lactancia" onPress={() => drawer.hide(() => setDlgLactancia(true))} />
                        </ListGroup>
                    ) : sub === 'LACTANCIA' ? (
                        <ListGroup>
                            <ListItem icon="flag-outline" label="Siguiente paso" onPress={() => drawer.hide(() => setDlgNextStep(true))} />
                        </ListGroup>
                    ) : sub === 'DESTETE' ? (
                        <ListGroup>
                            <ListItem icon="exit-outline" label="Salida animal" onPress={() => drawer.hide(() => setDlgSalidaMotivo(true))} />
                        </ListGroup>
                    ) : (
                        <ListGroup>
                            <ListItem icon="arrow-forward-outline" label="Siguiente paso" onPress={() => drawer.hide(() => setDlgNextStep(true))} />
                        </ListGroup>
                    )}

                    <View style={{ height: 1, backgroundColor: CARD_BORDER, marginVertical: 12 }} />

                    <SectionTitle icon="options-outline" title="Acciones" />
                    <ListGroup>
                        <ListItem icon="pulse-outline" label="Curva" onPress={() => openAction('curva')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="body-outline" label="Condición corporal" onPress={() => openAction('condicionCorporal')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="flag-outline" label="SubEstado" onPress={() => openAction('subEstado')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="exit-outline" label="Salida animal" onPress={() => openAction('salidaAnimal')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="pricetags-outline" label="Sustituir crotal" onPress={() => openAction('sustituirCrotal')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="finger-print-outline" label="Identificador animal anónimo" onPress={() => openAction('identificadorAnonimo')} disabled={!hasAnimal} />
                        <Divider />
                        <ListItem icon="home-outline" label="Salida maternidad" onPress={() => openAction('salidaMaternidad')} disabled={!hasAnimal} />
                    </ListGroup>
                </Animated.View>
            </Modal>

            {/* Diálogos */}
            <RadioDialog visible={dlgCurva} title="Seleccionar curva" options={['DEFECTO', 'PRIMALAS 2 FASE', 'CURVA GENERAL', 'ADAPTACION PRIM', 'ENFERMA', 'SEGUNDO CICLO']} current={animalState.curva} onClose={() => setDlgCurva(false)} onAccept={applyCurva} />
            <RadioDialog visible={dlgCond} title="Condición corporal" options={['Extra gorda', 'Muy gorda', 'Gorda', 'Normal', 'Delgada', 'Muy delgada', 'Extra delgada']} current={animalState.condicion} onClose={() => setDlgCond(false)} onAccept={applyCondicion} />
            <SubEstadoDialog visible={dlgSub} current={animalState.subEstado} dateStr={animalState.subEstadoFecha} onClose={() => setDlgSub(false)} onAccept={applySubEstado} />
            <RadioDialog visible={dlgSalida} title="Salida animal" options={['SIN SALIDA PROGRAMADA', 'SALIDA PROGRAMADA', 'SALIDA PROGRAMADA CON VACIO TOLVA', 'SALIDA MATERNIDAD']} current={undefined} onClose={() => setDlgSalida(false)} onAccept={applySalida} />
            <CrotalDialog visible={dlgCrotal} oldCrotal={animalState.crotal} onClose={() => setDlgCrotal(false)} onAccept={applyCrotal} />
            <LactanciaFormModal visible={dlgLactancia} onClose={() => setDlgLactancia(false)} onContinue={onContinueLactancia} />
            <NextStepModal visible={!drawer.open && dlgNextStep} onClose={() => setDlgNextStep(false)} onPasarDestete={onPasarDestete} onSalida={onSalida} />
            <RadioDialog visible={dlgSalidaMotivo} title="Motivo de salida" options={['Correcto', 'Aborto', 'Muerta']} current={undefined} onClose={() => setDlgSalidaMotivo(false)} onAccept={onAcceptSalidaMotivo} />
            <ConfirmDialog visible={confirm.visible} title={confirm.title} message={confirm.message} onCancel={() => setConfirm(c => ({ ...c, visible: false }))} onAccept={() => { const cb = confirm.onAccept; setConfirm(c => ({ ...c, visible: false })); cb && cb(); }} />
        </View>
    );
};

/** ===== Estilos (idénticos a la pantalla de maternidad) ===== */
const styles = StyleSheet.create({
    card: { width: '100%', alignSelf: 'stretch', paddingTop: 12, paddingBottom: 16, position: 'relative' },

    pigBg: { position: 'absolute', left: '5%', width: '90%', height: 500, alignSelf: 'center', zIndex: -1 },

    errorBand: { minHeight: 36, width: '100%', backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
    errorText: { color: '#FFFFFF', fontSize: 16, fontWeight: Platform.OS === 'web' ? '600' : '400', textAlign: 'center' },

    metaRowEven: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 18 },
    metaCellEven: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 0 },
    metaCellGrow2: { flexGrow: 2, flexBasis: 0 },
    metaRowTight: { columnGap: 8 },

    chipLabel: { fontSize: 16, color: '#475569', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    chipValue: { marginLeft: 8, fontSize: 16, color: '#334155', fontWeight: '600' },
    chipLabelSm: { fontSize: 12, paddingHorizontal: 6, paddingVertical: 1 },
    chipValueSm: { fontSize: 12 },

    headerRowMd: { marginTop: 16, flexDirection: 'row', alignItems: 'center' },
    subTitle: { fontSize: 22, color: '#1E3A8A', fontWeight: '700' },

    kpiRow: { marginTop: 12, flexDirection: 'column', rowGap: 12, alignItems: 'stretch' },
    kpiRowMd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-start', columnGap: 4 },
    kpiLeft: { flexGrow: 0, flexShrink: 1, minWidth: 0, paddingRight: 8 },
    kpiNumber: { fontSize: 54, color: '#475569', fontWeight: '700', letterSpacing: -1.5 },
    kpiUnit: { fontSize: 18, color: '#475569', marginLeft: 6 },

    barBg: { height: 14, borderRadius: 999, backgroundColor: '#D1D5DB', width: '100%' },
    barFill: { position: 'absolute', left: 0, top: 0, height: 14, borderRadius: 999, backgroundColor: '#22C55E' },
    progressWrap: { marginTop: 8, marginBottom: 10, position: 'relative' },
    pctAnchor: { position: 'absolute', transform: [{ translateX: -16 }] },

    histogram: { flexDirection: 'column', alignItems: 'flex-end', marginTop: 0, marginBottom: 2 },
    histoBarsRow: { flexDirection: 'row', alignItems: 'flex-end', alignSelf: 'flex-end' },

    miniTip: {
        position: 'absolute',
        bottom: 88 + 6,
        left: '50%',
        transform: [{ translateX: -18 }],
        backgroundColor: '#0f172a',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        zIndex: 10,
    },

    tipTopBig: {
        position: 'absolute',
        bottom: 46,
        backgroundColor: '#0f172a',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        minWidth: 180,
    },
    tipRightBig: {
        position: 'absolute',
        left: '100%',
        top: -6,
        marginLeft: 8,
        backgroundColor: '#0f172a',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        minWidth: 180,
    },
    tipTitle: { color: '#E2E8F0', fontWeight: '800', fontSize: 12, marginBottom: 2 },
    tipText: { color: '#F8FAFC', fontWeight: '800' },
    tipTextBig: { color: '#F8FAFC', fontWeight: '800', fontSize: 16 },

    infoGrid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap' },
    infoCell: {},
    infoLabel: { fontSize: 22, color: '#64748B' },
    infoRow: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoValue: { fontSize: 18, color: '#334155', fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : (Platform.OS === 'android' ? 'monospace' : undefined) },
    infoLabelSm: { fontSize: 18 },
    infoValueSm: { fontSize: 16 },
    pill: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2, fontWeight: '800', color: '#0f172a' },
    pillSm: { paddingHorizontal: 8, paddingVertical: 1 },

    sectionTitle: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', marginBottom: 10 },
    sectionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 },

    listGroup: { borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
    listItemText: { color: '#0F172A', fontWeight: '800', flex: 1 },

    modalCard: { position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
    modalTitle: { fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 },
    modalOptionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    modalButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },

    btn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    btnGray: { backgroundColor: '#E5E7EB' },
    btnGrayText: { color: '#0f172a', fontWeight: '700' },
    btnPrimary: { backgroundColor: BRAND },
    btnPrimaryText: { color: '#fff', fontWeight: '700' },
    btnOutline: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER },
    btnOutlineText: { color: '#0f172a', fontWeight: '700' },

    input: { borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10, paddingHorizontal: 12, height: 44, color: '#0f172a' },
    fieldBox: { marginTop: 12, padding: 12, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10 },

    lactanciaCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 18, width: '100%', maxWidth: 520, alignSelf: 'center' },
    separator: { height: 1, backgroundColor: CARD_BORDER, marginTop: 10, marginBottom: 8 },
    stepperBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center' },
    stepperInput: { width: 90, height: 38, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 999, paddingHorizontal: 12, textAlign: 'center', color: '#0f172a', fontWeight: '700' },
    roundIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    roundIconSm: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 8 },

    nextCard: { backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 18, width: '100%', maxWidth: 480, alignSelf: 'center' },

    groupBox: { borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12, overflow: 'hidden' },
    groupItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
    groupText: { marginLeft: 10, fontSize: 15, color: '#0f172a', fontWeight: '700' },
    groupDivider: { height: 1, backgroundColor: CARD_BORDER },

    smallGrayBtn: { height: 36, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center' },

    opsBarBase: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        paddingHorizontal: 20, paddingTop: 8,
        backgroundColor: 'rgba(248,250,252,0.96)',
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
    },
    drawerBase: {
        position: 'absolute',
        top: 0, bottom: 0, right: 0,
        backgroundColor: '#fff',
        paddingTop: 14, paddingHorizontal: 12,
        borderTopLeftRadius: 16, borderBottomLeftRadius: 16,
        elevation: 12,
        shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },


    confirmCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: CARD_BORDER,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
        width: '100%', maxWidth: 520, alignSelf: 'center',
    },
    opsRow: { flexDirection: 'row', gap: 12 },
    opsButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#111827',
    },
    opsButtonText: { color: '#fff', fontWeight: '700' },

});

/** CTA vacio reutilizado (idéntico) */
const EmptyCorralCard = ({
    corralId, onPressAdd, buttonVariant = 'secondary',
}: { corralId: number | string; onPressAdd?: () => void; buttonVariant?: 'primary' | 'secondary' | 'ghost'; }) => {
    const baseBtn = { height: 42, borderRadius: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', width: '75%' } as const;
    const styleByVariant: Record<string, any> = {
        primary: { backgroundColor: BRAND },
        secondary: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER },
        ghost: { backgroundColor: 'transparent' },
    };
    const textColorByVariant: Record<string, string> = { primary: '#fff', secondary: BRAND, ghost: BRAND };

    return (
        <View style={{ marginTop: 24, alignItems: 'center' }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Icon name="warning-outline" size={34} color="#92400E" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Sin animales</Text>
            <View style={{ marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#475569', fontSize: 16 }}>No hay ningún animal en el </Text>
                <View style={{ backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 16, lineHeight: 18 }}>Corral {corralId}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={onPressAdd} activeOpacity={0.9} style={[baseBtn, styleByVariant[buttonVariant], { marginTop: 20 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name={buttonVariant === 'ghost' ? 'add-outline' : 'add-circle-outline'} size={18} color={textColorByVariant[buttonVariant]} style={{ marginRight: 6 }} />
                    <Text style={{ color: textColorByVariant[buttonVariant], fontWeight: '700' }}>Introducir animal</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};
