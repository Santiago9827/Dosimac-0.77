/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Modal, Pressable, Dimensions, ScrollView
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAwrConn } from '../../stores/awrConnStore';

const BRAND = '#4F46E5';
const CARD_BORDER = '#E2E8F0';
const SURFACE = '#F8FAFC';
const WIN = Dimensions.get('window');

type Estado = 'PREPARTO' | 'LACTANCIA';
type SearchMode = 'CROTAL' | 'ID';

// Corrales mock
const MOCK_CORRALES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '12', '14'];

/** Dropdown anclado a un rectángulo (usa measureInWindow del ancla) */
function AnchoredMenu<T extends string | number>({
    visible, anchor, selected, items, onSelect, onRequestClose, maxHeight = 360, minWidth = 180,
}: {
    visible: boolean;
    anchor: { x: number; y: number; w: number; h: number } | null;
    selected: T;
    items: { label: string; value: T }[];
    onSelect: (v: T) => void;
    onRequestClose: () => void;
    maxHeight?: number;
    minWidth?: number;
}) {
    if (!visible || !anchor) return null;

    const menuW = Math.max(anchor.w, minWidth);
    const gap = 6;
    const top = Math.min(anchor.y + anchor.h + gap, WIN.height - 20);
    const left = Math.min(Math.max(anchor.x, 10), Math.max(10, WIN.width - menuW - 10));

    return (
        <Modal visible transparent animationType="none" onRequestClose={onRequestClose}>
            <Pressable style={styles.backdrop} onPress={onRequestClose} />
            <View style={[styles.menu, { top, left, width: menuW, maxHeight }]}>
                <ScrollView keyboardShouldPersistTaps="handled">
                    {items.map(it => {
                        const active = it.value === selected;
                        return (
                            <TouchableOpacity
                                key={`${it.value}`}
                                activeOpacity={0.85}
                                onPress={() => { onSelect(it.value); onRequestClose(); }}
                                style={styles.menuItem}
                            >
                                <Ionicons
                                    name={active ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={18}
                                    color={active ? BRAND : '#94A3B8'}
                                    style={{ marginRight: 10 }}
                                />
                                <Text style={[styles.menuText, active && { color: BRAND, fontWeight: '800' }]}>{it.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </Modal>
    );
}

export default function IntroducirAnimalCorral() {
    const navigation = useNavigation<NavigationProp<any>>();
    const route = useRoute<any>();
    const { corralId: corralFromRoute } = route.params ?? {};

    // === AWR300
    const { startReading, stopReading, lastTag, isConnected, clearLastTag } = useAwrConn();

    // === Estado local
    const [mode, setMode] = useState<SearchMode>('CROTAL'); // ← nuevo: modo de búsqueda
    const [crotal, setCrotal] = useState('');
    const [estado, setEstado] = useState<Estado>('PREPARTO');
    const dia = useMemo(() => (estado === 'PREPARTO' ? -5 : 0), [estado]);

    const initialCorral = String(corralFromRoute ?? '—');
    const [corral, setCorral] = useState(initialCorral);
    const corralesDisponibles = useMemo(() => {
        const set = new Set<string>(MOCK_CORRALES);
        if (initialCorral !== '—') set.add(initialCorral);
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [initialCorral]);

    // === Anclas para dropdowns
    const estadoBtnRef = useRef<View>(null);
    const [estadoAnchor, setEstadoAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [estadoOpen, setEstadoOpen] = useState(false);

    const corralBtnRef = useRef<View>(null);
    const [corralAnchor, setCorralAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [corralOpen, setCorralOpen] = useState(false);

    // menú de tres puntos (modo de búsqueda)
    const moreBtnRef = useRef<View>(null);
    const [moreAnchor, setMoreAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [moreOpen, setMoreOpen] = useState(false);

    const measureEstado = () => estadoBtnRef.current?.measureInWindow((x, y, w, h) => setEstadoAnchor({ x, y, w, h }));
    const measureCorral = () => corralBtnRef.current?.measureInWindow((x, y, w, h) => setCorralAnchor({ x, y, w, h }));
    const measureMore = () => moreBtnRef.current?.measureInWindow((x, y, w, h) => setMoreAnchor({ x, y, w, h }));

    // === Limpieza/arranque al enfocar
    const seenTagRef = useRef<string | null>(null);
    useFocusEffect(
        useCallback(() => {
            setCrotal('');
            setCorral(initialCorral);
            clearLastTag();
            if (mode === 'CROTAL') startReading().catch(() => { });

            setTimeout(() => { measureEstado(); measureCorral(); measureMore(); }, 0);

            return () => {
                stopReading?.();
                setCrotal('');
                // También puedes limpiar aquí si quieres doble seguridad:
                clearLastTag();
            };
        }, [startReading, stopReading, initialCorral, mode, clearLastTag])
    );

    // Si el usuario escribe, no pisar el input durante 800ms
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [userTyping, setUserTyping] = useState(false);
    const onChangeIdent = (t: string) => {
        setCrotal(t);
        setUserTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setUserTyping(false), 800);
    };

    // Volcar tag nuevo SOLO si estamos en modo CROTAL
    useEffect(() => {
        if (mode !== 'CROTAL') return;
        if (!lastTag) return;
        if (seenTagRef.current === lastTag) return;
        if (!userTyping) {
            setCrotal(lastTag);
            seenTagRef.current = lastTag;
        }
    }, [lastTag, userTyping, mode]);

    // Si cambias el modo mientras estás en la pantalla, arranca/para la lectura
    useEffect(() => {
        if (mode === 'CROTAL') startReading().catch(() => { });
        else stopReading?.();
    }, [mode, startReading, stopReading]);

    // Confirmar
    const confirmar = () => {
        if (!crotal.trim()) return;
        navigation.navigate('MAT-CORRALDETAIL', {
            corralId: Number(corral),
            mockData: {
                animal: {
                    crotal: crotal.trim(),        // si es ID, lo mandamos igualmente aquí para el mock
                    corral: String(corral),
                    subEstado: estado,
                    subEstadoFecha: new Date().toISOString().slice(0, 10),
                    ciclo: '—',
                    dia,
                    consumo: { objetivo: 12000, actual: 0 },
                    correccion: '—',
                    curva: 'DEFECTO',
                    fechas: { entrada: '—', parto: '—' },
                    nave: '—',
                },
            },
            deviceError: false,
            diasSinAlimentar: false,
            statusMessage: '',
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{ padding: 16, gap: 16 }}>
                    {/* Header contextual */}
                    <View style={styles.headerRow}>
                        <Ionicons name="add-circle-outline" size={20} color="#0f172a" />
                        <Text style={styles.title}>Introducir animal</Text>
                        <View style={{ flex: 1 }} />
                        <View style={styles.chip}><Text style={styles.chipText}>Corral {String(corral)}</Text></View>

                        {/* botón tres puntos */}
                        <View ref={moreBtnRef} onLayout={measureMore} style={{ marginLeft: 6 }}>
                            <Pressable
                                onPress={() => { measureMore(); setMoreOpen(true); }}
                                android_ripple={{ color: '#e5e7eb', borderless: true }}
                                style={styles.iconBtn}
                            >
                                <Ionicons name="ellipsis-vertical" size={18} color="#0f172a" />
                            </Pressable>
                        </View>
                    </View>

                    {/* IDENTIFICACIÓN */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            {mode === 'CROTAL' ? 'Identificación (Crotal)' : 'Identificación (ID)'}
                        </Text>
                        <TextInput
                            value={crotal}
                            onChangeText={onChangeIdent}
                            placeholder={mode === 'CROTAL' ? 'Escribe o espera la lectura…' : 'Escribe el ID…'}
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={20}
                            style={styles.bigInput}
                        />
                        {/* Aviso SOLO si modo CROTAL y no conectado */}
                        {mode === 'CROTAL' && !isConnected && (
                            <View style={styles.helperRow}>
                                <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
                                <Text style={[styles.helperText, { color: '#EF4444' }]}>
                                    No conectado al equipo
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* BLOQUE: Estado + Día + Corral */}
                    <View style={styles.card}>
                        {/* Estado */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={[styles.cardTitle, styles.cardTitleBig, { marginBottom: 0 }]}>Estado</Text>
                            <View style={{ flex: 1 }} />
                            <View ref={estadoBtnRef} onLayout={measureEstado}>
                                <Pressable
                                    onPress={() => { measureEstado(); setEstadoOpen(true); }}
                                    android_ripple={{ color: '#E5E7EB' }}
                                    style={[styles.selectFieldCenter, { minWidth: 160 }]}
                                >
                                    <Text numberOfLines={1} style={styles.selectTextCenter}>{estado}</Text>
                                    <Ionicons name="chevron-down" size={18} color="#475569" style={styles.selectChevron} />
                                </Pressable>
                            </View>
                        </View>

                        {/* Día + Corral (50/50) */}
                        <View style={styles.rowSplit50}>
                            <View style={styles.colHalf}>
                                <Text style={styles.labelTop}>Día</Text>
                                <View style={styles.boxCentered}>
                                    <Text style={styles.valueTextCenter}>{dia}</Text>
                                </View>
                            </View>
                            <View style={styles.colHalf}>
                                <Text style={styles.labelTop}>Corral</Text>
                                <View ref={corralBtnRef} onLayout={measureCorral}>
                                    <Pressable
                                        onPress={() => { measureCorral(); setCorralOpen(true); }}
                                        android_ripple={{ color: '#E5E7EB' }}
                                        style={[styles.selectFieldCenter, { width: '100%' }]}
                                    >
                                        <Text numberOfLines={1} style={styles.selectTextCenter}>{String(corral)}</Text>
                                        <Ionicons name="chevron-down" size={18} color="#475569" style={styles.selectChevron} />
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* CTA */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        disabled={!crotal.trim()}
                        onPress={confirmar}
                        activeOpacity={0.9}
                        style={[styles.cta, { backgroundColor: crotal.trim() ? BRAND : '#CBD5E1' }]}
                    >
                        <Text style={{ color: '#fff', fontWeight: '800' }}>Confirmar</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Menú Estado */}
            <AnchoredMenu
                visible={estadoOpen}
                anchor={estadoAnchor}
                selected={estado}
                items={[
                    { label: 'PREPARTO', value: 'PREPARTO' as Estado },
                    { label: 'LACTANCIA', value: 'LACTANCIA' as Estado },
                ]}
                onSelect={(v) => setEstado(v)}
                onRequestClose={() => setEstadoOpen(false)}
                minWidth={160}
            />

            {/* Menú Corral */}
            <AnchoredMenu
                visible={corralOpen}
                anchor={corralAnchor}
                selected={corral}
                items={corralesDisponibles.map(c => ({ label: `Corral ${c}`, value: c }))}
                onSelect={(v) => setCorral(String(v))}
                onRequestClose={() => setCorralOpen(false)}
                minWidth={Math.max(200, (corralAnchor?.w ?? 200))}
                maxHeight={300}
            />

            {/* Menú tres puntos: modo de búsqueda */}
            <AnchoredMenu
                visible={moreOpen}
                anchor={moreAnchor}
                selected={mode}
                items={[
                    { label: 'Buscar por crotal (lector)', value: 'CROTAL' as SearchMode },
                    { label: 'Buscar por ID (manual)', value: 'ID' as SearchMode },
                ]}
                onSelect={(v) => setMode(v)}
                onRequestClose={() => setMoreOpen(false)}
                minWidth={230}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    title: { marginLeft: 8, color: '#0f172a', fontWeight: '900', fontSize: 18 },
    chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F1F5F9' },
    chipText: { color: '#334155', fontWeight: '700' },
    iconBtn: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center'
    },

    card: { backgroundColor: '#fff', borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 14, padding: 14 },
    cardTitle: { color: '#1f2937', fontWeight: '900', marginBottom: 8 },
    cardTitleBig: { fontSize: 16, lineHeight: 22 },

    bigInput: {
        height: 56, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12,
        paddingHorizontal: 14, fontSize: 18, color: '#0f172a', backgroundColor: SURFACE,
    },
    helperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    helperText: { marginLeft: 6, color: BRAND, fontWeight: '700' },

    bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: CARD_BORDER, backgroundColor: '#FFFFFF' },
    cta: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

    // Overlay + menú anclado
    backdrop: { flex: 1, backgroundColor: 'transparent' },
    menu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: CARD_BORDER,
        paddingVertical: 6,
        elevation: 14,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        overflow: 'hidden',
    },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
    menuText: { color: '#0f172a', fontWeight: '700' },

    // Layout día + corral (50/50)
    rowSplit50: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
    colHalf: { flex: 1 },

    labelTop: { color: '#64748B', fontWeight: '700', marginBottom: 6 },

    boxCentered: {
        height: 42,
        borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10,
        backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
    },
    valueTextCenter: { color: '#0f172a', fontWeight: '800', textAlign: 'center' },

    // Selects centrados (Estado/Corral)
    selectFieldCenter: {
        height: 42,
        borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10,
        backgroundColor: SURFACE,
        paddingHorizontal: 22,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    selectTextCenter: {
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    selectChevron: { position: 'absolute', right: 10, top: '50%', marginTop: -9 },
});
