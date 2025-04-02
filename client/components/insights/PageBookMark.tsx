import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

interface SaveIconProps {
  onToggle: () => void;
}

export function PageBookMark({ onToggle }: SaveIconProps) {
  const insets = useSafeAreaInsets();

  return (
        <TouchableOpacity onPress={onToggle} style={{position: 'absolute', top: insets.top, left: 60, zIndex: 1000, overflow: 'hidden', height: 80, width: 80}}>
          <View style={{position: 'absolute', bottom: 25, left: 0}}>
            <Ionicons name="bookmark" size={70} color={'black'}/>
          </View>
        </TouchableOpacity>
  );
}