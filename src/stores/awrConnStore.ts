// stores/awrConnStore.ts
/* eslint-disable prettier/prettier */
import { create } from 'zustand';
import { Buffer } from 'buffer';
import * as ble from '../device/ble/bleLibrary'; // ajusta la ruta a tu bleLibrary

const SVC_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const CHR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';

// handler global de notificaciones para poder limpiarlo
let notifHandle: { remove?: () => Promise<void> | void } | null = null;
// acumulador de texto entre notificaciones
let acc = '';

type State = {
    currentId: string | null;
    connecting: boolean;
    isConnected: boolean;
    error: string | null;

    lastTag: string | null;
    history: string[];

    ensureBle: () => Promise<void>;
    connect: (id: string) => Promise<void>;
    disconnect: () => Promise<void>;
    startReading: () => Promise<void>;
    stopReading: () => Promise<void>;
    clearHistory: () => void;
};

export const useAwrConn = create<State>((set, get) => ({
    currentId: null,
    connecting: false,
    isConnected: false,
    error: null,

    lastTag: null,
    history: [],

    // Asegura que BLE está inicializado (evita crashes al conectar desde el drawer)
    ensureBle: async () => {
        try { ble.BleStart(); } catch { }
    },

    connect: async (id: string) => {
        const s = get();
        set({ connecting: true, error: null });
        try {
            await s.ensureBle();         // <- importante
            await ble.bleConnection(id); // tu wrapper con react-native-ble-manager
            set({ currentId: id, isConnected: true });
        } catch (e: any) {
            set({ error: String(e?.message || e), isConnected: false });
            throw e;
        } finally {
            set({ connecting: false });
        }
    },

    disconnect: async () => {
        const id = get().currentId;
        try { await get().stopReading(); } catch { }
        if (id) {
            try { await ble.bleDisconnection?.(id); } catch { }
        }
        set({ isConnected: false, currentId: null });
    },

    startReading: async () => {
        const id = get().currentId;
        if (!id) throw new Error('No hay dispositivo conectado');
        if (notifHandle) return; // ya suscrito

        // limpia historial si quieres empezar de cero
        // set({ history: [], lastTag: null });

        notifHandle = await ble.bleSubscribeGeneric(SVC_UUID, CHR_UUID, (value: number[]) => {
            const chunk = Buffer.from(value).toString('utf8'); // o 'ascii'
            acc += chunk;

            const parts = acc.split(/\r?\n/);
            acc = parts.pop() ?? '';

            parts.forEach(line => {
                const clean = line.trim();
                if (!clean) return;

                const matches = clean.match(/\d{15}/g);
                if (matches && matches.length) {
                    // guardar todos los de la línea, último como lastTag
                    set(state => ({
                        lastTag: matches[matches.length - 1],
                        history: [...matches.reverse(), ...state.history].slice(0, 50),
                    }));
                } else {
                    set({ lastTag: clean });
                }
            });
        });
    },

    stopReading: async () => {
        try { await notifHandle?.remove?.(); } catch { }
        notifHandle = null;
        acc = '';
    },

    clearHistory: () => set({ history: [], lastTag: null }),
}));
