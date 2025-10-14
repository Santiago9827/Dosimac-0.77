// screens/Maternity/MatAddAnimalsScreen.tsx
/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList, Alert, Platform,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAwrConn } from '../../stores/awrConnStore';

type RouteParams = {
    corral: string | number;
};

const CARD_BORDER = '#E2E8F0';
const BRAND = '#4F46E5';

export default function MatAddAnimalsScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { corral } = (route.params || {}) as RouteParams;

    // 🔌 AWR300 store (ya lo tienes)
    const { isConnected, startReading, lastTag, error } = useAwrConn();

    // Cola de crotales (sin duplicados)
    const [input, setInput] = useState('');
    const [cola, setCola] = useState<string[]>([]);

    const normaliza = (s: string) =>
        String(s ?? '').trim().toUpperCase().replace(/\s+/g, '');

    const addCrotal = useCallback((raw: string) => {
        const code = normaliza(raw);
        if (!code) return;
        setCola(prev => (prev.includes(code) ? prev : [code, ...prev]));
    }, []);

    const removeCrotal = (code: string) =>
        setCola(prev => prev.filter(c => c !== code));

    const clearAll = () =>
        setCola([]);

    // Al cambiar lastTag desde el lector, lo añadimos
    useEffect(() => {
        if (lastTag) addCrotal(lastTag);
    }, [lastTag, addCrotal]);

    // Iniciar lectura al entrar (si ya estás conectado, solo asegura la suscripción)
    useFocusEffect(
        useCallback(() => {
            startReading().catch(() => { });
            return () => {
                // si tienes stopReading, llámalo aquí
            };
        }, [startReading])
    );

    const onAddManual = () => {
        addCrotal(input);
        setInput('');
    };

    const onEnviar = () => {
        if (cola.length === 0) return;


        const animals = cola.map((crotal, idx) => ({
            id: idx + 1,
            crotal,
            corral: String(corral),
            total: 0,
            consumida: 0,
            curva: 'DEFECTO',
        }));

        navigation.navigate('MAT-CORRALDETAIL' as never, { corral, animals } as never);
    };

    const encabezado = useMemo(() => (
        <View
            className="rounded-2xl border p-4 bg-white mb-3"
            style={{ borderColor: CARD_BORDER }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="home-outline" size={18} color="#0f172a" />
                <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                    Corral {String(corral ?? '—')}
                </Text>
            </View>

            <View style={{ marginTop: 12 }}>
                <Text style={{ color: '#64748B', marginBottom: 6 }}>Añadir manualmente</Text>
                <View
                    className="flex-row items-center rounded-xl bg-white border px-3"
                    style={{ borderColor: CARD_BORDER, height: 46 }}
                >
                    <Ionicons name="pricetag-outline" size={18} color="#64748B" />
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Crotal…"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-2 text-slate-900"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        onSubmitEditing={onAddManual}
                        returnKeyType="done"
                    />
                    <TouchableOpacity onPress={onAddManual} disabled={!normaliza(input)}>
                        <Text style={{ color: normaliza(input) ? BRAND : '#94A3B8', fontWeight: '700' }}>
                            Añadir
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ marginTop: 12 }}>
                <Text style={{ color: '#64748B', marginBottom: 6 }}>Lectura AWR300</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={isConnected ? 'radio-outline' : 'alert-circle-outline'} size={16} color={isConnected ? '#16A34A' : '#DC2626'} />
                    <Text style={{ marginLeft: 6, color: isConnected ? '#16A34A' : '#DC2626' }}>
                        {isConnected ? 'Conectado y leyendo… acerque tags' : 'No conectado'}
                    </Text>
                </View>
                {!!error && <Text style={{ color: '#DC2626', marginTop: 4 }}>{error}</Text>}
            </View>
        </View>
    ), [corral, input, isConnected, error]);

    return (
        <View className="flex-1 bg-slate-50" style={{ padding: 16 }}>
            {encabezado}

            {/* Lista de la cola */}
            <View
                className="rounded-2xl border bg-white"
                style={{ borderColor: CARD_BORDER, flex: 1, overflow: 'hidden' }}
            >
                <View style={{ paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#0f172a', fontWeight: '800' }}>Cola de crotales</Text>
                    <TouchableOpacity onPress={clearAll} disabled={cola.length === 0}>
                        <Text style={{ color: cola.length ? '#DC2626' : '#94A3B8', fontWeight: '700' }}>Limpiar</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={cola}
                    keyExtractor={(item) => item}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: CARD_BORDER }} />}
                    renderItem={({ item }) => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
                            <Ionicons name="pricetag-outline" size={16} color="#0f172a" />
                            <Text style={{ flex: 1, marginLeft: 8, color: '#0f172a', fontWeight: '700' }}>{item}</Text>
                            <TouchableOpacity onPress={() => removeCrotal(item)}>
                                <Ionicons name="trash-outline" size={18} color="#DC2626" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 18, alignItems: 'center' }}>
                            <Text style={{ color: '#64748B' }}>Aún no hay crotales en cola.</Text>
                        </View>
                    )}
                    showsVerticalScrollIndicator
                />
            </View>

            {/* Enviar */}
            <TouchableOpacity
                onPress={onEnviar}
                activeOpacity={0.9}
                style={{
                    marginTop: 12,
                    height: 50,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: cola.length ? BRAND : '#C7D2FE',
                    shadowColor: '#000',
                    shadowOpacity: 0.16,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                }}
                disabled={cola.length === 0}
            >
                <Text className="text-white font-semibold">Enviar ({cola.length})</Text>
            </TouchableOpacity>
        </View>
    );
}
