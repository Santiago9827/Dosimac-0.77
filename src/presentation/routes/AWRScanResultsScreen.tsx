// screens/awr/AWRScanResultsScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { Appbar, ActivityIndicator, Text, Portal, Dialog, Button, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Buffer } from 'buffer';
import { BlePeripheral } from '../../device/ble/bleLibrary';
import { MainButton } from '../components/shared/MainButton ';
import * as ble from '../../device/ble/bleLibrary';

const SVC_UUID = '0000180f-0000-1000-8000-00805f9b34fb'; // Battery Service (LightBlue)
const CHR_UUID = '00002a19-0000-1000-8000-00805f9b34fb'; // Battery Level (usa notificaciones en AWR)

export const AWRScanResultsScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const [scanning, setScanning] = useState(true);
    const [startState, setStartState] = useState(0);
    const [hasDevices, setHasDevices] = useState(false);
    const [visible, setVisible] = useState(true);

    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [lastTag, setLastTag] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    // Guardamos referencias al device y a la suscripción para poder limpiar
    const subscriptionRef = useRef<any>(null);
    const connectedDeviceRef = useRef<any>(null);

    // Intenta conectar usando varias APIs posibles de tu bleLibrary
    async function tryConnectGeneric(bleMod: any, id: string) {
        const attempts = [
            () => bleMod?.connect?.(id),
            () => bleMod?.connectDevice?.(id),
            () => bleMod?.connectToDevice?.(id, { autoConnect: false }),
            () => bleMod?.manager?.connectToDevice?.(id, { autoConnect: false }),
            () => bleMod?.BleManager?.connectToDevice?.(id, { autoConnect: false }),
        ];

        let lastErr: any = null;
        for (const fn of attempts) {
            try {
                const dev = await fn?.();
                if (dev) return dev;
            } catch (e) { lastErr = e; }
        }
        if (lastErr) throw lastErr;
        throw new Error('No hay método de conexión compatible en bleLibrary');
    }

    async function tryDiscoverGeneric(dev: any, bleMod: any, id: string) {
        if (dev?.discoverAllServicesAndCharacteristics) {
            return await dev.discoverAllServicesAndCharacteristics();
        }
        if (bleMod?.discoverAllServicesAndCharacteristics) {
            return await bleMod.discoverAllServicesAndCharacteristics(id);
        }
        if (bleMod?.manager?.discoverAllServicesAndCharacteristicsForDevice) {
            return await bleMod.manager.discoverAllServicesAndCharacteristicsForDevice(id);
        }
        // si no hay discover explícito, seguimos (algunas libs lo hacen implícito)
        return dev || id;
    }

    async function tryRequestMtuGeneric(dev: any, bleMod: any, id: string, mtu: number) {
        if (Platform.OS !== 'android') return;
        try {
            if (dev?.requestMTU) return await dev.requestMTU(mtu);
            if (bleMod?.requestMTU) return await bleMod.requestMTU(id, mtu);
            if (bleMod?.manager?.requestMTUForDevice) return await bleMod.manager.requestMTUForDevice(id, mtu);
        } catch { }
    }

    function tryMonitorGeneric(dev: any, bleMod: any, id: string, svc: string, chr: string, cb: any) {
        // RN BLE PLX estilo device.*
        if (dev?.monitorCharacteristicForService) {
            return dev.monitorCharacteristicForService(svc, chr, cb);
        }
        // RN BLE PLX estilo manager.*
        if (bleMod?.manager?.monitorCharacteristicForDevice) {
            return bleMod.manager.monitorCharacteristicForDevice(id, svc, chr, cb);
        }
        // Wrapper propio
        if (bleMod?.monitorCharacteristicForService) {
            return bleMod.monitorCharacteristicForService(id, svc, chr, cb);
        }
        if (bleMod?.subscribe) {
            return bleMod.subscribe(id, svc, chr, cb);
        }
        return null;
    }


    const handleNoDevicesAccept = () => {
        setVisible(false);
        try { ble.stopScanning(); } catch { }
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('AWR-STARTSCAN' as never);
    };

    // === Helpers advertising / bytes ===
    const bytesToAscii = (bytes: number[]) => String.fromCharCode(...bytes.map(b => b & 0xff));
    const base64ToAscii = (b64?: string | null): string => {
        if (!b64) return '';
        try {
            return Buffer.from(b64, 'base64').toString('ascii');
        } catch {
            return '';
        }
    };

    const base64ToBytes = (b64: string): number[] => {
        try {
            const bin = Buffer.from(b64, 'base64').toString('binary');
            const out: number[] = [];
            for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i) & 0xff);
            return out;
        } catch { return []; }
    };

    const extractAdvBytesIOS = (adv: any): number[] | null => {
        if (!adv) return null;
        if (Array.isArray(adv.manufacturerRawData)) return adv.manufacturerRawData;
        if (adv.manufacturerData && typeof adv.manufacturerData === 'object') {
            const k = Object.keys(adv.manufacturerData)[0];
            if (k && Array.isArray(adv.manufacturerData[k])) return adv.manufacturerData[k];
        }
        if (adv.serviceData && typeof adv.serviceData === 'object') {
            const k = Object.keys(adv.serviceData)[0];
            const p: any = k ? adv.serviceData[k] : undefined;
            const bytes = Array.isArray(p) ? p : Array.isArray(p?.bytes) ? p.bytes : undefined;
            if (Array.isArray(bytes)) return bytes;
        }
        return null;
    };

    const getAdvBytes = (d: any): number[] | null => {
        if (Array.isArray(d?.advBytes) && d.advBytes.length) return d.advBytes;
        const adv: any = d.peripheral?.advertising || d.advertising || {};

        const ios = extractAdvBytesIOS(adv);
        if (Array.isArray(ios)) return ios;

        if (adv?.manufacturerData?.bytes && Array.isArray(adv.manufacturerData.bytes)) return adv.manufacturerData.bytes;
        if (typeof adv?.manufacturerData === 'string') {
            const arr = base64ToBytes(adv.manufacturerData);
            if (arr.length) return arr;
        }
        if (typeof adv?.manufacturerData?.data === 'string') {
            const arr = base64ToBytes(adv.manufacturerData.data);
            if (arr.length) return arr;
        }
        if (Array.isArray(adv?.manufacturerRawData)) return adv.manufacturerRawData;
        if (adv?.rawData?.bytes && Array.isArray(adv.rawData.bytes)) return adv.rawData.bytes;

        if (typeof d.advertising === 'string' && d.advertising.includes(',')) {
            const arr = d.advertising.split(',').map((n: string) => Number(n));
            if (arr.every((x: any) => Number.isFinite(x))) return arr;
        }
        return null;
    };

    // === Helpers identificación / etiquetas ===
    const macHasAllowedPrefix = (id?: string | null) => {
        if (!id) return false;
        const parts = id.toUpperCase().split(':');
        if (parts.length >= 3) {
            const oui = parts.slice(0, 3).join(':');
            return ['00:04:3E'].includes(oui); // OUI Agrident
        }
        return false;
    };

    const getLocalName = (d: BlePeripheral): string => {
        const adv: any = (d as any).peripheral?.advertising || (d as any).advertising || {};
        return (d.name || adv.localName || '').toString();
    };

    const macSuffix = (id?: string | null) => {
        if (!id) return '';
        const up = id.toUpperCase();
        if (!up.includes(':')) return ''; // iOS oculta MAC
        const parts = up.split(':');
        return parts.length >= 2 ? parts.slice(-2).join('') : '';
    };

    const labelFor = (d: BlePeripheral) =>
        macSuffix(d.id) || getLocalName(d) || (d.id ?? '').toUpperCase();

    const isAWR = (d: BlePeripheral): boolean => {
        if (macHasAllowedPrefix(d.id)) return true; // 1) OUI
        const local = getLocalName(d).toUpperCase(); // 2) Nombre
        if (local.startsWith('AWR300')) return true;
        const bytes = getAdvBytes(d);               // 3) Advertising
        if (Array.isArray(bytes) && bytes.length) {
            const s = bytesToAscii(bytes).toUpperCase();
            if (s.includes('AWR300')) return true;
        }
        return false;
    };

    // === Ciclo BLE (escaneo) ===
    useEffect(() => {
        ble.BleStart();
        ble.bleAddListener();
        return () => {
            try { ble.stopScanning(); } catch { }
            ble.bleRemoveListener();
            cleanupConnection();
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (startState < 2) {
                setStartState(startState + 1);
            } else {
                setScanning(false);
                const found = ble.devices.some(isAWR);
                setHasDevices(found);

                // Debug
                ble.devices.forEach((device, idx) => {
                    const adv = getAdvBytes(device) ?? [];
                    console.log(`AWR scan [${idx + 1}]`, device.id, device.name, adv);
                });
            }
        }, stateStep());
        return () => clearTimeout(timer);
    }, [startState]);

    const stateStep = (): number => {
        switch (startState) {
            case 0: return 300;
            case 1: ble.startScanning(); return 3500;
            case 2: ble.stopScanning(); return 100;
            default: return 0;
        }
    };

    // === Conexión y suscripción ===
    const cleanupConnection = () => {
        try { subscriptionRef.current?.remove?.(); } catch { }
        subscriptionRef.current = null;

        const dev = connectedDeviceRef.current;
        if (dev?.cancelConnection) {
            try { dev.cancelConnection(); } catch { }
        }
        connectedDeviceRef.current = null;
        setConnected(false);
        setConnecting(false);
        setCurrentId(null);
    };

    const connectAndSubscribe = async (id: string) => {
        setErrorMsg('');
        setConnecting(true);
        setCurrentId(id);
        setLastTag('');

        try {
            try { ble.stopScanning(); } catch { }

            // 1) Conectar con TU librería
            await ble.bleConnection(id);

            // 2) (Opcional) MTU Android
            //await ble.bleRequestMtu?.(185);

            // 3) Suscribir a Battery Level del Battery Service
            const sub = await ble.bleSubscribeGeneric(
                '0000180f-0000-1000-8000-00805f9b34fb', // SVC 0x180F
                '00002a19-0000-1000-8000-00805f9b34fb', // CHR 0x2A19
                (value: number[]) => {
                    const ascii = String.fromCharCode(...value).replace(/\r?\n/g, '').trim();
                    if (ascii) {
                        setLastTag(ascii);
                        console.log('TAG:', ascii);
                    }
                }
            );

            subscriptionRef.current = sub; // tiene .remove()
            setConnected(true);
        } catch (e: any) {
            console.log('connectAndSubscribe error', e);
            const msg = String(e?.message || e);
            if (msg.toLowerCase().includes('already')) {
                setErrorMsg('El dispositivo ya está conectado (cierra LightBlue si lo tienes abierto).');
            } else if (msg.toLowerCase().includes('connect')) {
                setErrorMsg('No se pudo conectar. Revisa permisos y que Bluetooth/ubicación estén activos.');
            } else {
                setErrorMsg(msg || 'Error de conexión');
            }
            cleanupConnection();
        } finally {
            setConnecting(false);
        }
    };


    const onNotif = (error: any, characteristic: any) => {
        if (error) {
            console.log('Notif error', error);
            setErrorMsg('Error en notificaciones');
            return;
        }
        const ascii = base64ToAscii(characteristic?.value).replace(/\r?\n/g, '').trim();
        if (!ascii) return;

        // El AWR manda los crotales como ASCII (+ CRLF). Ej: "982091072397439"
        setLastTag(ascii);
        console.log('TAG:', ascii);
    };

    // === UI ===
    const RenderIsScanning = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text style={{ fontSize: 18, marginTop: 8 }}>Buscando AWR300…</Text>
        </View>
    );

    const RenderDevicesNotFound = () => (
        <View style={{ alignItems: 'center', marginVertical: 60 }}>
            <Portal>
                <Dialog visible={visible} onDismiss={handleNoDevicesAccept}>
                    <Dialog.Icon icon="warning" color="red" size={60} />
                    <Dialog.Title style={{ color: 'red' }}>Aviso</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyLarge">No se han encontrado AWR300 cercanos.</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleNoDevicesAccept}>Aceptar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );

    const renderDevice = (device: BlePeripheral) => {
        if (!isAWR(device)) return null;
        const label = labelFor(device);
        return (
            <View key={device.id} style={{ marginTop: 12 }}>
                <MainButton
                    onPress={() => connectAndSubscribe(device.id)}
                    label={label}
                    size={3}
                />
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title="AWR300 – Resultados de escaneo" />
                {connected && (
                    <Appbar.Action icon="power" onPress={cleanupConnection} />
                )}
            </Appbar.Header>

            {/* Estado de conexión / último crotal */}
            {(connecting || connected || lastTag || errorMsg) && (
                <View style={{ marginHorizontal: 24, marginTop: 16 }}>
                    <Card mode="contained" style={{ borderRadius: 16, padding: 12 }}>
                        {connecting && <Text>Conectando a {currentId}…</Text>}
                        {connected && !lastTag && <Text>Conectado. Esperando lectura…</Text>}
                        {!!lastTag && (
                            <Text style={{ fontSize: 20, fontWeight: '700' }}>
                                Último crotal: {lastTag}
                            </Text>
                        )}
                        {!!errorMsg && (
                            <Text style={{ color: 'red', marginTop: 4 }}>{errorMsg}</Text>
                        )}
                        {connected && (
                            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                                <Button mode="contained-tonal" onPress={() => {
                                    try { subscriptionRef.current?.remove?.(); } catch { }
                                    subscriptionRef.current = null;
                                    setLastTag('');
                                }}>
                                    Desuscribir
                                </Button>
                                <Button mode="contained" onPress={cleanupConnection}>
                                    Desconectar
                                </Button>
                            </View>
                        )}
                    </Card>
                </View>
            )}

            {scanning && <RenderIsScanning />}

            {!scanning && (
                hasDevices ? (
                    <View style={{ marginTop: 24, marginHorizontal: 40 }}>
                        {ble.devices.map(renderDevice)}
                    </View>
                ) : (
                    <RenderDevicesNotFound />
                )
            )}
        </View>
    );
};
