/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, Dimensions, Pressable } from 'react-native';
import {
    Appbar,
    Text,
    ActivityIndicator,
    IconButton,
    Portal,
    Dialog,
    TextInput,
    Button,
    Card,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { awrStore } from '../../stores/awrStore';
import { useAwrConn } from '../../stores/awrConnStore';
import { useTranslation } from 'react-i18next';

const GAP = 16;
const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - GAP * 2;

export const AWRSavedListScreen = ({ navigation }: any) => {
    const { t } = useTranslation();

    const saved = awrStore((s) => s.devices);
    const remove = awrStore((s) => s.remove);
    const rename = awrStore((s) => s.rename);

    const {
        ensureBle,
        connect,
        startReading,
        disconnect,
        isConnected,
        currentId,
        connecting,
        error,
    } = useAwrConn();

    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        ensureBle();
    }, []);

    const handleConnect = async (id: string) => {
        try {
            await connect(id);
            await startReading();
        } catch { }
    };

    const openRename = (id: string, currentLabel?: string, currentName?: string) => {
        setSelectedId(id);
        setDraftName((currentName || currentLabel || '').toString());
        setRenameOpen(true);
    };

    const confirmRename = () => {
        const nombre = draftName.trim();
        if (selectedId && nombre) rename(selectedId, nombre);
        setRenameOpen(false);
        setSelectedId(null);
    };

    const openDelete = (id: string) => {
        setSelectedId(id);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        const id = selectedId;
        if (!id) return;

        if (currentId && currentId.toLowerCase() === id.toLowerCase() && isConnected) {
            try {
                await disconnect();
            } catch { }
        }

        remove(id);
        setDeleteOpen(false);
        setSelectedId(null);
    };

    const data = useMemo(() => saved, [saved]);

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <Appbar.Header
                elevated
                style={{
                    backgroundColor: '#FFFFFF',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                }}
            >
                <Appbar.BackAction onPress={navigation.goBack} />
                <Appbar.Content
                    title={t('awrSavedList_title')}
                    titleStyle={{
                        color: '#0F172A',
                        fontWeight: '800',
                    }}
                />
            </Appbar.Header>

            {connecting && (
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingTop: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <ActivityIndicator />
                    <Text style={{ color: '#475569', fontWeight: '700' }}>
                        {t('awrSavedList_connecting')}
                    </Text>
                </View>
            )}

            {!!error && (
                <View style={{ paddingHorizontal: 16, paddingTop: 10 }}>
                    <Text style={{ color: '#DC2626', fontWeight: '700' }}>{error}</Text>
                </View>
            )}

            {data.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 24,
                    }}
                >
                    <View
                        style={{
                            width: 76,
                            height: 76,
                            borderRadius: 38,
                            backgroundColor: '#EEF2FF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 14,
                        }}
                    >
                        <Ionicons name="bluetooth-outline" size={34} color="#4F46E5" />
                    </View>

                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '900',
                            color: '#0F172A',
                            marginBottom: 6,
                            textAlign: 'center',
                        }}
                    >
                        {t('awrSavedList_empty')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={{
                        padding: GAP,
                        paddingBottom: GAP + 8,
                    }}
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const titulo = item.name || item.label || item.id;
                        const isThis = currentId && currentId.toLowerCase() === item.id.toLowerCase();
                        const connected = isThis && isConnected;

                        return (
                            <Card
                                mode="elevated"
                                style={{
                                    width: CARD_W,
                                    borderRadius: 24,
                                    marginBottom: GAP,
                                    backgroundColor: '#FFFFFF',
                                    borderWidth: connected ? 1.5 : 1,
                                    borderColor: connected ? '#86EFAC' : '#E5E7EB',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.06,
                                    shadowRadius: 12,
                                    shadowOffset: { width: 0, height: 4 },
                                    elevation: 3,
                                }}
                            >
                                <Pressable
                                    android_ripple={{ color: '#E5E7EB' }}
                                    onPress={() => handleConnect(item.id)}
                                    style={{
                                        borderRadius: 24,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <View style={{ paddingHorizontal: 18, paddingVertical: 16 }}>
                                        {/* Cabecera */}
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                gap: 12,
                                            }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: 21,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: connected ? '#ECFDF5' : '#F1F5F9',
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name={connected ? 'bluetooth' : 'bluetooth-outline'}
                                                            size={22}
                                                            color={connected ? '#10B981' : '#475569'}
                                                        />
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <Text
                                                            style={{
                                                                fontSize: 20,
                                                                fontWeight: '900',
                                                                color: '#0F172A',
                                                            }}
                                                            numberOfLines={1}
                                                        >
                                                            {titulo}
                                                        </Text>

                                                        <Text
                                                            style={{
                                                                fontSize: 12,
                                                                color: '#64748B',
                                                                marginTop: 3,
                                                                fontWeight: '700',
                                                            }}
                                                        >
                                                            {connected
                                                                ? t('awrSavedList_connected')
                                                                : t('awrSavedList_disconnected')}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                                <IconButton
                                                    size={22}
                                                    containerColor="#F8FAFC"
                                                    icon={(props) => (
                                                        <Ionicons
                                                            name="pencil-outline"
                                                            size={props.size}
                                                            color="#475569"
                                                        />
                                                    )}
                                                    onPress={() =>
                                                        openRename(item.id, item.label, item.name)
                                                    }
                                                    accessibilityLabel={t('awrSavedList_renameAccessibility')}
                                                />

                                                <IconButton
                                                    size={22}
                                                    containerColor="#FFF1F2"
                                                    icon={(props) => (
                                                        <Ionicons
                                                            name="trash-outline"
                                                            size={props.size}
                                                            color="#DC2626"
                                                        />
                                                    )}
                                                    onPress={() => openDelete(item.id)}
                                                    accessibilityLabel={t('awrSavedList_deleteAccessibility')}
                                                />
                                            </View>
                                        </View>

                                        {/* Separador */}
                                        <View
                                            style={{
                                                height: 1,
                                                backgroundColor: '#F1F5F9',
                                                marginVertical: 14,
                                            }}
                                        />

                                        {/* MAC */}
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                fontWeight: '800',
                                                color: '#64748B',
                                                letterSpacing: 0.6,
                                                marginBottom: 6,
                                            }}
                                        >
                                            MAC
                                        </Text>

                                        <View
                                            style={{
                                                backgroundColor: connected ? '#F0FDF4' : '#F8FAFC',
                                                borderWidth: 1,
                                                borderColor: connected ? '#BBF7D0' : '#E2E8F0',
                                                borderRadius: 16,
                                                paddingHorizontal: 14,
                                                paddingVertical: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 16,
                                                    fontWeight: '900',
                                                    color: '#111827',
                                                    letterSpacing: 0.3,
                                                }}
                                                numberOfLines={1}
                                                adjustsFontSizeToFit
                                                minimumFontScale={0.8}
                                            >
                                                {item.id}
                                            </Text>
                                        </View>

                                        {/* Pie */}
                                        <View
                                            style={{
                                                marginTop: 14,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 999,
                                                    backgroundColor: connected ? '#DCFCE7' : '#E5E7EB',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: '800',
                                                        color: connected ? '#166534' : '#4B5563',
                                                    }}
                                                >
                                                    {connected
                                                        ? t('awrSavedList_connected')
                                                        : t('awrSavedList_disconnected')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Pressable>
                            </Card>
                        );
                    }}
                />
            )}

            {/* Dialogo Renombrar */}
            <Portal>
                <Dialog visible={renameOpen} onDismiss={() => setRenameOpen(false)}>
                    <Dialog.Title>{t('awrSavedList_renameTitle')}</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            mode="outlined"
                            label={t('awrSavedList_nameLabel')}
                            value={draftName}
                            onChangeText={setDraftName}
                            autoFocus
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setRenameOpen(false)}>{t('Cancelar')}</Button>
                        <Button onPress={confirmRename}>{t('Guardar')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Dialogo Eliminar */}
            <Portal>
                <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)}>
                    <Dialog.Icon icon="alert" />
                    <Dialog.Title>{t('awrSavedList_deleteTitle')}</Dialog.Title>
                    <Dialog.Content>
                        <Text>{t('awrSavedList_deleteMessage')}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteOpen(false)}>{t('Cancelar')}</Button>
                        <Button onPress={confirmDelete}>{t('awrSavedList_deleteAction')}</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};