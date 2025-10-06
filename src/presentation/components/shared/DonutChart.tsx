import React from 'react';
import { View } from 'react-native';
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';

type Props = {
    size?: number;                // tamaño total (px)
    strokeWidth?: number;         // grosor del aro
    label: string;                // texto bajo el % (centro)
    segmentA: number;             // valor “verde” (alimentados)
    segmentB: number;             // valor “rojo” (no alimentados)
    colorA?: string;              // color segmento A
    colorB?: string;              // color segmento B
    lineCap?: 'butt' | 'round';   // extremos rectos o redondos
    gapDegrees?: number;          // separación angular entre segmentos (0 = sin gap)
    centerPercent?: number;       // % a mostrar en el centro
};

export const DonutChart: React.FC<Props> = ({
    size = 140,
    strokeWidth = 18,
    label,
    segmentA,
    segmentB,
    colorA = '#22C55E',
    colorB = '#EF4444',
    lineCap = 'butt',
    gapDegrees = 0,
    centerPercent,
}) => {
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * radius;

    const total = Math.max(0, segmentA) + Math.max(0, segmentB);
    const a = total ? segmentA / total : 0;
    const b = total ? segmentB / total : 0;

    // Longitudes de arco para cada segmento
    const arcA = circumference * a;
    const arcB = circumference * b;

    // Separación (si la quisieras): se reparte entre ambos
    const gapLen = (gapDegrees / 360) * circumference;
    const arcAWithGap = Math.max(0, arcA - gapLen / 2);
    const arcBWithGap = Math.max(0, arcB - gapLen / 2);

    // dash arrays (longitud visible, longitud oculta)
    const dashArrayA = `${arcAWithGap} ${circumference - arcAWithGap}`;
    const dashArrayB = `${arcBWithGap} ${circumference - arcBWithGap}`;

    // Rotaciones: empezamos en -90º para que arranque arriba
    // El segundo segmento empieza donde acaba el primero + gap
    const rotA = -90;
    const rotB = -90 + (a * 360) + (gapDegrees / 2);

    const percent = typeof centerPercent === 'number'
        ? Math.max(0, Math.min(100, centerPercent))
        : Math.round(a * 100);

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size}>
                {/* Segmento A (alimentados) */}
                <G rotation={rotA} origin={`${cx}, ${cy}`}>
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={radius}
                        stroke={colorA}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={dashArrayA}
                        strokeLinecap={lineCap}
                    />
                </G>

                {/* Segmento B (no alimentados) */}
                {b > 0 && (
                    <G rotation={rotB} origin={`${cx}, ${cy}`}>
                        <Circle
                            cx={cx}
                            cy={cy}
                            r={radius}
                            stroke={colorB}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={dashArrayB}
                            strokeLinecap={lineCap}
                        />
                    </G>
                )}

                {/* Texto central */}
                <SvgText
                    x={cx}
                    y={cy - 2}
                    textAnchor="middle"
                    fontSize={22}
                    fontWeight="700"
                    fill="#111827"
                >
                    {`${percent}%`}
                </SvgText>
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
