import { Tabs } from "expo-router";
import { Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import cardsIcon from "../assets/icons/cardsIcon.png";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../data/authContext";
import AuthScreen from "./auth";

export default function RootLayout() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <AuthScreen/>;
  }

  return (
    <SafeAreaProvider>
        <Tabs
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#ffe8cd',
            tabBarInactiveTintColor: '#a69887',
            tabBarStyle: {
            height: 90,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: '#011A2E',
            borderTopColor: 'black',
            },
        }}
        initialRouteName="library"
        >
        <Tabs.Screen
            name="index"
            options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
            )
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
                source={cardsIcon} 
                style={{ 
                    width: size, 
                    height: size, 
                    resizeMode: 'contain',
                    tintColor: color
                }} 
                />
            )
            }} 
        />
        <Tabs.Screen
            name="profile"
            options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
                <Ionicons name="person" size={size} color={color} />
            )
            }}
        />
        </Tabs>
    </SafeAreaProvider>
  );
}
