// MaternidadScreen.tsx
import React from 'react';
import { View, Text, Pressable, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CARD_BG = '#F1F5F9';
const CARD_BORDER = '#E2E8F0';

// Layout proporciones
const LEFT_FLEX = 35;  // donut
const RIGHT_FLEX = 68; // datos
const VALUE_W = 80;    // ancho fijo para alinear números
const CHEVRON_W = 18;  // ancho fijo para chevron

type DatosMaternidad = { alimentados: number; noAlimentados: number };
type Incidencia = {
    id: string | number;
    area: 'Maternidad' | 'Gestación';
    corral: string | number;
    descripcion: string;
};

export default function MaternidadScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<any>>();

    // Datos demo
    const maternidad: DatosMaternidad = { alimentados: 180, noAlimentados: 20 };
    const total = maternidad.alimentados + maternidad.noAlimentados;
    const pct = total ? Math.round((maternidad.alimentados / total) * 100) : 0;

    // Incidencias SOLO de Maternidad
    const incidenciasMaternidad: Incidencia[] = [
        { id: 1, area: 'Maternidad', corral: '02', descripcion: 'Bebedero con caudal bajo.' },
        { id: 2, area: 'Maternidad', corral: '05', descripcion: 'Puerta sin cierre.' },
        { id: 3, area: 'Maternidad', corral: '07', descripcion: 'Sensor de paso intermitente.' },
        { id: 4, area: 'Maternidad', corral: '15', descripcion: 'Fallo de báscula.' },
        { id: 5, area: 'Maternidad', corral: '03', descripcion: 'Comedero bloqueado.' },
    ];

    const pillClasses = (a: Incidencia['area']) =>
        a === 'Maternidad' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700';

    const DANGER = '#DC2626'; // red-600
    const OK = '#16A34A';     // green-600

    // ------- ROW (métricas) -------
    const Row = ({
        label,
        value,
        onPress,
        strong = false,
        divider = false,
        action = false,
        labelColor,
        valueColor,
    }: {
        label: string;
        value: number | string;
        onPress?: () => void;
        strong?: boolean;
        divider?: boolean;
        action?: boolean;
        labelColor?: string;
        valueColor?: string;
    }) => {
        const Comp: any = onPress ? Pressable : View;
        return (
            <>
                {divider ? <View className="h-px bg-slate-200 opacity-80" /> : null}
                <Comp
                    onPress={onPress}
                    android_ripple={onPress ? { color: '#e5e7eb' } : undefined}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}
                >
                    <Text
                        // sin truncado: envuelve si hace falta
                        style={{
                            flex: 1,
                            color: labelColor ?? '#475569',
                            marginRight: 8,
                            flexShrink: 1,
                            minWidth: 0,
                        }}
                    >
                        {label}
                    </Text>

                    <Text
                        style={{
                            width: VALUE_W,
                            textAlign: 'right',
                            color: valueColor ?? '#0F172A',
                            fontWeight: strong ? '800' : '600',
                        }}
                    >
                        {value}
                    </Text>

                    <View style={{ width: CHEVRON_W, alignItems: 'flex-end', marginLeft: 4 }}>
                        {action ? <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> : null}
                    </View>
                </Comp>
            </>
        );
    };

    // color dinámico para "No Alimentados"
    const noAl = maternidad.noAlimentados;
    const noAlColor = noAl === 0 ? OK : DANGER; // verde si 0, rojo si >0

    // ------- UI -------
    const SectionTitle = ({ icon, text, count }: { icon: string; text: string; count?: number }) => (
        <View className="flex-row items-center justify-between mb-3 px-5">
            <View className="flex-row items-center">
                <Ionicons name={icon as any} size={18} color="#0f172a" />
                <Text className="ml-2 text-slate-900 text-[18px] font-extrabold">{text}</Text>
            </View>
            {typeof count === 'number' && (
                <View className="px-2 py-0.5 rounded-full bg-slate-200/70">
                    <Text className="text-xs text-slate-700">{count}</Text>
                </View>
            )}
        </View>
    );

    const renderIncidencia = ({ item }: { item: Incidencia }) => (
        <Pressable
            onPress={() => { }}
            android_ripple={{ color: '#e5e7eb' }}
            className="rounded-2xl p-4 bg-white border border-slate-200 mb-3"
            style={{
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
            }}
        >
            <View className="flex-row items-center">
                <Text className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pillClasses(item.area)}`}>
                    {item.area}
                </Text>
                <Text className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                    Corral {item.corral}
                </Text>
            </View>
            <Text className="mt-2 text-slate-800">{item.descripcion}</Text>
        </Pressable>
    );

    return (
        <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom + 8 }}>
            {/* Título
            <View className="px-5 pt-4 pb-2">
                <Text className="text-slate-900 text-[24px] font-extrabold">Maternidad</Text>
            </View> */}

            {/* Bloque 1: Donut + métricas */}
            <View className="px-5 mb-6">
                <View
                    className="rounded-2xl border p-5 shadow-sm overflow-hidden" // antes p-4
                    style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Izquierda (donut) */}
                        <View style={{ flex: LEFT_FLEX }} className="items-center pr-2">
                            <DonutChart
                                size={132}        // antes 124 (puedes probar 136 si te cabe)
                                strokeWidth={22}  // antes 20, más “presencia”
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
                        <View className="w-px bg-slate-200 self-stretch mx-3" />

                        {/* Derecha (métricas) */}
                        <View style={{ flex: RIGHT_FLEX }} className="pr-1">
                            <Row label="Alimentados" value={maternidad.alimentados} />

                            <Row
                                label="No Alimentados"
                                value={noAl}
                                divider
                                action
                                onPress={() => navigation.navigate('NoAlimentadosMaternidad')}
                                labelColor={noAlColor}
                                valueColor={noAlColor}
                            />

                            <Row label="Totales animales" value={total} strong divider />
                        </View>
                    </View>
                </View>
            </View>

            {/* Bloque 2: Incidencias */}
            <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidenciasMaternidad.length} />

            <View className="px-5">
                <View className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Altura aumentada */}
                    <View style={{ height: 400 }} className="px-4 py-3">
                        <FlatList
                            data={incidenciasMaternidad}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderIncidencia}
                            showsVerticalScrollIndicator
                            ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
                        />
                    </View>
                </View>

                {/* CTA inferior: Ir al Corral */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('MAT-CORRAL' as never)}
                    className="mt-4 rounded-xl px-4 py-3 active:opacity-90"
                    style={{
                        backgroundColor: '#4F46E5',
                        marginBottom: insets.bottom + 8,
                        shadowColor: '#000',
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 3,
                    }}
                >
                    <Text className="text-white text-center font-semibold">Ir al Corral</Text>
                </TouchableOpacity>
            </View>
        </View>

    );
}
