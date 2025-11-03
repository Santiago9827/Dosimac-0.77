// screens/Maternity/CorralScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import NfcManager, { Ndef, NfcEvents } from 'react-native-nfc-manager';

type NFCRecord = { tnf: number; text?: string; uri?: string; payloadHex?: string };

export default function CorralScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();
    const { width } = useWindowDimensions();

    const [corral, setCorral] = useState('');
    const [scanning, setScanning] = useState(false);
    const [lastTag, setLastTag] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // ===== MOCKS =====
    const MOCKS: Record<string, any> = {
        '2': {
            animal: {
                id: 1235,
                crotal: '123456789012345',
                ciclo: 5,
                subEstado: 'LACTANCIA',
                subEstadoFecha: '2025-01-12',
                dia: 5,
                nave: 'G-1',
                corral: '2',
                fechas: { entrada: '15/10/2025', parto: '12/12/2025' },
                ultimaAlimentacion: '13/10/2025',
                curva: 'Multiparas',
                correccion: '100% curva',
                consumo: { objetivo: 12000, actual: 11000 },
            },
            deviceError: true,
            diasSinAlimentar: true,
            statusMessage: '',
        },
        '3': {
            animal: {
                id: 987,
                crotal: '111222333444555',
                ciclo: 3,
                subEstado: 'PREPARTO',
                subEstadoFecha: '2025-02-03',
                dia: 12,
                nave: 'G-2',
                corral: '3',
                fechas: { entrada: '01/11/2025', parto: '—' },
                ultimaAlimentacion: '02/11/2025',
                curva: 'General',
                correccion: '95% curva',
                consumo: { objetivo: 9000, actual: 6300 },
            },
            deviceError: false,
            diasSinAlimentar: false,
            statusMessage: '',
        },
    };

    // ===== NFC SETUP =====
    useEffect(() => {
        if (Platform.OS !== 'web') NfcManager.start().catch(() => { });
        return () => {
            if (Platform.OS !== 'web') {
                NfcManager.setEventListener(NfcEvents.DiscoverTag, null as any);
                NfcManager.unregisterTagEvent().catch(() => { });
            }
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
                    try {
                        text = Ndef.text.decodePayload(Uint8Array.from(record.payload));
                    } catch { }
                    if (!text) {
                        try {
                            uri = Ndef.uri.decodePayload(Uint8Array.from(record.payload));
                        } catch { }
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

    const handleTag = useCallback(async (tag: any) => {
        setLastTag(tag);
        const value = pickCorralFromTag(tag);
        if (value) setCorral(value);
        if (Platform.OS === 'ios') {
            try {
                await NfcManager.setAlertMessageIOS?.('Etiqueta detectada');
            } catch { }
        }
        try {
            await NfcManager.unregisterTagEvent();
        } catch { }
        setScanning(false);
    }, []);

    const startScan = useCallback(async () => {
        setErrorMsg(null);

        if (Platform.OS === 'web') {
            setErrorMsg('La lectura NFC no está disponible en la versión web.');
            return;
        }

        try {
            const supported = await NfcManager.isSupported();
            if (!supported) {
                setErrorMsg('Este dispositivo no soporta NFC.');
                return;
            }

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
            await NfcManager.registerTagEvent();
        } catch (e: any) {
            setScanning(false);
            setErrorMsg(e?.message || 'No se pudo iniciar el escaneo.');
            try {
                await NfcManager.unregisterTagEvent();
            } catch { }
        }
    }, [handleTag]);

    const stopScan = useCallback(async () => {
        try {
            await NfcManager.unregisterTagEvent();
        } catch { }
        setScanning(false);
    }, []);

    // === Buscar con mock ===
    const onBuscar = () => {
        const code = (corral || '').trim();
        if (!code) return;

        if (code === '1') {
            navigation.navigate('MAT-CORRALDETAIL', {
                corralId: 1,
                mockEmpty: true,
                deviceError: true,
                diasSinAlimentar: false,
                statusMessage: 'Error: El motor no funciona',
            });
            return;
        }

        if (MOCKS[code]) {
            navigation.navigate('MAT-CORRALDETAIL', {
                corralId: Number(code),
                mockData: MOCKS[code],
                deviceError: MOCKS[code].deviceError,
                diasSinAlimentar: MOCKS[code].diasSinAlimentar,
                statusMessage: MOCKS[code].statusMessage,
            });
            return;
        }

        navigation.navigate('MAT-CORRALDETAIL', {
            corralId: Number(code),
            mockEmpty: true,
            deviceError: false,
            diasSinAlimentar: false,
            statusMessage: '',
        });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1 bg-slate-50"
            style={{ paddingBottom: insets.bottom + 8 }}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingTop: 40,
                    paddingBottom: 60,
                }}
            >
                {/* Card principal */}
                <View
                    style={{
                        width: '100%',
                        maxWidth: 600,
                        backgroundColor: '#fff',
                        borderRadius: 24,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 3,
                    }}
                >
                    {/* Título */}
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#0f172a' }}>
                        Localizar corral
                    </Text>
                    <Text style={{ color: '#64748B', marginTop: 4 }}>
                        Número de corral o lectura NFC.
                    </Text>

                    {/* Input */}
                    <View
                        style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F8FAFC',
                            borderColor: '#E2E8F0',
                            borderWidth: 1,
                            borderRadius: 16,
                            paddingHorizontal: 12,
                            height: 50,
                        }}
                    >
                        <Ionicons name="home-outline" size={20} color="#64748B" />
                        <TextInput
                            value={corral}
                            onChangeText={setCorral}
                            placeholder="Ej. 1234"
                            placeholderTextColor="#94A3B8"
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                fontSize: 16,
                                color: '#0f172a',
                            }}
                            keyboardType="numeric"
                            returnKeyType="search"
                            onSubmitEditing={onBuscar}
                        />
                        {corral ? (
                            <TouchableOpacity onPress={() => setCorral('')}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Escanear */}
                    <TouchableOpacity
                        onPress={scanning ? stopScan : startScan}
                        activeOpacity={0.9}
                        style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: scanning ? '#A7F3D0' : '#CBD5E1',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 14,
                            paddingVertical: 12,
                            gap: 8,
                        }}
                    >
                        <Ionicons
                            name={scanning ? 'stop-circle-outline' : 'scan-outline'}
                            size={18}
                            color={scanning ? '#059669' : '#16A34A'}
                        />
                        <Text style={{ color: '#0f172a', fontWeight: '600' }}>
                            {scanning ? 'Detener escaneo' : 'Escanear etiqueta NFC'}
                        </Text>
                    </TouchableOpacity>

                    {/* Error */}
                    {errorMsg && (
                        <View
                            style={{
                                marginTop: 12,
                                backgroundColor: '#FEF2F2',
                                borderRadius: 12,
                                padding: 10,
                                borderWidth: 1,
                                borderColor: '#FECACA',
                            }}
                        >
                            <Text style={{ color: '#B91C1C', fontWeight: '600' }}>{errorMsg}</Text>
                        </View>
                    )}

                    {/* Buscar */}
                    <TouchableOpacity
                        disabled={!corral.trim()}
                        onPress={onBuscar}
                        activeOpacity={0.9}
                        style={{
                            marginTop: 24,
                            backgroundColor: corral.trim() ? '#4F46E5' : '#C7D2FE',
                            borderRadius: 14,
                            paddingVertical: 14,
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: 3 },
                            elevation: 2,
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
                            Buscar
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
