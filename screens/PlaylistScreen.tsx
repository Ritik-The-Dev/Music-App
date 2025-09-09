import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";

const playlists = [
  { id: "1", title: "Liked Songs", image: "https://wallpapercave.com/wp/wp2632423.jpg" },
  { id: "2", title: "Download Songs", image: "https://wallpapercave.com/wp/wp2632423.jpg" },
  { id: "3", title: "Chill Vibes", image: "https://wallpapercave.com/wp/wp1929504.jpg" },
  { id: "4", title: "Workout Mix", image: "https://wallpapercave.com/wp/wp8969321.jpg" },
  { id: "5", title: "Top 50 India", image: "https://wallpapercave.com/wp/wp1839578.jpg" },
  { id: "6", title: "Retro Hindi", image: "https://wallpapercave.com/wp/wp4471527.jpg" },
];

export default function PlaylistScreen() {
  const animationsRef = useRef(playlists.map(() => new Animated.Value(1)));

  const handlePressIn = (index: number) => {
    Animated.spring(animationsRef.current[index], {
      toValue: 0.95,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number, title: string) => {
    Animated.spring(animationsRef.current[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      console.log(`${title} clicked`);
    });
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <Animated.View style={{ transform: [{ scale: animationsRef.current[index] }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => handlePressIn(index)}
          onPressOut={() => handlePressOut(index, item.title)}
          className="flex-row items-center bg-gray-100 p-4 rounded-xl mb-3"
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              overflow: "hidden",
              marginRight: 12,
            }}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={{ width: "100%", height: "100%" }}
              imageStyle={{ borderRadius: 8 }}
            />
          </View>
          <Text className="text-lg text-gray-800">{item.title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black pt-10">
      {/* 🔹 Header with Title & + Button */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <Text className="text-lg text-white">🎵 Your Playlists</Text>

        <TouchableOpacity
          onPress={() => console.log("Create Playlist clicked ✅")}
          style={{
            backgroundColor: "#1DB954",
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, color: "white", fontWeight: "bold" }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Playlist List */}
      <View className="p-4" style={{ flex: 1 }}>
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
}
