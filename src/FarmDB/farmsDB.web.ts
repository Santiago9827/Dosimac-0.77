// src/FarmDB/farmsDB.web.ts
import type { farmFacility } from '../sharedTypes/farmInterface';

type StorageLike = {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
};

const storage: StorageLike = (() => {
    try {
        const ls = (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) as StorageLike | undefined;
        if (ls && typeof ls.getItem === 'function') return ls;
    } catch { }
    // Fallback en memoria (no persiste entre recargas fuera del navegador)
    const mem: Record<string, string> = {};
    return {
        getItem: (k) => (k in mem ? mem[k] : null),
        setItem: (k, v) => { mem[k] = v; },
        removeItem: (k) => { delete mem[k]; },
        clear: () => { for (const k of Object.keys(mem)) delete mem[k]; },
    };
})();

const KEY = 'farms';

function read(): farmFacility[] {
    try {
        const raw = storage.getItem(KEY);
        return raw ? (JSON.parse(raw) as farmFacility[]) : [];
    } catch {
        return [];
    }
}
function write(list: farmFacility[]) {
    storage.setItem(KEY, JSON.stringify(list));
}
function nextId(list: farmFacility[]) {
    return list.reduce((m, x) => Math.max(m, Number(x.id ?? 0)), 0) + 1;
}

// ===== API compatible con tu código =====
export async function InicialiceFarmDataTable() {
    if (storage.getItem(KEY) == null) write([]);
}
export async function CreateFarmDataTable() {
    write([]);
}
export async function InsertFarmData(farm: farmFacility) {
    const list = read();
    const id = farm.id ?? nextId(list);
    const rec: farmFacility = { ...farm, id };
    list.push(rec);
    write(list);
    return id;
}
export async function UpdateFarmData(farm: farmFacility) {
    const list = read();
    if (farm.id == null) throw new Error('UpdateFarmData: falta id');
    const idx = list.findIndex(x => Number(x.id) === Number(farm.id));
    if (idx === -1) throw new Error(`UpdateFarmData: no existe id ${farm.id}`);
    list[idx] = { ...list[idx], ...farm };
    write(list);
    return list[idx];
}
export async function DeleteFarmData(farm: farmFacility) {
    if (farm.id == null) return;
    await deleteFarmById(farm.id);
}
export async function deleteFarmById(id: number) {
    const list = read();
    write(list.filter(x => Number(x.id) !== Number(id)));
}
export async function GetFarmsList(): Promise<farmFacility[]> {
    return read().sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
}
export async function GetFarmDataById(id: number): Promise<farmFacility> {
    const item = read().find(x => Number(x.id) === Number(id));
    if (!item) throw new Error(`GetFarmDataById: no existe id ${id}`);
    return item;
}
export async function GetFarmDataByName(name: string): Promise<farmFacility | undefined> {
    return read().find(x => (x.name || '').toLowerCase() === name.toLowerCase());
}
export async function seedDbFarmList() {
    if (read().length) return;
    write([
        { id: 1, name: 'Granja Santomera', location: 'Santomera', province: 'Murcia', userName: 'Alfonso', password: '123456', ssid: 'miwifi1', wifiPassword: '123456', serverIp: '192.168.1.1' },
        { id: 2, name: 'Granja Aljofrin', location: 'Aljofrin', province: 'Toledo', userName: 'roberto', password: '123456', ssid: 'miwifi2', wifiPassword: '123456', serverIp: '192.168.1.2' },
    ]);
}
