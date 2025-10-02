// screens/awr/AWRReadScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Appbar, Text, Card } from 'react-native-paper';
import { Buffer } from 'buffer';
import * as ble from '../../device/ble/bleLibrary';

const SVC_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const CHR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';

export const AWRReadScreen = ({ navigation, route }: any) => {
    const { id, label } = route.params || {};
    const [errorMsg, setErrorMsg] = useState('');
    const [lastTag, setLastTag] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);

    const subRef = useRef<any>(null);
    const bufferRef = useRef<string>(''); // acumulador de texto entre notificaciones

    useEffect(() => {
        (async () => {
            try {
                // Por si acaso; si ya estaba conectado, ignoramos el error
                try { await ble.bleConnection(id); } catch { }

                // Suscribir a notificaciones
                subRef.current = await ble.bleSubscribeGeneric(SVC_UUID, CHR_UUID, onChunk);
            } catch (e: any) {
                setErrorMsg(String(e?.message || e));
            }
        })();

        // Limpieza automática al salir
        return () => {
            (async () => {
                try { await subRef.current?.remove?.(); } catch { }
                try { await ble.bleDisconnection?.(id); } catch { }
            })();
        };
    }, [id]);

    // Procesa cada "trozo" recibido (UTF-8 / ASCII)
    const onChunk = (value: number[]) => {
        const chunk = Buffer.from(value).toString('utf8'); // o 'ascii'
        bufferRef.current += chunk;

        // Partimos por CR/LF y dejamos en el buffer el resto incompleto
        const parts = bufferRef.current.split(/\r?\n/);
        bufferRef.current = parts.pop() ?? '';

        for (const p of parts) {
            const clean = p.trim();
            if (!clean) continue;

            // Si en la línea hay un crotal de 15 dígitos, lo guardamos
            const matches = clean.match(/\d{15}/g);
            if (matches) {
                for (const tag of matches) {
                    setLastTag(tag);
                    setTags(prev => [tag, ...prev].slice(0, 50)); // últimos 50
                }
            } else {
                // Si no, mostramos la línea cruda (útil por si llega otro formato)
                setLastTag(clean);
            }

            // (opcional) log para depurar lo que llega realmente
            console.log('AWR line:', clean);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title={`AWR300 – Lectura (${label || id})`} />
            </Appbar.Header>

            <View style={{ marginHorizontal: 16, marginTop: 12 }}>
                <Card mode="contained" style={{ borderRadius: 16, padding: 12 }}>
                    {!!errorMsg && <Text style={{ color: 'red' }}>{errorMsg}</Text>}
                    {!errorMsg && (
                        <>
                            <Text>Conectado y suscrito a notificaciones.</Text>
                            {!!lastTag && (
                                <Text style={{ marginTop: 8, fontSize: 22, fontWeight: '700' }}>
                                    Último recibido: {lastTag}
                                </Text>
                            )}
                        </>
                    )}
                </Card>
            </View>

            <View style={{ marginTop: 12, flex: 1 }}>
                <FlatList
                    data={tags}
                    keyExtractor={(item, idx) => `${item}-${idx}`}
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                            <Text style={{ fontSize: 18 }}>{item}</Text>
                        </View>
                    )}
                    ListHeaderComponent={
                        <Text style={{ paddingHorizontal: 16, paddingVertical: 8, opacity: 0.6 }}>
                            Historial (últimos 50)
                        </Text>
                    }
                />
            </View>
        </View>
    );
};
