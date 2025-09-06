import { Stack } from 'expo-router';
import { ViewModeProvider } from '../context/ViewModeContext';

export default function RootLayout() {
  return (
    <ViewModeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book" options={{ headerShown: false }} />
        <Stack.Screen name="quizit" options={{ headerShown: false }} />
        <Stack.Screen name="sections" options={{ headerShown: false }} />
        <Stack.Screen name="section" options={{ headerShown: false }} />
        <Stack.Screen name="card" options={{ headerShown: false }} />
      </Stack>
    </ViewModeProvider>
  );
}