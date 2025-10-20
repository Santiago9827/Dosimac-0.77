/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { useAwrConn } from '../../stores/awrConnStore'; // 👈 usa el mismo hook que en la pantalla de pruebas

const BRAND = '#4F46E5';
const CARD_BORDER = '#E2E8F0';

type Estado = 'PREPARTO' | 'LACTANCIA';

export default function IntroducirAnimalCorral() {
    const navigation = useNavigation<NavigationProp<any>>();
    const route = useRoute<any>();
    const { corralId } = route.params ?? {};

    // AWR300
    const { startReading, lastTag, isConnected } = useAwrConn();

    // Estado local
    const [crotal, setCrotal] = useState('');
    const [estado, setEstado] = useState<Estado>('PREPARTO');
    const dia = useMemo(() => (estado === 'PREPARTO' ? -5 : 0), [estado]);

    // Arranca la lectura al montar
    useEffect(() => {
        startReading().catch(() => { });
    }, [startReading]);

    // Si llega un tag nuevo, lo volcamos al input (a menos que el usuario esté tecleando)
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [userTyping, setUserTyping] = useState(false);

    const onChangeCrotal = (t: string) => {
        setCrotal(t);
        setUserTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setUserTyping(false), 800);
    };

    useEffect(() => {
        if (!userTyping && lastTag) {
            setCrotal(lastTag);
        }
    }, [lastTag, userTyping]);

    const confirmar = () => {
        if (!crotal.trim()) return;
        navigation.navigate('MAT-CORRALDETAIL', {
            corralId,
            mockData: {
                animal: {
                    crotal: crotal.trim(),
                    corral: String(corralId),
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{ padding: 16, gap: 16 }}>
                    {/* Cabecera contextual */}
                    <View style={styles.headerRow}>
                        <Ionicons name="add-circle-outline" size={20} color="#0f172a" />
                        <Text style={styles.title}>Introducir animal</Text>
                        <View style={{ flex: 1 }} />
                        <View style={styles.chip}><Text style={styles.chipText}>Corral {String(corralId ?? '—')}</Text></View>
                    </View>

                    {/* CROTAL */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Identificación (Crotal)</Text>
                        <TextInput
                            value={crotal}
                            onChangeText={onChangeCrotal}
                            placeholder="Escribe o espera la lectura…"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            maxLength={20}
                            style={styles.bigInput}
                        />
                        <View style={styles.helperRow}>
                            <Ionicons name="radio-outline" size={16} color={BRAND} />
                            <Text style={styles.helperText}>
                                {isConnected ? 'Escuchando AWR300…' : 'Conectando al AWR300…'}
                            </Text>
                        </View>
                    </View>

                    {/* ESTADO + derivados */}
                    <View style={styles.card}>
                        <Text style={styles.cardLabel}>Estado</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <EstadoPill label="PREPARTO" active={estado === 'PREPARTO'} onPress={() => setEstado('PREPARTO')} />
                            <EstadoPill label="LACTANCIA" active={estado === 'LACTANCIA'} onPress={() => setEstado('LACTANCIA')} />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.subLabel}>Día</Text>
                            <View style={styles.valueBox}><Text style={styles.valueText}>{dia}</Text></View>
                        </View>

                        <View style={[styles.row, { marginTop: 8 }]}>
                            <Text style={styles.subLabel}>Corral</Text>
                            <View style={styles.valueBox}><Text style={styles.valueText}>{String(corralId ?? '—')}</Text></View>
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
        </SafeAreaView>
    );
}

function EstadoPill({
    label, active, onPress,
}: { label: 'PREPARTO' | 'LACTANCIA'; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={[
                { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
                active ? { backgroundColor: '#EEF2FF', borderColor: BRAND } : { backgroundColor: '#F8FAFC', borderColor: CARD_BORDER },
            ]}
        >
            <Text style={{ fontWeight: '800', color: active ? BRAND : '#334155', letterSpacing: 0.2 }}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    title: { marginLeft: 8, color: '#0f172a', fontWeight: '900', fontSize: 18 },
    chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#F1F5F9' },
    chipText: { color: '#334155', fontWeight: '700' },

    card: { backgroundColor: '#fff', borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 14, padding: 14 },
    cardLabel: { color: '#64748B', fontWeight: '800', marginBottom: 10 },
    bigInput: {
        height: 56, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 12,
        paddingHorizontal: 14, fontSize: 18, color: '#0f172a', backgroundColor: '#F8FAFC',
    },
    helperRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    helperText: { marginLeft: 6, color: BRAND, fontWeight: '700' },

    row: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
    subLabel: { color: '#64748B', fontWeight: '700', width: 74 },
    valueBox: {
        flex: 1, height: 42, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 10,
        backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
    },
    valueText: { color: '#0f172a', fontWeight: '800' },

    bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: CARD_BORDER, backgroundColor: '#FFFFFF' },
    cta: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
