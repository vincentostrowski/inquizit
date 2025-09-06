import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  headerColor: string;
  backgroundEndColor: string;
  height?: number;
  borderRadius?: number;
}

export default function GradientBackground({ 
  headerColor, 
  backgroundEndColor, 
  height = 208, // h-52 equivalent
  borderRadius = 0
}: GradientBackgroundProps) {
  return (
    <View style={[styles.container, { height }]}>
      <LinearGradient
        colors={[headerColor, backgroundEndColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.gradient, { 
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius 
        }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  gradient: {
    flex: 1,
  },
});
