import { View, Text, Image, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-neutral-950 px-4 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-neutral-300 text-xs">Good Evening</Text>
          <Text className="text-white text-xl font-semibold">Welcome Back</Text>
        </View>
        <Ionicons name="notifications-outline" size={22} color="white" />
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-neutral-900 rounded-xl px-4 py-3 mb-6">
        <Feather name="search" size={18} color="#aaa" />
        <TextInput
          placeholder="Search music, artists, albums..."
          placeholderTextColor="#aaa"
          className="ml-2 text-white flex-1 text-sm"
        />
      </View>

      {/* Featured Section */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-2">Recently Played</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["https://i.imgur.com/UYiroysl.jpg", "https://i.imgur.com/UPrs1EWl.jpg", "https://i.imgur.com/MABUbpDl.jpg"].map((img, i) => (
            <View key={i} className="mr-4">
              <Image
                source={{ uri: img }}
                className="w-32 h-32 rounded-xl"
                resizeMode="cover"
              />
              <Text className="text-white mt-2 text-sm font-medium" numberOfLines={1}>
                Chill Vibes {i + 1}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Genres / Playlists Grid */}
      <View className="mb-6">
        <Text className="text-white text-lg font-semibold mb-4">Your Mixes</Text>
        <View className="flex-row flex-wrap -mx-2">
          {["Workout", "Focus", "Party", "Relax", "Jazz", "Indie"].map((genre, i) => (
            <TouchableOpacity
              key={i}
              className="w-1/2 px-2 mb-4"
              activeOpacity={0.8}
            >
              <View className="bg-neutral-900 rounded-xl p-4 h-28 justify-between">
                <Text className="text-white font-medium text-base">{genre}</Text>
                <Feather name="headphones" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Floating Now Playing Bar (Optional) */}
      <View className="absolute bottom-6 left-4 right-4 bg-neutral-800 rounded-full p-3 flex-row justify-between items-center shadow-lg shadow-black/50">
        <View className="flex-row items-center">
          <Image
            source={{ uri: "https://i.imgur.com/UYiroysl.jpg" }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-white text-sm font-semibold">Eternal Echoes</Text>
            <Text className="text-neutral-400 text-xs">By Nova</Text>
          </View>
        </View>
        <Ionicons name="play" size={20} color="white" />
      </View>
    </View>
  );
}
