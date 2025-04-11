// components/InnerShadow.tsx
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Rect, Mask, LinearGradient, Stop } from 'react-native-svg';

export default function InnerShadow({ width, height, borderRadius = 0 }: { width: number, height: number, borderRadius?: number }) {
  return (
    <View style={{ position: 'absolute', width, height, pointerEvents: 'none' }}>
      <Svg width={width} height={height}>
        <Defs>
          <Mask id="mask">
            <Rect x="0" y="0" width={width} height={height} fill="white" rx={borderRadius} />
            <Rect x="5" y="5" width={width - 10} height={height - 10} fill="black" rx={borderRadius - 5} />
          </Mask>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="black" stopOpacity="0.3" />
            <Stop offset="1" stopColor="black" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="url(#grad)"
          mask="url(#mask)"
          rx={borderRadius}
        />
      </Svg>
    </View>
  );
}
