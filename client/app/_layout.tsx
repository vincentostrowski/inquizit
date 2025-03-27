import { Tabs } from "expo-router";
import { Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import quizitIcon from "../assets/icons/quizit100.png";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#CCCCCC',
          tabBarStyle: {
            height: 85,
            paddingBottom: 10,
            paddingTop: 10,
          }
        }}
        initialRouteName="library"
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen 
          name="library" 
          options={{ 
            title: "Library",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library" size={size} color={color} />
            )
          }} 
        />
        <Tabs.Screen 
          name="quizit" 
          options={{ 
            title: "Quizit", 
            tabBarIcon: ({ color, size }) => (
              <Image 
                source={quizitIcon} 
                style={{ 
                  width: size, 
                  height: size, 
                  resizeMode: 'contain',
                  opacity: color === '#CCCCCC' ? 0.5 : 1 
                }} 
              />
            )
          }} 
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
