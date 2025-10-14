// CorralScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';

type NFCRecord = {
    tnf: number;
    text?: string;
    uri?: string;
    payloadHex?: string;
};

// === tipos mínimos que usa CorralDetalleScreen ===
type Animal = {
    id?: string | number;
    crotal?: string;
    diaInseminacion?: number;
    curva?: string;
    corral: string;
    total: number;
    consumida: number;
};

export default function CorralScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    const [corral, setCorral] = useState('');
    const [scanning, setScanning] = useState(false);
    const [lastTag, setLastTag] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 👇 nuevo: modo de simulación (por defecto SIN animales)
    const [demo, setDemo] = useState<'empty' | 'with'>('empty');

    useEffect(() => {
        NfcManager.start().catch(() => { });
        return () => {
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null as any);
            NfcManager.unregisterTagEvent().catch(() => { });
        };
    }, []);

    const fmtHex = (bytes?: number[]) =>
        bytes ? Array.from(bytes).map(b => ('00' + b.toString(16)).slice(-2)).join(' ') : undefined;

    // Decodifica NDEF (texto / URI)
    const decodeNdef = (tag: any): NFCRecord[] => {
        const msg = tag?.ndefMessage;
        if (!msg || !Array.isArray(msg)) return [];
        try {
            return msg.map((record: any) => {
                let text: string | undefined;
                let uri: string | undefined;
                if (record?.payload && Array.isArray(record.payload)) {
                    try { text = Ndef.text.decodePayload(Uint8Array.from(record.payload)); } catch { }
                    if (!text) {
                        try { uri = Ndef.uri.decodePayload(Uint8Array.from(record.payload)); } catch { }
                    }
                }
                return { tnf: record.tnf, text, uri, payloadHex: fmtHex(record.payload) };
            });
        } catch {
            return [];
        }
    };

    const pickCorralFromTag = (tag: any) => {
        const records = decodeNdef(tag);
        const txt = records.find(r => r.text)?.text;
        if (txt && txt.trim()) return txt.trim();
        const firstUri = records.find(r => r.uri)?.uri;
        if (firstUri && firstUri.trim()) return firstUri.trim();
        if (tag?.id) return tag.id;
        return '';
    };

    // === NFC handlers ===
    const handleTag = useCallback(async (tag: any) => {
        setLastTag(tag);
        const value = pickCorralFromTag(tag);
        if (value) setCorral(value);
        if (Platform.OS === 'ios') {
            try { await NfcManager.setAlertMessageIOS?.('Etiqueta detectada'); } catch { }
        }
        try { await NfcManager.unregisterTagEvent(); } catch { }
        setScanning(false);
    }, []);

    const startScan = useCallback(async () => {
        setErrorMsg(null);
        try {
            const supported = await NfcManager.isSupported();
            if (!supported) { setErrorMsg('Este dispositivo no soporta NFC.'); return; }

            const enabled = await NfcManager.isEnabled();
            if (!enabled) {
                if (Platform.OS === 'android') {
                    Alert.alert('NFC desactivado', 'Activa el NFC en Ajustes para escanear etiquetas.', [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Abrir Ajustes', onPress: () => NfcManager.goToNfcSetting?.() },
                    ]);
                } else {
                    setErrorMsg('NFC desactivado.');
                }
                return;
            }

            setLastTag(null);
            setScanning(true);

            NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTag);
            await NfcManager.registerTagEvent(); // sin callback
        } catch (e: any) {
            setScanning(false);
            setErrorMsg(e?.message || 'No se pudo iniciar el escaneo.');
            try { await NfcManager.unregisterTagEvent(); } catch { }
        }
    }, [handleTag]);

    const stopScan = useCallback(async () => {
        try { await NfcManager.unregisterTagEvent(); } catch { }
        setScanning(false);
    }, []);

    // === Generador demo: estable por corral (hash simple) ===
    const hash = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

    const buildAnimalsDemo = (code: string, mode: 'empty' | 'with'): Animal[] => {
        if (mode === 'empty') return [];
        const seed = hash(code || 'X');
        const n = 4;
        const items: Animal[] = [];
        for (let i = 0; i < n; i++) {
            const total = [1400, 1500, 1600, 1700][(seed + i) % 4];
            const ratios = [0.70, 0.64, 0.55, 0.82];
            const consumida = Math.round(total * ratios[(seed + i) % ratios.length]);
            const crotalBase = 100000000000 + ((seed % 90) * 1000) + (i + 1);
            items.push({
                id: i + 1,
                crotal: String(crotalBase),
                diaInseminacion: 20 + ((seed + i * 7) % 60),
                curva: 'DEFECTO',
                corral: code,
                total,
                consumida,
            });
        }
        return items;
    };

    // === Buscar: navega al detalle con datos simulados según demo ===
    const onBuscar = () => {
        const code = corral.trim();
        if (!code) return;

        const animals = buildAnimalsDemo(code, demo); // lo que ya tienes

        if (animals.length === 0) {
            navigation.navigate('CorralSinAnimales', { corral: code });
        } else {
            navigation.navigate('CorralDetalle', { corral: code, animals });
        }
    };


    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            style={{ paddingBottom: insets.bottom + 8 }}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 24 + insets.bottom,
                }}
            >
                {/* Título */}
                <View>
                    <Text className="text-slate-900 text-[22px] font-extrabold">Elige cómo identificar el corral</Text>
                    <Text className="text-slate-500 mt-1">Introduce el código o usa el escáner NFC.</Text>
                </View>

                {/* Campo de entrada */}
                <View className="mt-3">
                    <Text className="text-slate-600 mb-2">Corral</Text>
                    <View
                        className="flex-row items-center rounded-2xl bg-white border px-3"
                        style={{ borderColor: '#E2E8F0', height: 52 }}
                    >
                        <Ionicons name="home-outline" size={20} color="#64748B" />
                        <TextInput
                            value={corral}
                            onChangeText={setCorral}
                            placeholder=""
                            placeholderTextColor="#94A3B8"
                            className="flex-1 ml-2 text-slate-900"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="search"
                            onSubmitEditing={onBuscar}
                        />
                        {corral ? (
                            <TouchableOpacity onPress={() => setCorral('')}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Selector de modo demo */}
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => setDemo('empty')}
                            activeOpacity={0.9}
                            style={{
                                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                                borderWidth: 1, borderColor: demo === 'empty' ? '#A5B4FC' : '#E2E8F0',
                                backgroundColor: demo === 'empty' ? '#EEF2FF' : '#FFFFFF', marginRight: 8,
                            }}
                        >
                            <Text style={{ color: '#3730A3', fontWeight: '700' }}>Demo: Sin animales</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setDemo('with')}
                            activeOpacity={0.9}
                            style={{
                                paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
                                borderWidth: 1, borderColor: demo === 'with' ? '#A5B4FC' : '#E2E8F0',
                                backgroundColor: demo === 'with' ? '#EEF2FF' : '#FFFFFF',
                            }}
                        >
                            <Text style={{ color: '#3730A3', fontWeight: '700' }}>Demo: Con animales</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Botón Escanear / Detener */}
                    <TouchableOpacity
                        onPress={scanning ? stopScan : startScan}
                        className="mt-3 flex-row items-center justify-center rounded-2xl border py-3 bg-white"
                        style={{ borderColor: scanning ? '#A7F3D0' : '#CBD5E1' }}
                        activeOpacity={0.9}
                    >
                        <Ionicons
                            name={scanning ? 'stop-circle-outline' : 'scan-outline'}
                            size={18}
                            color={scanning ? '#059669' : '#16A34A'}
                        />
                        <Text className="ml-2 text-slate-900 font-semibold">
                            {scanning ? 'Detener escaneo' : 'Escanear'}
                        </Text>
                    </TouchableOpacity>

                    {errorMsg ? <Text className="mt-2 text-red-600">{errorMsg}</Text> : null}

                    {/* Resultado de la etiqueta (debug) */}
                    {lastTag ? (
                        <View className="mt-3 rounded-2xl border p-3 bg-white" style={{ borderColor: '#E2E8F0' }}>
                            <Text className="text-slate-800 font-semibold mb-2">Etiqueta detectada</Text>
                            <Text className="text-slate-600">
                                ID/UID: <Text className="font-semibold">{lastTag?.id || '—'}</Text>
                            </Text>

                            {Array.isArray(lastTag?.ndefMessage) && lastTag.ndefMessage.length > 0 ? (
                                <View className="mt-2">
                                    <Text className="text-slate-700 font-semibold mb-1">NDEF:</Text>
                                    {decodeNdef(lastTag).map((r, idx) => (
                                        <View key={idx} className="mb-1">
                                            {r.text ? (
                                                <Text className="text-slate-700">
                                                    • Texto: <Text className="font-semibold">{r.text}</Text>
                                                </Text>
                                            ) : null}
                                            {r.uri ? (
                                                <Text className="text-slate-700">
                                                    • URI: <Text className="font-semibold">{r.uri}</Text>
                                                </Text>
                                            ) : null}
                                            {!r.text && !r.uri && r.payloadHex ? (
                                                <Text className="text-slate-500 text-xs">• payload: {r.payloadHex}</Text>
                                            ) : null}
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text className="text-slate-500 mt-1">Sin NDEF o no legible.</Text>
                            )}

                            <View className="mt-2">
                                <Text className="text-slate-500 text-xs">RAW:</Text>
                                <Text className="text-slate-800 text-xs" selectable>
                                    {JSON.stringify(lastTag, null, 2)}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Botón Buscar */}
                    <TouchableOpacity
                        disabled={!corral.trim()}
                        onPress={onBuscar}
                        className="mt-4 rounded-xl px-4 py-3 active:opacity-90"
                        style={{
                            backgroundColor: corral.trim() ? '#4F46E5' : '#C7D2FE',
                            shadowColor: '#000',
                            shadowOpacity: 0.18,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 3,
                        }}
                    >
                        <Text className="text-white text-center font-semibold">Buscar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
