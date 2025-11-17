// / <reference types="web-bluetooth" />

// src/libs/bleLibrary.web.ts
// Implementación Web Bluetooth para DOSIMAC

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
const CHAR_WRITE_UUID = '12345678-1234-5678-1234-56789abcdef1';
const CHAR_NOTIFY_UUID = '12345678-1234-5678-1234-56789abcdef2';
const NAME_PREFIX = 'DOSIMAC';

function ensureSupport() {
    if (typeof navigator === 'undefined' || !('bluetooth' in navigator)) {
        throw new Error('Web Bluetooth no está soportado en este navegador. Usa Chrome/Edge sobre HTTPS o localhost.');
    }
    if (typeof window !== 'undefined' && !window.isSecureContext) {
        throw new Error('Web Bluetooth requiere contexto seguro (HTTPS o localhost).');
    }
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
    // Si ya cubre todo el buffer y ES ArrayBuffer, lo reutilizamos
    if (
        view.byteOffset === 0 &&
        view.buffer instanceof ArrayBuffer &&
        view.byteLength === view.buffer.byteLength
    ) {
        return view.buffer;
    }

    const ab = new ArrayBuffer(view.byteLength);
    new Uint8Array(ab).set(
        new Uint8Array(view.buffer, view.byteOffset, view.byteLength)
    );
    return ab;
}


export type WebBleHandle = {
    device: BluetoothDevice;
    server: BluetoothRemoteGATTServer;
    service: BluetoothRemoteGATTService;
    writeChar?: BluetoothRemoteGATTCharacteristic;
    notifyChar?: BluetoothRemoteGATTCharacteristic;
};

export async function BleStart() {
    ensureSupport();
}

export async function requestDosimacDevice(): Promise<BluetoothDevice> {
    ensureSupport();

    const options: RequestDeviceOptions = {
        filters: [
            { namePrefix: NAME_PREFIX },
            { services: [SERVICE_UUID as BluetoothServiceUUID] },
        ],
        optionalServices: [SERVICE_UUID as BluetoothServiceUUID, 'device_information'],
    };

    // Debe llamarse desde un onPress real de usuario
    const device = await navigator.bluetooth.requestDevice(options);
    return device;
}

export async function connectDosimac(device: BluetoothDevice): Promise<WebBleHandle> {
    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService(SERVICE_UUID as BluetoothServiceUUID);

    let writeChar: BluetoothRemoteGATTCharacteristic | undefined;
    let notifyChar: BluetoothRemoteGATTCharacteristic | undefined;

    try { writeChar = await service.getCharacteristic(CHAR_WRITE_UUID as BluetoothCharacteristicUUID); } catch { }
    try { notifyChar = await service.getCharacteristic(CHAR_NOTIFY_UUID as BluetoothCharacteristicUUID); } catch { }

    return { device, server, service, writeChar, notifyChar };
}

export async function startNotifications(handle: WebBleHandle, onData: (data: DataView) => void) {
    if (!handle.notifyChar) throw new Error('Característica notify no disponible.');
    handle.notifyChar.addEventListener('characteristicvaluechanged', (ev: Event) => {
        const target = ev.target as BluetoothRemoteGATTCharacteristic;
        if (target?.value) onData(target.value);
    });
    await handle.notifyChar.startNotifications();
}

export async function writeBytes(handle: WebBleHandle, bytes: Uint8Array) {
    if (!handle.writeChar) throw new Error('Característica write no disponible.');
    const ab = toArrayBuffer(bytes);
    await handle.writeChar.writeValue(ab);
}


export function disconnect(handle: WebBleHandle) {
    try { handle.device.gatt?.disconnect(); } catch { }
}

// API similar a nativo
export async function startScanning(): Promise<BluetoothDevice> {
    return requestDosimacDevice();
}
