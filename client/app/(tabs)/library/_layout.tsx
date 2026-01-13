import { Stack } from 'expo-router';

export default function LibraryStackLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="book" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="card" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="section" 
        options={{ 
          headerShown: false 
        }} 
      />
    </Stack>
  );
}
