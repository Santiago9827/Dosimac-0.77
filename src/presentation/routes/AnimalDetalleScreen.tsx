import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const CARD_BORDER = '#E2E8F0';

export default function AnimalDetalleScreen() {
    const route = useRoute<any>();
    const crotal: string = route.params?.crotal ?? '—';

    // DEMO de datos calculados
    const data = useMemo(() => {
        const tot = 2800;
        const consumida = 1800;
        const pct = Math.round((consumida / tot) * 100);
        return {
            corral: '03',
            crotal,
            curva: 'DEFECTO',
            diasInseminacion: 42,
            total: tot,
            consumida,
            pct,
            condicion: 'Normal',
            subEstado: 'LACTANCIA',
            fechaSubEstado: '2025-01-01',
        };
    }, [crotal]);

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC', padding: 20 }}>
            <View
                style={{
                    borderWidth: 1, borderColor: CARD_BORDER, backgroundColor: '#fff',
                    borderRadius: 16, padding: 14,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Ionicons name="paw-outline" size={18} color="#0f172a" />
                    <Text style={{ marginLeft: 6, color: '#0f172a', fontWeight: '900', fontSize: 18 }}>
                        Crotal {data.crotal}
                    </Text>
                </View>

                <Text style={{ color: '#64748B' }}>Corral</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800', marginBottom: 10 }}>{data.corral}</Text>

                <Text style={{ color: '#64748B' }}>Curva</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800', marginBottom: 10 }}>{data.curva}</Text>

                <Text style={{ color: '#64748B' }}>Días inseminación</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800', marginBottom: 10 }}>{data.diasInseminacion}</Text>

                <Text style={{ color: '#64748B' }}>Total / Consumida</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800', marginBottom: 10 }}>{data.total} / {data.consumida} ({data.pct}%)</Text>

                <Text style={{ color: '#64748B' }}>Condición corporal</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800', marginBottom: 10 }}>{data.condicion}</Text>

                <Text style={{ color: '#64748B' }}>SubEstado</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800' }}>{data.subEstado}</Text>
                <Text style={{ color: '#64748B', marginTop: 4 }}>Fecha</Text>
                <Text style={{ color: '#0f172a', fontWeight: '800' }}>{data.fechaSubEstado}</Text>
            </View>
        </View>
    );
}
