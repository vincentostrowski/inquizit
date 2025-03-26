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
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    top: 120,
    right: 20,
    width: 40,
    zIndex: 1000,
  },
}); 