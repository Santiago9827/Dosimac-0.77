import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const CARD_BG = '#F1F5F9';
const CARD_BORDER = '#E2E8F0';

type DatosMaternidad = { alimentados: number; noAlimentados: number };

export default function MaternidadScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    // Datos de ejemplo
    const maternidad: DatosMaternidad = { alimentados: 180, noAlimentados: 20 };
    const total = maternidad.alimentados + maternidad.noAlimentados;
    const pct = total ? Math.round((maternidad.alimentados / total) * 100) : 0;

    const StatLine = ({
        label, value, strong, onPress,
    }: { label: string; value: number; strong?: boolean; onPress?: () => void }) => {
        const Comp: any = onPress ? Pressable : View;
        return (
            <Comp
                onPress={onPress}
                android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
                className="flex-row items-center justify-between mb-2"
            >
                <View className="flex-row items-center">
                    {onPress ? <Ionicons name="link-outline" size={16} color="#6366f1" /> : null}
                    <Text
                        className={onPress
                            ? 'ml-1.5 text-indigo-600 font-semibold'
                            : 'text-slate-600'}
                    >
                        {label}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Text className={strong ? 'text-slate-900 font-extrabold' : 'text-slate-900 font-semibold'}>
                        {value}
                    </Text>
                    {onPress ? <Ionicons name="chevron-forward" size={18} color="#64748B" /> : null}
                </View>
            </Comp>
        );
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom + 8 }}>
            {/* Título */}
            <View className="px-5 pt-4 pb-2 flex-row items-center">
                <Ionicons name="female-outline" size={20} color="#0f172a" />
                <Text className="ml-2 text-slate-900 text-[18px] font-extrabold">Maternidad</Text>
            </View>

            {/* Bloque 1: Donut + métricas */}
            <View className="px-5">
                <View className="rounded-2xl border p-3 shadow-sm"
                    style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}>
                    <View className="flex-row items-center">
                        {/* Donut */}
                        <View className="flex-1 items-center pr-3">
                            <DonutChart
                                size={140}
                                strokeWidth={22}
                                label="Maternidad"
                                segmentA={maternidad.alimentados}
                                segmentB={maternidad.noAlimentados}
                                colorA="#22C55E"
                                colorB="#EF4444"
                                lineCap="butt"
                                gapDegrees={0}
                                centerPercent={pct}
                            />
                        </View>

                        {/* Separador */}
                        <View className="w-px bg-slate-200 self-stretch mx-1" />

                        {/* Métricas */}
                        <View className="flex-1 pl-3">
                            <StatLine label="Alimentados" value={maternidad.alimentados} />
                            <StatLine
                                label="No Alimentados"
                                value={maternidad.noAlimentados}
                                onPress={() => navigation.navigate('NoAlimentadosMaternidad')}
                            />
                            <View className="h-px bg-slate-300 my-2" />
                            <StatLine label="Totales animales" value={total} strong />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
