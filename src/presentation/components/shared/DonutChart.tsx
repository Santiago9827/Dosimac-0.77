// src/components/charts/DonutChart.tsx
import React from 'react';
import { View } from 'react-native';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';

type Props = {
    size?: number;            // tamaño total (px)
    strokeWidth?: number;     // grosor de la dona
    percent: number;          // 0..100
    label: string;            // texto arriba o debajo (nosotros lo ponemos dentro)
    color?: string;           // color del progreso
    trackColor?: string;      // color de fondo
    showPercent?: boolean;
};

export const DonutChart: React.FC<Props> = ({
    size = 140,
    strokeWidth = 14,
    percent,
    label,
    color = '#2563EB',
    trackColor = '#E5E7EB',
    showPercent = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, percent));
    const progress = (clamped / 100) * circumference;
    const dashArray = `${progress} ${circumference - progress}`;

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${cx}, ${cy}`}>
                    {/* Track */}
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progreso */}
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={dashArray}
                    />
                </G>

                {/* Texto central */}
                {showPercent && (
                    <SvgText
                        x={cx}
                        y={cy - 2}
                        textAnchor="middle"
                        fontSize={22}
                        fontWeight="700"
                        fill="#111827"
                    >
                        {`${clamped}%`}
                    </SvgText>
                )}
                <SvgText
                    x={cx}
                    y={cy + 20}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#6B7280"
                >
                    {label}
                </SvgText>
            </Svg>
        </View>
    );
};
