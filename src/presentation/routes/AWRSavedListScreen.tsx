/* eslint-disable prettier/prettier */
import React from 'react';
import { View, FlatList } from 'react-native';
import { Appbar, List, Text, ActivityIndicator } from 'react-native-paper';
import { awrStore } from '../../stores/awrStore';
import { useAwrConn } from '../../stores/awrConnStore';

export const AWRSavedListScreen = ({ navigation }: any) => {
    const saved = awrStore(s => s.devices);
    const { connect, startReading, isConnected, currentId, connecting, error } = useAwrConn();

    const handlePress = async (id: string, title: string) => {
        try {
            await connect(id);
            await startReading();
            // NO navega. Si quieres abrir lectura manualmente:
            // navigation.navigate('AWR-READ', { id, label: title });
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
                        return (
                            <List.Item
                                title={title}
                                description={item.id}
                                left={props => <List.Icon {...props} icon={isThisConnected ? 'check-circle' : 'bluetooth'} />}
                                right={() => isThisConnected ? <Text style={{ marginRight: 12, color: 'green' }}>Conectado</Text> : null}
                                onPress={() => handlePress(item.id, title)}
                            />
                        );
                    }}
                />
            )}
        </View>
    );
};
