// screens/awr/AWRScanResultsScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Appbar, ActivityIndicator, Text, Portal, Dialog, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Buffer } from 'buffer';
import { BlePeripheral } from '../../device/ble/bleLibrary';
import { MainButton } from '../components/shared/MainButton ';
import * as ble from '../../device/ble/bleLibrary';

export const AWRScanResultsScreen = ({ navigation }) => {
    const { t } = useTranslation();

    const [scanning, setScanning] = useState(true);
    const [startState, setStartState] = useState(0);
    const [hasDevices, setHasDevices] = useState(false);
    const [visible, setVisible] = useState(true);

    const handleNoDevicesAccept = () => {
        setVisible(false);
        try { ble.stopScanning(); } catch { }
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('AWR-STARTSCAN' as never); // fallback si entraron directo
    };

    // === Helpers advertising / bytes ===
    const bytesToAscii = (bytes: number[]) => String.fromCharCode(...bytes.map(b => b & 0xff));
    const base64ToBytes = (b64: string): number[] => {
        try {
            const bin = Buffer.from(b64, 'base64').toString('binary');
            const out: number[] = [];
            for (let i = 0; i < bin.length; i++) out.push(bin.charCodeAt(i) & 0xff);
            return out;
        } catch {
            return [];
        }
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

        if (adv?.manufacturerData?.bytes && Array.isArray(adv.manufacturerData.bytes)) {
            return adv.manufacturerData.bytes;
        }
        if (typeof adv?.manufacturerData === 'string') {
            const arr = base64ToBytes(adv.manufacturerData);
            if (arr.length) return arr;
        }
        if (typeof adv?.manufacturerData?.data === 'string') {
            const arr = base64ToBytes(adv.manufacturerData.data);
            if (arr.length) return arr;
        }
        if (Array.isArray(adv?.manufacturerRawData)) {
            return adv.manufacturerRawData;
        }
        if (adv?.rawData?.bytes && Array.isArray(adv.rawData.bytes)) {
            return adv.rawData.bytes;
        }

        // fallback "17,67,..."
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
            return ['00:04:3E'].includes(oui); // OUI Agrident de tu captura
        }
        return false;
    };

    const getLocalName = (d: BlePeripheral): string => {
        const adv: any = (d as any).peripheral?.advertising || (d as any).advertising || {};
        return (d.name || adv.localName || '').toString();
    };

    // Últimos 2 octetos de la MAC sin ':', ej. "1EB9"
    const macSuffix = (id?: string | null) => {
        if (!id) return '';
        const up = id.toUpperCase();
        if (!up.includes(':')) return ''; // iOS puede no exponer MAC
        const parts = up.split(':');
        return parts.length >= 2 ? parts.slice(-2).join('') : '';
    };

    // Etiqueta mostrada en el botón: prioridad MAC -> nombre -> id
    const labelFor = (d: BlePeripheral) =>
        macSuffix(d.id) || getLocalName(d) || (d.id ?? '').toUpperCase();

    // Detección de AWR: prioridad MAC -> nombre -> advertising
    const isAWR = (d: BlePeripheral): boolean => {
        if (macHasAllowedPrefix(d.id)) return true;                 // 1) OUI
        const local = getLocalName(d).toUpperCase();                 // 2) Nombre
        if (local.startsWith('AWR300')) return true;
        const bytes = getAdvBytes(d);                                // 3) Advertising
        if (Array.isArray(bytes) && bytes.length) {
            const s = bytesToAscii(bytes).toUpperCase();
            if (s.includes('AWR300')) return true;
        }
        return false;
    };

    // === Ciclo BLE ===
    useEffect(() => {
        ble.BleStart();
        ble.bleAddListener();
        return () => ble.bleRemoveListener();
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
        return (
            <View key={device.id} style={{ marginTop: 12 }}>
                <MainButton
                    onPress={() => {
                        // Próximo paso: conectar y suscribir característica de notificaciones
                        console.log('AWR tapped:', device.id);
                    }}
                    label={labelFor(device)}
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
            </Appbar.Header>

            {scanning && <RenderIsScanning />}

            {!scanning && (
                hasDevices ? (
                    <View style={{ marginTop: 40, marginHorizontal: 40 }}>
                        {ble.devices.map(renderDevice)}
                    </View>
                ) : (
                    <RenderDevicesNotFound />
                )
            )}
        </View>
    );
};
