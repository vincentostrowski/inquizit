import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="library" 
        options={{ title: "Library" }} 
      />
      <Tabs.Screen 
        name="quizit" 
        options={{ title: "Quizit" }} 
      />
    </Tabs>
  );
}
