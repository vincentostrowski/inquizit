import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack>
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
