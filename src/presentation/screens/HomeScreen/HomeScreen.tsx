import React from 'react';
import { Text, View } from 'react-native';
import { HamburgerMenu } from '../../components/shared/HamburgerMenu';
import { farmStore } from '../../../stores/store';
import { Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { DonutChart } from '../../components/shared/DonutChart';
// ⬇️ importa la dona

export const HomeScreen = () => {
  const sfarm = farmStore((state) => state.farm);
  const { t } = useTranslation(['common']);

  // Ejemplos (luego reemplázalos por datos reales)
  const maternidadPct = 72; // % de cumplimiento/ocupación/lo que definas
  const gestacionPct = 54;

  return (
    <View>
      <HamburgerMenu />

      {/* ====== BLOQUE 1: KPIs con donas ====== */}
      <View className="px-5 pt-4">
        <Text className="text-slate-800 text-lg font-semibold mb-3">
          {t('common:Indicadores')}
        </Text>

        <View className="flex-row justify-between items-center">
          <View className="items-center">
            <DonutChart
              size={140}
              strokeWidth={14}
              percent={maternidadPct}
              label={t('common:Maternidad') || 'Maternidad'}
              color="#16a34a"       // verde
              trackColor="#E5E7EB"
            />
          </View>

          <View className="items-center">
            <DonutChart
              size={140}
              strokeWidth={14}
              percent={gestacionPct}
              label={t('common:Gestación') || 'Gestación'}
              color="#2563EB"       // azul
              trackColor="#E5E7EB"
            />
          </View>
        </View>
      </View>

      {/* ====== resto de tu pantalla como la tenías ====== */}
      <View className="flex-col h-full justify-center items-center">
        <Text className="text-6xl text-slate-700 font-bold">DOSIMAC</Text>
        <Text className="text-3xl text-slate-700 font-bold">CTIFEED</Text>

        <View className="flex flex-row pt-10 space-x-1">
          <View className="h-[80px] w-5 rounded-t-lg bg-red-600" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-500" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-600" />
          <View className="h-[80px] w-5 rounded-t-lg bg-cyan-800" />
        </View>

        <View>
          <View className="-mt-[110px] h-5 w-5 rounded-full bg-orange-400" />
        </View>

        <Divider className="w-44 bg-black my-10" />

        {sfarm ? (
          <View className="flex flex-col pt-6 px-6 py-4 rounded-xl border-gray-400">
            <Text className="text-lg mb-2 font-bold text-blue-800 text-center">
              {t('common:Instalación_seleccionada')}
            </Text>
            <Text className="text-lg text-center text-slate-700">{sfarm.name}</Text>
            <Text className="text-lg text-center text-slate-700">{sfarm.location}</Text>
          </View>
        ) : (
          <View className="flex flex-col pt-6 px-6 py-4 rounded-xl border-gray-400">
            <Text className="text-lg mb-2 font-bold text-red-800 text-center">
              {t('common:NoInstalacionSeleccionada')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
