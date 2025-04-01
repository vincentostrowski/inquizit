import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../data/authContext';

export default function AuthScreen() {
    const { user, session, authLoading, anonymousLogin } = useAuth();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { signIn } = useAuth();
    
    const handleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
        await signIn(email, password);
        } catch (error) {
        setError(error.message);
        }
        setLoading(false);
    };
    
    return (
        <SafeAreaView style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
        <View style={styles.header}>
            <Text style={styles.title}>Quizit</Text>
        </View>
        <View style={styles.form}>
            <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            />
            <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            />
            <Button
            title="Sign In"
            onPress={handleSignIn}
            />
            <Button
            title="Continue as Guest"
            onPress={anonymousLogin}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8e8e8',
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    form: {
        padding: 20,
    },
    input: {
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
});