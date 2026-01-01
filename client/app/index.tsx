import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoginScreen from './login';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Only navigate if authenticated (to avoid animation when showing login)
      router.replace('/(tabs)/home');
    }
  }, [user, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If not authenticated, render login screen directly (no navigation = no animation)
  if (!user) {
    return <LoginScreen />;
  }

  // This shouldn't render (we navigate in useEffect), but just in case
  return null;
}
