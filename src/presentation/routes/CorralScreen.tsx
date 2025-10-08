// CorralScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert,
    ScrollView,
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

export default function CorralScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    const [corral, setCorral] = useState('');
    const [scanning, setScanning] = useState(false);
    const [lastTag, setLastTag] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        NfcManager.start().catch(() => { });
        return () => {
            // Limpieza
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
                return {
                    tnf: record.tnf,
                    text,
                    uri,
                    payloadHex: fmtHex(record.payload),
                };
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
        if (tag?.id) return tag.id; // UID como fallback
        return '';
    };

    // ⬇️ ESTE handler sí se llamará ahora
    const handleTag = useCallback(async (tag: any) => {
        console.log('NFC tag', tag);
        setLastTag(tag);
        const value = pickCorralFromTag(tag);
        if (value) setCorral(value);

        // iOS: mensaje opcional
        if (Platform.OS === 'ios') {
            try { await NfcManager.setAlertMessageIOS?.('Etiqueta detectada'); } catch { }
        }

        // Detener tras 1ª lectura
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
                    Alert.alert(
                        'NFC desactivado',
                        'Activa el NFC en Ajustes para escanear etiquetas.',
                        [
                            { text: 'Cancelar', style: 'cancel' },
                            { text: 'Abrir Ajustes', onPress: () => NfcManager.goToNfcSetting?.() },
                        ]
                    );
                } else {
                    setErrorMsg('NFC desactivado.');
                }
                return;
            }

            setLastTag(null);
            setScanning(true);

            // ⚠️ PATRÓN CORRECTO: listener + registerTagEvent SIN callback
            NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTag);
            await NfcManager.registerTagEvent(); // <- sin argumentos
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

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            style={{ paddingBottom: insets.bottom + 8 }}
        >
            {/* 👇 Scroll en todo el contenido de la pantalla */}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 24 + insets.bottom, // espacio extra al final
                }}
            >
                {/* Título y subtítulo */}
                <View>
                    <Text className="text-slate-900 text-[22px] font-extrabold">
                        Elige cómo identificar el corral
                    </Text>
                    <Text className="text-slate-500 mt-1">
                        Introduce el código o usa el escáner NFC.
                    </Text>
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
                            placeholder="Ej: C-12"
                            placeholderTextColor="#94A3B8"
                            className="flex-1 ml-2 text-slate-900"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            returnKeyType="search"
                        />
                        {corral ? (
                            <TouchableOpacity onPress={() => setCorral('')}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        ) : null}
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

                    {/* Resultado en la MISMA pantalla */}
                    {lastTag ? (
                        <View
                            className="mt-3 rounded-2xl border p-3 bg-white"
                            style={{ borderColor: '#E2E8F0' }}
                        >
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

                            {/* Debug crudo */}
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