import { View, StyleSheet, Image, Text } from 'react-native';
import { useBook } from "../../../data/bookContext";
import Plus from '../../../assets/icons/plus.png';

export function BooksPreview({insightCount, saved, combine, exclusive}) {
    const { selectedBook } = useBook();
    return (
        <View style={styles.container}>
            <View>
                <Image
                    source={{ uri: selectedBook.coverURL }}
                    style={styles.cover}
                />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 20, justifyContent: 'center', alignItems: 'center', opacity: 0.7 }}>
                        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>{saved ? insightCount.saved : insightCount.total}</Text>
                    </View>
                </View>
            </View>
            {combine && (
                <View style={{width: 20, height: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Image style={{ width: 12, height: 12, zIndex: 1000, margin: 3 }} source={Plus} />
                </View>
            )}
            {!combine && !exclusive && (
                <View style={{width: 20, height: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{zIndex: 1000, fontSize: 10, padding: 1 }}>OR</Text>
                </View>
            )}
            {combine && exclusive && (
            <View>
                <Image
                    source={{ uri: selectedBook.coverURL }}
                    style={styles.cover}
                />
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: 'black', width: 25, height: 25, borderRadius: 20, justifyContent: 'center', alignItems: 'center', opacity: 0.7 }}>
                        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>{saved ? insightCount.saved : insightCount.total}</Text>
                    </View>
                </View>
            </View>)}
            {!exclusive && (
                <View>
                    <View
                        style={[styles.cover, { backgroundColor: 'gray' }]}
                    />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>Library</Text>
                    </View>
                </View>)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
        gap: 10,
        // backgroundColor: 'red',
    },
    cover: {
        height: 78,
        width: 52,
        resizeMode: 'cover',
        borderRadius: 5,
    },
});

