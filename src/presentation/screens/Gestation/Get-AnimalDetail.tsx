import { View, Text, Image, ScrollView, TouchableOpacity, Modal, Pressable, Animated, Dimensions, TextInput } from 'react-native';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CerdoMaternidad } from '../../../assets';
import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { DrawerItem } from '@react-navigation/drawer';
// import { CorralMatInfo } from '../../../libraries/interfaces/corral-Info.interface'; // si la tienes, ok
import { useNavigation, NavigationProp } from '@react-navigation/native';

import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Icon>['name'];


const ipServer = 'http://192.168.1.238:3010';
const corralInfoUrl = (id: number) => `${ipServer}/corral/${id}`;

const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';

const useRightDrawer = () => {
    const w = Math.min(340, Math.round(Dimensions.get('window').width * 0.88));
    const [open, setOpen] = useState(false);
    const tx = useRef(new Animated.Value(w)).current;
    const show = () => { setOpen(true); Animated.timing(tx, { toValue: 0, duration: 240, useNativeDriver: true }).start(); };
    const hide = () => { Animated.timing(tx, { toValue: w, duration: 220, useNativeDriver: true }).start(({ finished }) => finished && setOpen(false)); };
    return { open, show, hide, tx, width: w };
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

function QuickAnimalCard({
    crotal, id, subEstado, dia, consumoActual, consumoObjetivo,
}: {
    crotal?: string; id?: string | number; subEstado?: string; dia?: number | string;
    consumoActual?: number; consumoObjetivo?: number;
}) {
    const pct = consumoObjetivo ? Math.min(100, Math.round((consumoActual ?? 0) * 100 / consumoObjetivo)) : 0;
    return (
        <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: CARD_BORDER,
            padding: 12,
            marginTop: 8,
            marginBottom: 12,
            shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
        }}>
            {/* Top row: icon + crotal/ID + chips */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                    width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF',
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                }}>
                    <Icon name="paw-outline" size={18} color={BRAND} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#0f172a', fontWeight: '900' }}>{crotal || '—'}</Text>
                    {!!id && <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 12 }}>ID {id}</Text>}
                </View>

                {/* chips */}
                {!!subEstado && (
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F1F5F9', borderRadius: 999, borderWidth: 1, borderColor: CARD_BORDER }}>
                            <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 12 }}>{subEstado}</Text>
                        </View>
                        {!!dia && (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#EEF2FF', borderRadius: 999, borderWidth: 1, borderColor: '#C7D2FE' }}>
                                <Text style={{ color: BRAND, fontWeight: '800', fontSize: 12 }}>Día {dia}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>

            {/* Barra de consumo opcional */}
            {typeof consumoActual === 'number' && typeof consumoObjetivo === 'number' && (
                <View style={{ marginTop: 10 }}>
                    <View style={{ height: 8, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                        <View style={{ width: `${pct}%`, height: 8, borderRadius: 999, backgroundColor: BRAND }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                        <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 12 }}>
                            {consumoActual?.toLocaleString('es-ES')} / {consumoObjetivo?.toLocaleString('es-ES')} gr
                        </Text>
                        <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 12 }}>{pct}%</Text>
                    </View>
                </View>
            )}
        </View>
    );
}


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
                        <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
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
            <View style={{
                position: 'absolute', left: 20, right: 20, top: '26%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: CARD_BORDER, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 16,
            }}>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 10 }}>SubEstado</Text>
                {opciones.map(op => (
                    <Pressable key={op} onPress={() => setVal(op)} android_ripple={{ color: '#e5e7eb' }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                        <Icon name={val === op ? 'radio-button-on' : 'radio-button-off'} size={18} color={val === op ? BRAND : '#64748B'} />
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
                    <TouchableOpacity onPress={() => onAccept(nuevo.trim())} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function ActionRow({
    label,
    onPress,
    disabled = false,
}: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            android_ripple={disabled ? undefined : { color: '#e5e7eb' }}
            style={{
                opacity: disabled ? 0.45 : 1,
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}
        >
            <Icon name="chevron-forward" size={16} color={disabled ? '#94A3B8' : '#0F172A'} />
            <Text style={{ marginLeft: 6, fontWeight: '800', color: disabled ? '#94A3B8' : '#0F172A' }}>
                {label}
            </Text>
        </Pressable>
    );
}

function ConfirmDialog({
    visible, title, message, onCancel, onAccept,
}: {
    visible: boolean;
    title: string;
    message?: string;
    onCancel: () => void;
    onAccept: () => void;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            {/* Capa a pantalla completa + centrado */}
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                {/* Fondo oscuro clicable */}
                <Pressable
                    onPress={onCancel}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
                />

                {/* Card del modal */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: CARD_BORDER,
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowRadius: 16,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 16,
                        width: '100%',
                        maxWidth: 520,          // opcional: más elegante en pantallas grandes
                        alignSelf: 'center',
                    }}
                >
                    <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a', marginBottom: 8 }}>
                        {title}
                    </Text>
                    {message ? <Text style={{ color: '#334155', marginBottom: 12 }}>{message}</Text> : null}

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onAccept}
                            style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>Aceptar</Text>
                        </TouchableOpacity>
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
    onContinue: (data: {
        totalLechones?: string; nacidosVivos?: string; nacidosMuertos?: string;
        donados?: string; adoptados?: string; viables?: string;
    }) => void;
}) {
    const [form, setForm] = useState({
        totalLechones: '', nacidosVivos: '', nacidosMuertos: '',
        donados: '', adoptados: '', viables: '',
    });

    // reset al abrir
    useEffect(() => {
        if (visible) {
            setForm({
                totalLechones: '', nacidosVivos: '', nacidosMuertos: '',
                donados: '', adoptados: '', viables: '',
            });
        }
    }, [visible]);

    // helpers
    const onlyNum = (t: string) => t.replace(/[^0-9]/g, '');
    const step = (k: keyof typeof form, delta: number) =>
        setForm(s => {
            const n = parseInt(s[k] || '0', 10) || 0;
            const v = Math.max(0, n + delta);
            return { ...s, [k]: String(v) };
        });

    const MAX_BODY_H = Math.min(Dimensions.get('window').height * 0.48, 360);

    const Row = ({ label, k }: { label: string; k: keyof typeof form }) => (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 6,
        }}>
            <Text style={{ color: '#0f172a', fontSize: 15, fontWeight: '600', flexShrink: 1, paddingRight: 12 }}>
                {label}
            </Text>

            {/* Input + mini stepper (opcional) */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Pressable
                    onPress={() => step(k, -1)}
                    android_ripple={{ color: '#e5e7eb' }}
                    style={{
                        width: 28, height: 28, borderRadius: 14,
                        borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#64748B', fontSize: 16 }}>–</Text>
                </Pressable>

                <TextInput
                    value={form[k]}
                    onChangeText={(t) => setForm(s => ({ ...s, [k]: onlyNum(t) }))}
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    inputMode="numeric"
                    maxLength={4}
                    style={{
                        width: 90, height: 38,
                        borderWidth: 1, borderColor: CARD_BORDER,
                        borderRadius: 999, paddingHorizontal: 12,
                        textAlign: 'center', color: '#0f172a', fontWeight: '700',
                    }}
                    accessibilityLabel={label}
                />

                <Pressable
                    onPress={() => step(k, +1)}
                    android_ripple={{ color: '#e5e7eb' }}
                    style={{
                        width: 28, height: 28, borderRadius: 14,
                        borderWidth: 1, borderColor: CARD_BORDER, alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#64748B', fontSize: 16 }}>+</Text>
                </Pressable>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            {/* Capa completa + centrado */}
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                {/* Fondo oscuro */}
                <Pressable
                    onPress={onClose}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
                />

                {/* Card */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 20,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: CARD_BORDER,
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowRadius: 18,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 18,
                        width: '100%',
                        maxWidth: 520,            // más elegante en pantallas grandes
                        alignSelf: 'center',
                    }}
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{
                            width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF',
                            alignItems: 'center', justifyContent: 'center', marginRight: 8,
                        }}>
                            <Icon name="medkit-outline" size={18} color={BRAND} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '900', fontSize: 16, color: '#0f172a' }}>
                                Pasar a lactancia
                            </Text>
                            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>
                                Todos los campos son opcionales
                            </Text>
                        </View>

                        {/* Botón cerrar */}
                        <Pressable
                            onPress={onClose}
                            hitSlop={10}
                            android_ripple={{ color: '#e5e7eb', borderless: true }}
                            style={{ padding: 4, marginLeft: 6 }}
                        >
                            <Icon name="close" size={20} color="#64748B" />
                        </Pressable>
                    </View>

                    {/* Cuerpo (scrollable si hace falta) */}
                    <ScrollView
                        style={{ maxHeight: MAX_BODY_H }}
                        contentContainerStyle={{ paddingBottom: 0 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Row label="Total lechones" k="totalLechones" />
                        <Row label="Nacidos vivos" k="nacidosVivos" />
                        <Row label="Nacidos muertos" k="nacidosMuertos" />
                        <Row label="Donados" k="donados" />
                        <Row label="Adoptados" k="adoptados" />
                        <Row label="Viables" k="viables" />
                    </ScrollView>

                    {/* Separador */}
                    <View style={{ height: 1, backgroundColor: CARD_BORDER, marginTop: 10, marginBottom: 8 }} />

                    {/* Botonera */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{
                                flex: 1, height: 44, borderRadius: 12,
                                backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onContinue(form)}
                            style={{
                                flex: 1, height: 44, borderRadius: 12,
                                backgroundColor: BRAND, alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '800' }}>Siguiente</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}



function NextStepModal({
    visible, onClose, onPasarDestete, onSalida,
}: {
    visible: boolean;
    onClose: () => void;
    onPasarDestete: () => void;
    onSalida: () => void;
}) {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            {/* capa completa + centrado */}
            <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                {/* fondo oscuro */}
                <Pressable
                    onPress={onClose}
                    style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}
                />

                {/* card */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 18,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: CARD_BORDER,
                        shadowColor: '#000',
                        shadowOpacity: 0.15,
                        shadowRadius: 18,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 18,
                        width: '100%',
                        maxWidth: 480,
                        alignSelf: 'center',
                    }}
                >
                    {/* header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <View
                            style={{
                                width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF2FF',
                                alignItems: 'center', justifyContent: 'center', marginRight: 8,
                            }}
                        >
                            <Icon name="arrow-forward-circle-outline" size={16} color={BRAND} />    {/*arrow-forward-circle-outline - walk-outline */}
                        </View>
                        <Text style={{ flex: 1, fontWeight: '900', fontSize: 16, color: '#0f172a' }}>
                            Siguiente operación
                        </Text>
                        <Pressable onPress={onClose} hitSlop={8} android_ripple={{ color: '#e5e7eb', borderless: true }}>
                            <Icon name="close" size={20} color="#64748B" />
                        </Pressable>
                    </View>

                    <Text style={{ color: '#64748B', marginBottom: 8, fontSize: 13 }}>Elige una opción:</Text>

                    {/* lista de opciones */}
                    <View style={{ borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12, overflow: 'hidden' }}>
                        <Pressable
                            onPress={onPasarDestete}
                            android_ripple={{ color: '#e5e7eb' }}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 }}
                        >
                            <Icon name="git-branch-outline" size={18} color={BRAND} />
                            <Text style={{ marginLeft: 10, fontSize: 15, color: '#0f172a', fontWeight: '700' }}>
                                Pasar a destete
                            </Text>
                            <View style={{ flex: 1 }} />
                            <Icon name="chevron-forward" size={18} color="#94A3B8" />
                        </Pressable>

                        <View style={{ height: 1, backgroundColor: CARD_BORDER }} />

                        <Pressable
                            onPress={onSalida}
                            android_ripple={{ color: '#e5e7eb' }}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 }}
                        >
                            <Icon name="exit-outline" size={18} color="#0f172a" />
                            <Text style={{ marginLeft: 10, fontSize: 15, color: '#0f172a', fontWeight: '700' }}>
                                Salida
                            </Text>
                            <View style={{ flex: 1 }} />
                            <Icon name="chevron-forward" size={18} color="#94A3B8" />
                        </Pressable>
                    </View>

                    {/* footer */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={onClose}
                            activeOpacity={0.9}
                            style={{
                                height: 36,
                                paddingHorizontal: 14,
                                borderRadius: 10,
                                backgroundColor: '#F1F5F9',
                                borderWidth: 1,
                                borderColor: CARD_BORDER,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text style={{ color: '#0f172a', fontWeight: '700' }}>Cancelar</Text>
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

function SectionTitle({
    icon, title, subtitle,
}: { icon: IoniconName; title: string; subtitle?: string }) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#C7D2FE',         // borde suave del brand
                backgroundColor: '#EEF2FF',     // fondo tenue brand
                marginBottom: 10,
            }}
        >
            <View
                style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: '#E0E7FF',
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                }}
            >
                <Icon name={icon} size={18} color={BRAND} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: '#0f172a', fontWeight: '900', fontSize: 16 }}>{title}</Text>
                {!!subtitle && <Text style={{ color: '#64748B', fontSize: 12 }}>{subtitle}</Text>}
            </View>
        </View>
    );
}

