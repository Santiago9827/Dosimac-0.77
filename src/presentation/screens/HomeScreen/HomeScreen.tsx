import React from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
import { useTranslation } from 'react-i18next';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type Incidencia = {
  id: string | number;
  area: 'Maternidad' | 'Gestación';
  corral: string | number;
  descripcion: string;
};

export const HomeScreen = () => {
  const { t } = useTranslation(['common']);
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();

  // Datos demo
  const maternidad = { alimentados: 180, noAlimentados: 20 };
  const gestacion = { alimentados: 135, noAlimentados: 115 };
  const totalM = maternidad.alimentados + maternidad.noAlimentados;
  const totalG = gestacion.alimentados + gestacion.noAlimentados;
  const pctM = totalM ? Math.round((maternidad.alimentados / totalM) * 100) : 0;
  const pctG = totalG ? Math.round((gestacion.alimentados / totalG) * 100) : 0;

  const incidencias: Incidencia[] = [
    { id: 1, area: 'Maternidad', corral: 'C-12', descripcion: 'Bebedero con caudal bajo.' },
    { id: 2, area: 'Gestación', corral: 'G-03', descripcion: 'Comedero bloqueado.' },
    { id: 3, area: 'Gestación', corral: 'G-07', descripcion: 'Sensor de paso intermitente.' },
    { id: 4, area: 'Maternidad', corral: 'C-05', descripcion: 'Puerta sin cierre.' },
    { id: 5, area: 'Gestación', corral: 'G-10', descripcion: 'Fallo de báscula.' },
  ];

  const pillClasses = (a: Incidencia['area']) =>
    a === 'Maternidad' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700';

  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <View className="flex-row justify-between w-full mt-1">
      <Text className="text-slate-600">{label}</Text>
      <Text className="text-slate-900 font-semibold">{value}</Text>
    </View>
  );

  const renderIncidencia = ({ item }: { item: Incidencia }) => (
    <View className="rounded-xl p-4 bg-white border border-slate-200 mb-3">
      <View className="flex-row items-center">
        <Text className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pillClasses(item.area)}`}>
          {item.area}
        </Text>
        <Text className="ml-2 text-slate-500 text-xs">Corral {item.corral}</Text>
      </View>
      <Text className="mt-2 text-slate-800">{item.descripcion}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <HamburgerMenu />

      <View className="px-5 pt-4 flex-1">
        <Text className="text-slate-800 text-lg font-semibold mb-3">
          {t('common:Indicadores') || 'Indicadores'}
        </Text>

        {/* Tarjetas indicadores */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 rounded-2xl p-3 shadow-sm bg-[#E9EDF2] border border-[#C8D0DA]">
            <View className="items-center">
              <DonutChart
                size={120}                 // un poco más compacto para que todo quepa sin scroll
                strokeWidth={20}
                label={t('common:Maternidad') || 'Maternidad'}
                segmentA={maternidad.alimentados}
                segmentB={maternidad.noAlimentados}
                colorA="#22C55E"
                colorB="#EF4444"
                lineCap="butt"
                gapDegrees={0}
                centerPercent={pctM}
              />
            </View>
            <View className="mt-3">
              <StatRow label="Alimentados" value={maternidad.alimentados} />
              <StatRow label="No Alimentados" value={maternidad.noAlimentados} />
              <View className="h-px bg-[#C8D0DA] my-1" />
              <StatRow label="Totales" value={totalM} />
            </View>
          </View>

          <View className="flex-1 rounded-2xl p-3 shadow-sm bg-[#E9EDF2] border border-[#C8D0DA]">
            <View className="items-center">
              <DonutChart
                size={120}
                strokeWidth={20}
                label={t('common:Gestación') || 'Gestación'}
                segmentA={gestacion.alimentados}
                segmentB={gestacion.noAlimentados}
                colorA="#22C55E"
                colorB="#EF4444"
                lineCap="butt"
                gapDegrees={0}
                centerPercent={pctG}
              />
            </View>
            <View className="mt-3">
              <StatRow label="Alimentados" value={gestacion.alimentados} />
              <StatRow label="No Alimentados" value={gestacion.noAlimentados} />
              <View className="h-px bg-[#C8D0DA] my-1" />
              <StatRow label="Totales" value={totalG} />
            </View>
          </View>
        </View>

        {/* Bloque Incidencias: ocupa el espacio libre y SOLO él scrollea */}
        <Text className="text-slate-800 text-lg font-semibold mb-3">Incidencias</Text>

        <View className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[160px]">
          <FlatList
            data={incidencias}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderIncidencia}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          />
        </View>

        {/* Botón pegado abajo */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('TareasProgramadas' as never)}
          className="mt-4 bg-indigo-600 rounded-xl px-4 py-3 active:opacity-90"
          style={{ marginBottom: insets.bottom + 8 }}
        >
          <Text className="text-white text-center font-semibold">Tareas Programadas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
