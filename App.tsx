import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import './global.css';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: "#1DB954",
              tabBarInactiveTintColor: "#888",
              tabBarStyle: {
                backgroundColor: "#121212",
                borderTopWidth: 0,
                elevation: 5,
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
              },
              tabBarIcon: ({ color, size }) => {
                let iconName = "";

                if (route.name === "Home") iconName = "home";
                else if (route.name === "Search") iconName = "search";
                else if (route.name === "Playlist") iconName = "queue-music";

                return <MaterialIcons name={iconName as any} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Playlist" component={PlaylistScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212", // Match your background
  },
});
