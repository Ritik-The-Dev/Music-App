import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, SafeAreaView } from "react-native";
import musicData from "../assets/musicdata.json";
import recommendations from "../assets/reccomendation.json";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import { debounce, Song } from "./HomeScreen";
import RecommendationList from "components/RecommendationList";
import axios from "axios";


const MusicSearch = () => {
  const [search, setSearch] = useState("a");
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(musicData);

  const [recommendedData, setRecommendedData] = useState<Song[]>([]);
  const debouncedSetSearch = useMemo(
    () => debounce((text: string) => setSearch(text), 300),
    []
  );

  const handleSearch = (text: any) => {
    setSearchText(text);

    const results = musicData.filter((item) =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(results);
  };

  const getRecommendations = async () => {
    const { data } = await axios.get(
      `http://localhost:4000/api/search?query=${search}`
    );
    const mappedData: Song[] = data.map((e: any) => {
      return {
        id: e.id,
        title: e.song,
        artist: e.primary_artists,
        image: e.image,
        album: e.album,
        media_url: e.media_url,
        duration: e.duration,
      }
    })
    setRecommendedData(mappedData);
  }

  useEffect(() => {
    getRecommendations()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-black pt-10">
      <View style={styles.container}>

        <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-3 mb-6 mx-4">
          <Ionicons name="search" size={20} color="#aaa" className="mr-2" />
          <TextInput
            placeholder="Search for songs, artists..."
            placeholderTextColor="#aaa"
            className="text-white flex-1 border-0 outline-none"
            onChangeText={debouncedSetSearch}
            underlineColorAndroid={"transparent"}
          />
        </View>

        {/* Search Results */}
        <FlatList
          data={filteredData.slice(0, 10)}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
              <Text style={styles.album}>{item.album}</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <RecommendationList recommendedData={recommendedData} playSong={() => null}/>
    </SafeAreaView>
  );
};

export default MusicSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#121212"
  },
  searchBar: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    backgroundColor: "#282828",
    color: "white",
    fontSize: 16,
    marginBottom: 15
  },
  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333"
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  artist: {
    color: "#aaa",
    fontSize: 14
  },
  album: {
    color: "#666",
    fontSize: 12
  }
});