// CorralScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

export default function CorralScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();
    const [corral, setCorral] = useState('');

    const onSearch = () => {
        const value = corral.trim();
        if (!value) return;
        // Navega a donde necesites con el corral escrito
        // navigation.navigate('CorralDetalle' as never, { corral: value } as never);
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
            style={{ paddingBottom: insets.bottom + 8 }}
        >
            {/* Título y subtítulo */}
            <View className="px-5 pt-4 pb-2">
                <Text className="text-slate-900 text-[22px] font-extrabold">Elige cómo identificar el corral</Text>
                <Text className="text-slate-500 mt-1">Introduce el código o usa el escáner.</Text>
            </View>

            {/* Campo de entrada */}
            <View className="px-5 mt-2">
                <Text className="text-slate-600 mb-2">Corral</Text>

                <View
                    className="flex-row items-center rounded-2xl bg-white border px-3"
                    style={{ borderColor: '#E2E8F0', height: 52 }}
                >
                    <Ionicons name="home-outline" size={20} color="#64748B" />
                    <TextInput
                        value={corral}
                        onChangeText={(t) => setCorral(t.toUpperCase())}   // si no quieres mayúsculas, quita toUpperCase()
                        placeholder="Ej: C-12"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-2 text-slate-900"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={onSearch}
                    />
                    {corral ? (
                        <TouchableOpacity onPress={() => setCorral('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Botón Escanear (secundario/outline) */}
                <TouchableOpacity
                    onPress={() => {/* TODO: lógica de escaneo */ }}
                    className="mt-3 flex-row items-center justify-center rounded-2xl border py-3 bg-white"
                    style={{ borderColor: '#CBD5E1' }}
                    activeOpacity={0.9}
                >
                    <Ionicons name="scan-outline" size={18} color="#16A34A" />
                    <Text className="ml-2 text-slate-900 font-semibold">Escanear</Text>
                </TouchableOpacity>

                {/* Botón Buscar (primario) */}
                <TouchableOpacity
                    onPress={onSearch}
                    disabled={!corral.trim()}
                    className="mt-4 rounded-xl px-4 py-3 active:opacity-90"
                    style={{
                        backgroundColor: corral.trim() ? '#4F46E5' : '#C7D2FE',
                        shadowColor: '#000',
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 3,
                    }}
                >
                    <Text className="text-white text-center font-semibold">Buscar</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
