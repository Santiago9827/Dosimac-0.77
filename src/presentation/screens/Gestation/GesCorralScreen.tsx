// screens/Gestation/GesCorralScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';

type NFCRecord = { tnf: number; text?: string; uri?: string; payloadHex?: string };

export default function GesCorralScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    const [corral, setCorral] = useState('');
    const [scanning, setScanning] = useState(false);
    const [lastTag, setLastTag] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // --- MOCKS GESTACIÓN (ajústalos a tu backend) ---
    const MOCKS: Record<string, any> = {
        '4': { corral: '4' },
        '7': { corral: '7' },
    };

    useEffect(() => {
        NfcManager.start().catch(() => { });
        return () => {
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null as any);
            NfcManager.unregisterTagEvent().catch(() => { });
        };
    }, []);

    const fmtHex = (bytes?: number[]) =>
        bytes ? Array.from(bytes).map(b => ('00' + b.toString(16)).slice(-2)).join(' ') : undefined;

    const decodeNdef = (tag: any): NFCRecord[] => {
        const msg = tag?.ndefMessage;
        if (!msg || !Array.isArray(msg)) return [];
        try {
            return msg.map((record: any) => {
                let text: string | undefined;
                let uri: string | undefined;
                if (record?.payload && Array.isArray(record.payload)) {
                    try { text = Ndef.text.decodePayload(Uint8Array.from(record.payload)); } catch { }
                    if (!text) { try { uri = Ndef.uri.decodePayload(Uint8Array.from(record.payload)); } catch { } }
                }
                return { tnf: record.tnf, text, uri, payloadHex: fmtHex(record.payload) };
            });
        } catch { return []; }
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
                } else { setErrorMsg('NFC desactivado.'); }
                return;
            }
            setLastTag(null);
            setScanning(true);
            NfcManager.setEventListener(NfcEvents.DiscoverTag, handleTag);
            await NfcManager.registerTagEvent();
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

    // 👉 Buscar/navegar en GESTACIÓN
    const onBuscar = () => {
        const code = (corral || '').trim();
        if (!code) return;

        // si lo tienes en memoria/Mock, navega igual
        if (MOCKS[code]) {
            navigation.navigate('GES-CORRAL-DETALLE', { corral: code });
            return;
        }
        // por defecto: navega al detalle con el ID
        navigation.navigate('GES-CORRAL-DETALLE', { corral: code });
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            style={{ paddingBottom: insets.bottom + 8 }}
        >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 + insets.bottom }}>
                {/* Título */}
                <View>
                    <Text className="text-slate-900 text-[22px] font-extrabold">Gestación · Localizar corral</Text>
                    <Text className="text-slate-500 mt-1">Número de corral o lectura NFC.</Text>
                </View>

                {/* Campo */}
                <View className="mt-3">
                    <Text className="text-slate-600 text-[18px] mb-2">Corral</Text>
                    <View className="flex-row items-center rounded-2xl bg-white border px-3" style={{ borderColor: '#E2E8F0', height: 52 }}>
                        <Ionicons name="home-outline" size={20} color="#64748B" />
                        <TextInput
                            value={corral}
                            onChangeText={setCorral}
                            placeholder="1234"
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

                    {/* Escaneo NFC */}
                    <TouchableOpacity
                        onPress={scanning ? stopScan : startScan}
                        className="mt-3 flex-row items-center justify-center rounded-2xl border py-3 bg-white"
                        style={{ borderColor: scanning ? '#A7F3D0' : '#CBD5E1' }}
                        activeOpacity={0.9}
                    >
                        <Ionicons name={scanning ? 'stop-circle-outline' : 'scan-outline'} size={18} color={scanning ? '#059669' : '#16A34A'} />
                        <Text className="ml-2 text-slate-900 font-semibold">
                            {scanning ? 'Detener escaneo' : 'Escanear'}
                        </Text>
                    </TouchableOpacity>

                    {errorMsg ? <Text className="mt-2 text-red-600">{errorMsg}</Text> : null}

                    {/* Botón Buscar */}
                    <TouchableOpacity
                        disabled={!corral.trim()}
                        onPress={onBuscar}
                        className="mt-4 rounded-xl px-4 py-3 active:opacity-90"
                        style={{
                            backgroundColor: corral.trim() ? '#4F46E5' : '#C7D2FE',
                            shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3,
                        }}
                    >
                        <Text className="text-white text-center font-semibold">Buscar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
