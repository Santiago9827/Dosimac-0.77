/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, Button, HelperText, Card, Appbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


const PASSWORD = '55555';

export const MaintenancePasswordScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const [pwd, setPwd] = useState('');
    const [error, setError] = useState('');

    const handleBack = () => {
        if (navigation.canGoBack())
            navigation.goBack();
        else navigation.navigate('Tabs' as never);
    }

    const handleAccess = () => {
        if (pwd === PASSWORD) {
            setError('');
            // Navega al stack real de mantenimiento (oculto en el Drawer)
            // Asegúrate de que el nombre de la ruta coincide con el del Drawer.Screen oculto
            navigation.navigate('Maintenance' as never);
        } else {
            setError(t('common:invalidPassword', { defaultValue: 'Contraseña incorrecta' }));
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Appbar.Header mode="small" style={{ backgroundColor: 'transparent', elevation: 0 }}>
                <Appbar.BackAction onPress={handleBack} />
                <Appbar.Content title={t('common:Maintenance', { defaultValue: 'Mantenimiento' })} />
            </Appbar.Header>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.container}>
                    <Card style={styles.card}>
                        <Card.Title title={t('common:Maintenance', { defaultValue: 'Mantenimiento' })} />
                        <Card.Content>
                            <Text style={styles.label}>
                                {t('common:enterMaintenancePassword', { defaultValue: 'Introduce la contraseña de mantenimiento' })}
                            </Text>

                            <TextInput
                                value={pwd}
                                onChangeText={setPwd}
                                mode="outlined"
                                secureTextEntry
                                keyboardType="number-pad"
                                maxLength={5}
                                placeholder=""
                                style={{ marginTop: 12 }}
                                right={<TextInput.Icon icon="eye" onPress={() => { }} />}
                            />
                            <HelperText type="error" visible={!!error}>
                                {error}
                            </HelperText>

                            <Button mode="contained" onPress={handleAccess} style={{ marginTop: 12 }}>
                                {t('common:access', { defaultValue: 'Acceder' })}
                            </Button>
                        </Card.Content>
                    </Card>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );




};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: 'center' },
    card: { borderRadius: 16 },
    label: { fontSize: 14, opacity: 0.8 },
});
