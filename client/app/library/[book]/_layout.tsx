import { Stack } from "expo-router";

export default function LibraryLayout() {
  return (
    <Stack>
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
