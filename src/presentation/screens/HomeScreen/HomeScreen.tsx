import React from 'react';
import { Text, View, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
import { useTranslation } from 'react-i18next';
import { DonutChart } from '../../components/shared/DonutChart';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Incidencia = {
  id: string | number;
  area: 'Maternidad' | 'Gestación';
  corral: string | number;
  descripcion: string;
};

// Rutas (ajusta los nombres si tus tabs se llaman distinto)
// HomeScreen.tsx

// Opción A: con constantes
const TAB_MATERNIDAD = 'MaternidadTab';
const TAB_GESTACION = 'GestacionTab';



const CARD_BG = '#E9EDF2';
const CARD_BORDER = '#C8D0DA';

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
    { id: 1, area: 'Maternidad', corral: '12', descripcion: 'Bebedero con caudal bajo.' },
    { id: 2, area: 'Gestación', corral: '03', descripcion: 'Comedero bloqueado.' },
    { id: 3, area: 'Gestación', corral: '07', descripcion: 'Sensor de paso intermitente.' },
    { id: 4, area: 'Maternidad', corral: '05', descripcion: 'Puerta sin cierre.' },
    { id: 5, area: 'Gestación', corral: '10', descripcion: 'Fallo de báscula.' },
  ];

  const pillClasses = (a: Incidencia['area']) =>
    a === 'Maternidad' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700';

  const StatRow = ({ label, value }: { label: string; value: number }) => (
    <View className="flex-row justify-between w-full mt-1">
      <Text className="text-slate-600">{label}</Text>
      <Text className="text-slate-900 font-semibold">{value}</Text>
    </View>
  );

  const SectionTitle = ({ icon, text, count }: {
    icon: string; text: string; count?: number;
  }) => (
    <View className="flex-row items-center justify-between mb-3">
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

  const goMaternidad = () => navigation.getParent()?.navigate(TAB_MATERNIDAD as never);
  const goGestacion = () => navigation.getParent()?.navigate(TAB_GESTACION as never);

  return (
    <View className="flex-1 bg-slate-50">
      <HamburgerMenu />

      <View className="px-5 pt-4 flex-1">
        {/* Indicadores */}
        <SectionTitle icon="analytics-outline" text={t('common:Indicadores') || 'Indicadores'} />

        {/* Tarjetas indicadores -> ahora SON BOTONES */}
        <View className="flex-row mb-6">
          {/* Maternidad (botón) */}
          <Pressable
            onPress={goMaternidad}
            android_ripple={{ color: '#dbeafe' }}
            className="flex-1 mr-3 rounded-2xl overflow-hidden"
            accessibilityRole="button"
            accessibilityLabel="Ir a Maternidad"
          >
            <View className="p-3 shadow-sm border" style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}>
              <View className="items-center">
                <DonutChart
                  size={120}
                  strokeWidth={22}
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
                <View className="h-px my-1" style={{ backgroundColor: '#C8D0DA' }} />
                <StatRow label="Totales" value={totalM} />
              </View>
            </View>
          </Pressable>

          {/* Gestación (botón) */}
          <Pressable
            onPress={goGestacion}
            android_ripple={{ color: '#dbeafe' }}
            className="flex-1 ml-3 rounded-2xl overflow-hidden"
            accessibilityRole="button"
            accessibilityLabel="Ir a Gestación"
          >
            <View className="p-3 shadow-sm border" style={{ backgroundColor: CARD_BG, borderColor: CARD_BORDER }}>
              <View className="items-center">
                <DonutChart
                  size={120}
                  strokeWidth={22}
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
                <View className="h-px my-1" style={{ backgroundColor: '#C8D0DA' }} />
                <StatRow label="Totales" value={totalG} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* Incidencias */}
        <SectionTitle icon="alert-circle-outline" text="Incidencias" count={incidencias.length} />

        <View className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[160px]">
          <FlatList
            data={incidencias}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderIncidencia}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
            ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
          />
        </View>

        {/* CTA inferior */}
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('TareasProgramadas' as never)}
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
          <Text className="text-white text-center font-semibold">Tareas Programadas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
