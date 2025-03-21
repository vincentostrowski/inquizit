import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false  // This removes the header for all screens
      }}>
      <Stack.Screen
        name="index"
        options={{ title: "Book Details" }}
      />
      <Stack.Screen
        name="[insight]"
        options={{ title: "Insight" }}
      />
    </Stack>
  );
}
