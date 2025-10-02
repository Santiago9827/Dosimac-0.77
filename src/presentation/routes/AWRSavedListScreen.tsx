/* eslint-disable prettier/prettier */
import React from 'react';
import { View, FlatList } from 'react-native';
import { Appbar, List, Text, ActivityIndicator } from 'react-native-paper';
import { awrStore } from '../../stores/awrStore';
import { useAwrConn } from '../../stores/awrConnStore';
import { useEffect } from 'react';


export const AWRSavedListScreen = ({ navigation }: any) => {
    const saved = awrStore(s => s.devices);
    const { ensureBle, connect, startReading, isConnected, currentId, connecting, error } = useAwrConn();

    useEffect(() => {
        ensureBle(); // asegura listeners activos al entrar en la pantalla
    }, []);

    const handlePress = async (id: string, title: string) => {
        try {
            await connect(id);
            await startReading();

        } catch { }
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar.Header elevated>
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content title="AWR escaneados" />
            </Appbar.Header>

            {connecting && (
                <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator />
                    <Text>Conectando…</Text>
                </View>
            )}
            {!!error && <Text style={{ color: 'red', paddingHorizontal: 16 }}>{error}</Text>}

            {saved.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                    <Text style={{ textAlign: 'center' }}>
                        No hay AWR guardados. Escanea uno desde “Prueba AWR300”.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={saved}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const title = item.name || item.label || item.id;
                        const isThisConnected = isConnected && currentId === item.id;
                        const isThis = currentId && currentId.toLowerCase() === item.id.toLowerCase();
                        const rightLabel = isThis ? (isConnected ? 'Conectado' : 'Desconectado') : '';

                        return (
                            <List.Item
                                title={title}
                                description={item.id}
                                left={props => <List.Icon {...props} icon={isThisConnected ? 'check-circle' : 'bluetooth'} />}
                                right={() => rightLabel ? <Text style={{ marginRight: 12, color: isConnected ? 'green' : '#666' }}>{rightLabel}</Text> : null}
                                onPress={() => handlePress(item.id, title)}
                            />
                        );
                    }}
                />
            )}
        </View>
    );
};
