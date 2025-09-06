import { Stack } from 'expo-router';
import { ViewModeProvider } from '../context/ViewModeContext';

export default function RootLayout() {
  return (
    <ViewModeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="quizit" 
          options={{ 
            headerShown: false,
            presentation: 'modal'
          }} 
        />
      </Stack>
    </ViewModeProvider>
  );
}