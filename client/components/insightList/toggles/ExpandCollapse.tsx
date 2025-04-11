import { View, Image, Pressable, StyleSheet } from 'react-native';
import { Dropdown } from './Dropdown';
import { Collapse } from './Collapse';

export function ExpandCollapse({collapse, expand}) {
  return (
    <View style={styles.container}>
        <Collapse onPress={collapse}/>
        <Dropdown onPress={expand}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    opacity: 0.3,
  },
}); 