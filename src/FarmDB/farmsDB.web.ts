// src/FarmDB/farmsDB.web.ts
import localforage from 'localforage';
import type { farmFacility } from '../sharedTypes/farmInterface';

// Creamos una instancia separada para "farms"
const lf = localforage.createInstance({
    name: 'cti-db',
    storeName: 'farms',   // nombre de la "tabla"
    description: 'Farms list for web (IndexedDB via localForage)',
});

// Clave única donde guardaremos un array con todas las farms.
// Si prefieres 1 registro por farm, también se puede, pero esto
// replica tu diseño actual (lista completa).
const KEY = 'farms_array';

async function read(): Promise<farmFacility[]> {
    const arr = (await lf.getItem<farmFacility[]>(KEY)) ?? [];
    // Orden estable por id asc
    return arr.slice().sort((a, b) => Number(a.id ?? 0) - Number(b.id ?? 0));
}

async function write(list: farmFacility[]) {
    await lf.setItem(KEY, list);
}

function nextId(list: farmFacility[]) {
    return list.reduce((m, x) => Math.max(m, Number(x.id ?? 0)), 0) + 1;
}

// Reparar datos antiguos con id=0 o duplicados (una sola vez por arranque)
async function repairIdsOnce() {
    const list = await read();
    if (!list.length) return;

    let changed = false;
    let max = list.reduce((m, x) => Math.max(m, Number(x.id || 0)), 0);
    const used = new Set<number>();

    for (const x of list) {
        const n = Number(x.id);
        if (!Number.isFinite(n) || n <= 0 || used.has(n)) {
            max += 1;
            (x as any).id = max;
            used.add(max);
            changed = true;
        } else {
            used.add(n);
        }
    }
    if (changed) await write(list);
}

// ── API compatible con tu código actual ───────────────────────────────────────
export async function InicialiceFarmDataTable() {
    // Garantiza que existe la clave; si no, arranca vacía
    const has = await lf.getItem(KEY);
    if (has == null) await write([]);
    await repairIdsOnce();
}

export async function CreateFarmDataTable() {
    await write([]);
}

export async function InsertFarmData(farm: farmFacility) {
    const list = await read();
    const n = Number((farm as any).id);
    const id = Number.isFinite(n) && n > 0 ? n : nextId(list);
    const rec: farmFacility = { ...farm, id };
    list.push(rec);
    await write(list);
    return id;
}

export async function UpdateFarmData(farm: farmFacility) {
    const list = await read();
    if (farm.id == null) throw new Error('UpdateFarmData: falta id');

    const idx = list.findIndex((x) => Number(x.id) === Number(farm.id));
    if (idx === -1) throw new Error(`UpdateFarmData: no existe id ${farm.id}`);

    list[idx] = { ...list[idx], ...farm, id: Number(farm.id) };
    await write(list);
    return list[idx];
}

export async function DeleteFarmData(farm: farmFacility) {
    if (farm.id == null) return;
    await deleteFarmById(farm.id);
}

export async function deleteFarmById(id: number) {
    const list = await read();
    const next = list.filter((x) => Number(x.id) !== Number(id));
    await write(next);
}

export async function GetFarmsList(): Promise<farmFacility[]> {
    return read();
}

export async function GetFarmDataById(id: number): Promise<farmFacility> {
    const item = (await read()).find((x) => Number(x.id) === Number(id));
    if (!item) throw new Error(`GetFarmDataById: no existe id ${id}`);
    return item;
}

export async function GetFarmDataByName(name: string) {
    const lower = (name || '').toLowerCase();
    return (await read()).find((x) => (x.name || '').toLowerCase() === lower);
}

export async function seedDbFarmList() {
    if ((await read()).length) return;
    await write([
        {
            id: 1,
            name: 'Granja Santomera',
            location: 'Santomera',
            province: 'Murcia',
            userName: 'Alfonso',
            password: '123456',
            ssid: 'miwifi1',
            wifiPassword: '123456',
            serverIp: '192.168.1.1',
        },
        {
            id: 2,
            name: 'Granja Aljofrin',
            location: 'Aljofrin',
            province: 'Toledo',
            userName: 'Roberto',
            password: '123456',
            ssid: 'miwifi2',
            wifiPassword: '123456',
            serverIp: '192.168.1.2',
        },
    ]);
}
