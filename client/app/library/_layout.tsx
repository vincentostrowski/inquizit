import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false  // This removes the header for all screens
      }}>
      <Stack.Screen
        name="index"
        options={{ title: "Explore" }}
      />
      <Stack.Screen
        name="[book]"
        options={{ title: "Book Details" }}
      />
    </Stack>
  );
}
