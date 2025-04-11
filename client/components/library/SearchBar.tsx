import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (text: string) => {
        setQuery(text);
        onSearch(text);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={query}
                onChangeText={handleInputChange}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
        padding: 5,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    input: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 10,
    },
});

export default SearchBar;