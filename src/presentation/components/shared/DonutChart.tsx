// components/shared/DonutChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type Props = {
    size: number;                 // diámetro total
    strokeWidth: number;          // grosor del aro
    label?: string;               // texto bajo el %, opcional
    centerPercent: number;        // número (0-100) que mostramos como %
    segmentA: number;             // valor del primer segmento
    segmentB: number;             // valor del segundo segmento
    colorA: string;               // color segmento A
    colorB: string;               // color segmento B
    lineCap?: 'butt' | 'round';   // estilo de remate del trazo
    gapDegrees?: number;          // (opcional) separación entre segmentos (0 por defecto)
};

export const DonutChart: React.FC<Props> = ({
    size,
    strokeWidth,
    label,
    centerPercent,
    segmentA,
    segmentB,
    colorA,
    colorB,
    lineCap = 'butt',
    gapDegrees = 0, // nota: ahora mismo lo dejamos en 0 (sin separación)
}) => {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const a = Math.max(0, segmentA);
    const b = Math.max(0, segmentB);
    const total = a + b;

    // Longitud de cada arco (en px a lo largo de la circunferencia)
    const lenA = total > 0 ? (a / total) * circumference : 0;
    const lenB = total > 0 ? (b / total) * circumference : 0;

    // Rotación de inicio del segundo arco (en grados)
    const degA = total > 0 ? (a / total) * 360 : 0;
    const startAngle = -90; // empezamos arriba (12 en punto)

    const hasLabel = !!(label && label.trim());

    // Tamaños de texto proporcionales al tamaño del donut
    const percentFont = Math.max(12, Math.round(size * 0.18));
    const labelFont = Math.max(10, Math.round(size * 0.11));

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* Segmento A */}
                {lenA > 0 && (
                    <G rotation={startAngle} origin={`${center}, ${center}`}>
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={colorA}
                            strokeWidth={strokeWidth}
                            strokeLinecap={lineCap}
                            fill="transparent"
                            strokeDasharray={`${lenA} ${circumference}`}
                            strokeDashoffset={0}
                        />
                    </G>
                )}

                {/* Segmento B (arranca al terminar A) */}
                {lenB > 0 && (
                    <G rotation={startAngle + degA + (gapDegrees || 0)} origin={`${center}, ${center}`}>
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={colorB}
                            strokeWidth={strokeWidth}
                            strokeLinecap={lineCap}
                            fill="transparent"
                            strokeDasharray={`${lenB} ${circumference}`}
                            strokeDashoffset={0}
                        />
                    </G>
                )}
            </Svg>

            {/* Centro absoluto: % + (label opcional) */}
            <View style={[StyleSheet.absoluteFillObject, styles.center]}>
                <Text style={{ fontSize: percentFont, fontWeight: '800', color: '#111827' }}>
                    {Math.round(Number.isFinite(centerPercent) ? centerPercent : 0)}%
                </Text>
                {hasLabel ? (
                    <Text style={{ marginTop: 2, fontSize: labelFont, color: '#6B7280' }}>
                        {label}
                    </Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default DonutChart;
