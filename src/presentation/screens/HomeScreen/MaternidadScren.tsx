// MaternidadScreen.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CARD_BG = '#F1F5F9';
const CARD_BORDER = '#E2E8F0';

// Más aire a la derecha (texto no se corta)
const LEFT_FLEX = 35;  // donut
const RIGHT_FLEX = 65; // datos
const VALUE_W = 80;    // ancho fijo para alinear números
const CHEVRON_W = 18;  // ancho fijo para chevron

type DatosMaternidad = { alimentados: number; noAlimentados: number };

export default function MaternidadScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    const maternidad: DatosMaternidad = { alimentados: 180, noAlimentados: 20 };
    const total = maternidad.alimentados + maternidad.noAlimentados;
    const pct = total ? Math.round((maternidad.alimentados / total) * 100) : 0;

    // Fila simple: solo texto + valor + (opcional) chevron. Divider fino entre filas.
    const Row = ({
        label,
        value,
        onPress,
        strong = false,
        divider = false,
        action = false,
    }: {
        label: string;
        value: number | string;
        onPress?: () => void;
        strong?: boolean;
        divider?: boolean; // dibuja línea fina encima
        action?: boolean;  // muestra chevron
    }) => {
        const Comp: any = onPress ? Pressable : View;
        return (
            <>
                {divider ? <View className="h-px bg-slate-200 opacity-80" /> : null}
                <Comp
                    onPress={onPress}
                    android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
                >
                    {/* Label: sin truncar; el bloque derecho es más ancho, así cabe en 1 línea */}
                    <Text style={{ flex: 1, color: '#475569', marginRight: 8 }}>
                        {label}
                    </Text>

                    {/* Valor fijo y alineado */}
                    <Text
                        style={{
                            width: VALUE_W,
                            textAlign: 'right',
                            color: '#0F172A',
                            fontWeight: strong ? '800' : '600',
                        }}
                    >
                        {value}
                    </Text>

                    {/* Chevron fijo a la derecha solo en acción */}
                    <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
                        {action ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
                    </View>
                </Comp>
            </>
        );
    };

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom + 8 }}>
            {/* Título */}
            <View className="px-5 pt-4 pb-2">
                <Text className="text-slate-900 text-[24px] font-extrabold">Maternidad</Text>
            </View>

            {/* Card ampliada: más ancho para datos, menos para donut */}
            <View className="px-5">
                <View
                    className="rounded-2xl border p-4 shadow-sm overflow-hidden"
                    style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Izquierda (donut) */}
                        <View style={{ flex: LEFT_FLEX }} className="items-center pr-2">
                            <DonutChart
                                size={118}          // más compacto: da aire al texto
                                strokeWidth={20}
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

                        {/* Separador vertical fino */}
                        <View className="w-px bg-slate-200 self-stretch mx-3" />

                        {/* Derecha (datos) – filas simples + líneas finas */}
                        <View style={{ flex: RIGHT_FLEX }} className="pr-1">
                            <Row label="Alimentados" value={maternidad.alimentados} />
                            <Row
                                label="No Alimentados"
                                value={maternidad.noAlimentados}
                                divider
                                action
                                onPress={() => navigation.navigate('NoAlimentadosMaternidad')}
                            />
                            <Row label="Totales animales" value={total} strong divider />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