function ListItem({
    icon, label, onPress, disabled,
}: {
    icon?: IoniconName; label: string; onPress: () => void; disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            android_ripple={disabled ? undefined : { color: '#e5e7eb' }}
            style={{
                opacity: disabled ? 0.45 : 1,
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 12, paddingHorizontal: 12,
            }}
        >
            {!!icon && <Icon name={icon} size={18} color={disabled ? '#94A3B8' : '#334155'} />}
            <Text style={{ marginLeft: icon ? 10 : 0, color: disabled ? '#94A3B8' : '#0F172A', fontWeight: '800', flex: 1 }}>
                {label}
            </Text>
            <Icon name="chevron-forward" size={18} color="#94A3B8" />
        </Pressable>
    );
}

/** Contenedor “grouped list” */
function ListGroup({ children }: { children: React.ReactNode }) {
    return (
        <View
            style={{
                borderWidth: 1, borderColor: CARD_BORDER,
                borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff',
            }}
        >
            {children}
        </View>
    );
}

const Divider = () => <View style={{ height: 1, backgroundColor: CARD_BORDER }} />;




export const GetAnimalDetail = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute<any>();
    const params = route.params ?? {};
    const { corralId = 0, mockEmpty, mockData, deviceError, diasSinAlimentar, statusMessage } = params;
    const navigation = useNavigation<NavigationProp<any>>();
    const [corraInfo, setCorralInfo] = useState<any | null>(null);


    const [animalState, setAnimalState] = useState({
        crotal: '—',
        curva: '—',
        condicion: '—',
        subEstado: '—',
        subEstadoFecha: todayStr(),
    });
    const sub = (animalState.subEstado || '').toUpperCase();




    const [isDeviceError, setDeviceError] = useState<boolean>(!!deviceError);
    const [hasDiasSinAlimentar, setHasDiasSinAlimentar] = useState<boolean>(!!diasSinAlimentar);

    const [dlgLactancia, setDlgLactancia] = useState(false);
    const [dlgNextStep, setDlgNextStep] = useState(false);
    const [dlgSalidaMotivo, setDlgSalidaMotivo] = useState(false);

    const [confirm, setConfirm] = useState<{
        visible: boolean; title: string; message?: string; onAccept?: () => void;
    }>({ visible: false, title: '' });


    const BRAND = '#4F46E5';
    const CARD_BORDER = '#E2E8F0';

    // type BtnVariant = 'primary' | 'secondary' | 'ghost';

    // justo encima de los handlers
    const resetAnimalState = () => ({
        crotal: '—',
        curva: '—',
        condicion: '—',
        subEstado: '—',
        subEstadoFecha: todayStr(),
    });

    const simulateRemoveAnimal = () => {
        setCorralInfo(c => ({ ...(c || {}), animal: null }));
        setAnimalState(resetAnimalState());
    };


    const EmptyCorralCard = ({
        corralId,
        onPressAdd,
        buttonVariant = 'secondary',
    }: {
        corralId: number | string;
        onPressAdd?: () => void;
        buttonVariant?: 'primary' | 'secondary' | 'ghost';
    }) => {
        const baseBtn = {
            height: 42,
            borderRadius: 10,
            paddingHorizontal: 14,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: '75%',
        } as const;

        const styleByVariant: Record<string, any> = {
            primary: { backgroundColor: BRAND },
            secondary: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: CARD_BORDER },
            ghost: { backgroundColor: 'transparent' },
        };

        const textColorByVariant: Record<string, string> = {
            primary: '#fff',
            secondary: BRAND,
            ghost: BRAND,
        };

        return (
            <View style={{ marginTop: 24, alignItems: 'center', paddingHorizontal: 16 }}>
                {/* Icono redondo */}
                <View
                    style={{
                        width: 64, height: 64, borderRadius: 32,
                        backgroundColor: '#FEF3C7',
                        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                    }}
                >
                    <Icon name="warning-outline" size={34} color="#92400E" />
                </View>

                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>Sin animales</Text>

                {/* Línea con chip "Corral X" */}
                <View
                    style={{
                        marginTop: 14,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{ color: '#475569', fontSize: 16 }}>
                        No hay ningún animal en el{' '}
                    </Text>

                    {/* Chip "Corral {n}" compacto */}
                    <View
                        style={{
                            backgroundColor: '#F1F5F9',
                            borderWidth: 1,
                            borderColor: CARD_BORDER,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            borderRadius: 999,
                        }}
                    >
                        <Text
                            style={{
                                color: '#0f172a',
                                fontWeight: '900',
                                fontSize: 16,
                                lineHeight: 18,
                            }}
                        >
                            Corral {corralId}
                        </Text>
                    </View>
                </View>


                {/* CTA */}
                <TouchableOpacity
                    onPress={onPressAdd}
                    activeOpacity={0.9}
                    style={[baseBtn, styleByVariant[buttonVariant], { marginTop: 20 }]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon
                            name={buttonVariant === 'ghost' ? 'add-outline' : 'add-circle-outline'}
                            size={18}
                            color={textColorByVariant[buttonVariant]}
                            style={{ marginRight: 6 }}
                        />
                        <Text style={{ color: textColorByVariant[buttonVariant], fontWeight: '700' }}>
                            Introducir animal
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };




    // Info de corral (puede ser mock o backend)
    const [requestError, setRequestError] = useState(false);

    // estado local para editar (si hay animal)


    const drawer = useRightDrawer();
    const [dlgCurva, setDlgCurva] = useState(false);
    const [dlgCond, setDlgCond] = useState(false);
    const [dlgSub, setDlgSub] = useState(false);
    const [dlgSalida, setDlgSalida] = useState(false);
    const [dlgCrotal, setDlgCrotal] = useState(false);

    // ====== cargar info ======
    useEffect(() => {
        // 1) mock vacío
        if (mockEmpty) {
            setCorralInfo({}); // sin animal
            return;
        }
        // 2) mock con datos
        if (mockData) {
            setCorralInfo(mockData);
            return;
        }
        // 3) backend real
        const url = corralInfoUrl(corralId || 19);
        axios.get(url)
            .then((res) => setCorralInfo(res.data))
            .catch(() => setRequestError(true));
    }, [corralId, mockEmpty, mockData]);

    const animal = corraInfo?.animal;
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


    // acciones drawer
    const openAction = (key: string) => {
        drawer.hide();
        setTimeout(() => {
            if (key === 'curva') setDlgCurva(true);
            else if (key === 'condicionCorporal') setDlgCond(true);
            else if (key === 'subEstado') setDlgSub(true);
            else if (key === 'salidaAnimal') setDlgSalida(true);
            else if (key === 'sustituirCrotal') setDlgCrotal(true);
        }, 120);
    };

    const applyCurva = (val: string) => { setAnimalState(s => ({ ...s, curva: val })); setDlgCurva(false); };
    const applyCondicion = (val: string) => { setAnimalState(s => ({ ...s, condicion: val })); setDlgCond(false); };
    const applySubEstado = (estado: string, fecha: string) => { setAnimalState(s => ({ ...s, subEstado: estado, subEstadoFecha: fecha })); setDlgSub(false); };
    const applySalida = () => setDlgSalida(false);
    const applyCrotal = (nuevo: string) => { if (!nuevo) return; setAnimalState(s => ({ ...s, crotal: nuevo })); setDlgCrotal(false); };

    const askConfirm = (title: string, message: string, onAccept: () => void) =>
        setConfirm({ visible: true, title, message, onAccept });

    const onContinueLactancia = (data: any) => {
        // Aquí podrías enviar al backend "data" si hiciera falta.
        askConfirm('Pasar a lactancia', '¿Seguro de pasar a la siguiente operación?', () => {
            setAnimalState(s => ({ ...s, subEstado: 'LACTANCIA', subEstadoFecha: todayStr() }));
            setDlgLactancia(false);
        });
    };
    const onPasarDestete = () => {
        askConfirm('Pasar a destete', '¿Seguro de pasar a la siguiente operación?', () => {
            setAnimalState(s => ({ ...s, subEstado: 'DESTETE', subEstadoFecha: todayStr() }));
            setDlgNextStep(false);
            // el siguiente paso debe ser Salida
            // setTimeout(() => setDlgSalidaMotivo(true), 120);
        });
    };

    const onSalida = () => {
        // desde LACTANCIA se puede ir directo a salida
        setDlgSalidaMotivo(true);
    };

    const onAcceptSalidaMotivo = (motivo: string) => {
        askConfirm('Confirmar salida', `Motivo: ${motivo}. ¿Seguro?`, () => {
            setAnimalState(s => ({ ...s, subEstado: 'SALIDA', subEstadoFecha: todayStr() }));
            setDlgSalidaMotivo(false);
            setDlgNextStep(false);
            // simular que el animal ya no está en el corral
            simulateRemoveAnimal();
        });
    };


    const objetivo = animal?.consumo?.objetivo ?? 12000;
    const actual = animal?.consumo?.actual ?? 11000;
    const pct = objetivo > 0 ? Math.round((actual / objetivo) * 100) : 0;




    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                className="flex-1 bg-gray-100"
                contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
            >
                {hasAnimal && (
                    <Image
                        source={CerdoMaternidad}
                        className="w-fit h-2/3 absolute translate-x-3 translate-y-60 opacity-40"
                    />
                )}

                <View className="mx-4">
                    {/* Estado del dispositivo del corral */}
                    {(isDeviceError || statusMessage) && (
                        <View className="mt-3 h-8 bg-red-500 rounded-md flex-col justify-center items-center">
                            <Text className="text-white font-normal text-base">
                                {statusMessage || 'Error:  El motor no funciona'}
                            </Text>
                        </View>
                    )}

                    {/* —— Vacío vs Con animal — */}
                    {!hasAnimal ? (
                        <EmptyCorralCard
                            corralId={corralId}
                            onPressAdd={() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId })}
                        />
                    ) : (
                        <>
                            {/* ---- INFORMACIÓN ---- */}
                            {/* ID - CROTAL - CICLO */}
                            <View className="flex-row items-center mt-4">
                                {/* ID */}
                                <View className="flex-row items-center mr-4">
                                    <Text className="text-sm text-gray-600 px-2 py-0.5 bg-gray-200 rounded-full">
                                        ID
                                    </Text>
                                    <Text className="ml-2 text-[16px] text-gray-700 font-semibold">
                                        {animal?.id ?? '—'}
                                    </Text>
                                </View>

                                {/* Crotal (encoge si no cabe) */}
                                <View className="flex-row items-center mr-4 flex-shrink" style={{ minWidth: 0 }}>
                                    <Text className="text-sm text-gray-600 px-2 py-0.5 bg-gray-200 rounded-full">
                                        Crotal
                                    </Text>
                                    <Text
                                        className="ml-2 text-[16px] text-gray-700 font-semibold"
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                        style={{ flexShrink: 1 }}
                                    >
                                        {animal?.crotal ?? '—'}
                                    </Text>
                                </View>

                                {/* Ciclo */}
                                <View className="flex-row items-center">
                                    <Text className="text-sm text-gray-600 px-2 py-0.5 bg-gray-200 rounded-full">
                                        Ciclo
                                    </Text>
                                    <Text className="ml-2 text-[16px] text-gray-700 font-semibold">
                                        {animal?.ciclo ?? '—'}
                                    </Text>
                                </View>
                            </View>

                            {/* SUBESTADO - DÍA */}
                            <View className="flex-row justify-between mx-8 mt-6 items-end">
                                <View className="flex-row flex-1">
                                    <Text className="text-2xl text-blue-900 font-semibold">
                                        {animalState.subEstado ?? '—'}
                                    </Text>
                                </View>
                                <View className="flex-row flex-1 justify-end">
                                    <Text className="text-base text-gray-500 px-2 bg-gray-200 rounded-full">
                                        {' '}
                                        Día
                                    </Text>
                                    <Text className="text-xl text-gray-600 font-semibold pl-2">
                                        {animal?.dia ?? '—'}
                                    </Text>
                                </View>
                            </View>

                            {/* ALIMENTACIÓN */}
                            <View className="flex-row justify-between mt-6">
                                <View className="flex-col">
                                    <View className="flex-row items-baseline">
                                        <Text className="text-6xl text-gray-600 font-semibold tracking-tighter">
                                            {actual.toLocaleString('es-ES')}
                                        </Text>
                                        <Text className="text-xl text-gray-600 font-normal ml-1 ">gr</Text>
                                    </View>
                                    <View>
                                        <View className="w-fit h-3 bg-gray-300 rounded-full" />
                                        <View
                                            className="w-10/12 h-3 bg-green-500 rounded-full absolute"
                                            style={{ width: `${Math.min(100, pct)}%` }}
                                        />
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="font-normal text-md">
                                            {objetivo.toLocaleString('es-ES')} gr
                                        </Text>
                                        <Text className="font-normal text-md">{pct}%</Text>
                                    </View>
                                </View>

                                {/* barras dummy (como tenías) */}
                                <View className="flex-col justify-end">
                                    <View className="flex-row ">
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500 absolute rounded-t-full" />
                                            <View className="h-10 w-2 bg-green-500 rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500 absolute rounded-t-full" />
                                            <View className="h-12 w-2 bg-green-500 rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500 absolute rounded-t-full" />
                                            <View className="h-5 w-2 bg-red-600 rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500 absolute rounded-t-full" />
                                            <View className="h-12 w-2 bg-green-500 rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-6 bg-gray-500 absolute rounded-t-full" />
                                            <View className="h-5 w-6 bg-green-500 rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500  rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500  rounded-t-full" />
                                        </View>
                                        <View className="flex-row items-end ml-1">
                                            <View className="h-12 w-2 bg-gray-500  rounded-t-full" />
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="font-normal text-md">200/600</Text>
                                        <Text className="font-normal text-md">33%</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Aviso días sin alimentar */}
                            {hasDiasSinAlimentar && (
                                <View className="mt-4 h-8 bg-red-500 rounded-md flex-col justify-center items-center">
                                    <Text className="text-white font-normal text-base">2 días sin alimentar</Text>
                                </View>
                            )}

                            {/* Resto información */}
                            <View className="flex-col stretch">
                                <View className="flex-row justify-between mt-6">
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Curva</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.curva ?? '—'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Corrección</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.correccion ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mt-5">
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Fecha entrada</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.fechas?.entrada ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Fecha parto</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.fechas?.parto ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mt-5">
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Nave</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.nave ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Corral</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.corral ?? corralId ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mt-5">
                                    <View className="flex-col">
                                        <Text className="text-lg text-gray-600 font-normal">Última alimentación</Text>
                                        <View className="flex-row">
                                            <Icon
                                                name="book-outline"
                                                size={20}
                                                color="black"
                                                style={{ paddingTop: 4, marginRight: 5 }}
                                            />
                                            <Text className="text-xl text-gray-600 font-bold font-mono">
                                                {animal?.ultimaAlimentacion ?? '—'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* --- Barra inferior SIEMPRE --- */}
            <View
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

                {/* {!hasAnimal && (
               <Text style={{ marginTop: 6, textAlign: 'center', color: '#64748B', fontWeight: '600' }}>
                  No hay animal en este corral: las acciones están desactivadas.
               </Text>
            )} */}
            </View>

            {/* Drawer lateral derecho */}
            <Modal
                visible={drawer.open}
                transparent
                animationType="none"               // nada de slide nativo
                presentationStyle="overFullScreen" // iOS: evita pageSheet desde abajo
                statusBarTranslucent               // Android: overlay hasta el status bar
                onRequestClose={drawer.hide}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' }}
                    onPress={drawer.hide}
                />

                {/* Drawer lateral derecho */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        right: 0,
                        width: drawer.width,
                        backgroundColor: '#fff',
                        paddingTop: 14,
                        paddingHorizontal: 12,
                        borderTopLeftRadius: 16,
                        borderBottomLeftRadius: 16,
                        transform: [{ translateX: drawer.tx }], // 👈 entra/sale por X
                        elevation: 12,
                        shadowColor: '#000',
                        shadowOpacity: 0.18,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 6 },
                    }}
                >
                    <DrawerGrabber />

                    <SectionTitle
                        icon="construct-outline"
                        title="Gestión del corral"
                        subtitle={!hasAnimal ? 'Añade un animal a este corral' : 'Acciones disponibles'}
                    />

                    {!hasAnimal ? (
                        <ListGroup>
                            <ListItem
                                icon="add-circle-outline"
                                label="Introducir animal"
                                onPress={() => {
                                    drawer.hide();
                                    setTimeout(() => navigation.navigate('MAT-INTRO-ANIMAL', { corralId }), 120);
                                }}
                            />
                        </ListGroup>
                    ) : (
                        <QuickAnimalCard
                            crotal={animal?.crotal}
                            id={animal?.id}
                            subEstado={(animalState.subEstado || '').toUpperCase()}
                            dia={animal?.dia}
                            consumoActual={animal?.consumo?.actual}
                            consumoObjetivo={animal?.consumo?.objetivo}
                        />
                    )}

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
            <RadioDialog
                visible={dlgCurva}
                title="Seleccionar curva"
                options={['DEFECTO', 'PRIMALAS 2 FASE', 'CURVA GENERAL', 'ADAPTACION PRIM', 'ENFERMA', 'SEGUNDO CICLO']}
                current={animalState.curva}
                onClose={() => setDlgCurva(false)}
                onAccept={applyCurva}
            />

            <RadioDialog
                visible={dlgCond}
                title="Condición corporal"
                options={['Extra gorda', 'Muy gorda', 'Gorda', 'Normal', 'Delgada', 'Muy delgada', 'Extra delgada']}
                current={animalState.condicion}
                onClose={() => setDlgCond(false)}
                onAccept={applyCondicion}
            />

            <SubEstadoDialog
                visible={dlgSub}
                current={animalState.subEstado}
                dateStr={animalState.subEstadoFecha}
                onClose={() => setDlgSub(false)}
                onAccept={applySubEstado}
            />

            <RadioDialog
                visible={dlgSalida}
                title="Salida animal"
                options={[
                    'SIN SALIDA PROGRAMADA',
                    'SALIDA PROGRAMADA',
                    'SALIDA PROGRAMADA CON VACIO TOLVA',
                    'SALIDA MATERNIDAD',
                ]}
                current={undefined}
                onClose={() => setDlgSalida(false)}
                onAccept={applySalida}
            />

            <CrotalDialog
                visible={dlgCrotal}
                oldCrotal={animalState.crotal}
                onClose={() => setDlgCrotal(false)}
                onAccept={applyCrotal}
            />

            {/* Paso: Formulario de lactancia */}
            <LactanciaFormModal
                visible={dlgLactancia}
                onClose={() => setDlgLactancia(false)}
                onContinue={onContinueLactancia}
            />

            {/* Paso: Elegir “destete” o “salida” */}
            <NextStepModal
                visible={dlgNextStep}
                onClose={() => setDlgNextStep(false)}
                onPasarDestete={onPasarDestete}
                onSalida={onSalida}
            />

            {/* Motivo de salida */}
            <RadioDialog
                visible={dlgSalidaMotivo}
                title="Motivo de salida"
                options={['Correcto', 'Aborto', 'Muerta']}
                current={undefined}
                onClose={() => setDlgSalidaMotivo(false)}
                onAccept={onAcceptSalidaMotivo}
            />

            {/* Confirmaciones genéricas */}
            <ConfirmDialog
                visible={confirm.visible}
                title={confirm.title}
                message={confirm.message}
                onCancel={() => setConfirm(c => ({ ...c, visible: false }))}
                onAccept={() => {
                    const cb = confirm.onAccept;
                    setConfirm(c => ({ ...c, visible: false }));
                    cb && cb();
                }}
            />

        </View>
    );
};