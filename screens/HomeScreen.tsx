import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  Dimensions,
  PanResponder
} from "react-native";
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import RecommendationList from "components/RecommendationList";

const { width } = Dimensions.get('window');

export const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  image: string;
  album: string;
  media_url: string;
  duration: string;
}

// Fixed Custom Slider Component
const CustomSlider = ({ value, onValueChange, style }: any) => {
  const sliderWidth = width - 80;
  const [sliderValue, setSliderValue] = useState(value);
  const [isSliding, setIsSliding] = useState(false);
  const position = useRef(new Animated.Value(value * sliderWidth)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsSliding(true);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(0, Math.min(gestureState.moveX - 40, sliderWidth));
        const newValue = newPosition / sliderWidth;
        setSliderValue(newValue);
        position.setValue(newPosition);
      },
      onPanResponderRelease: () => {
        setIsSliding(false);
        onValueChange(sliderValue);
      },
    })
  ).current;

  useEffect(() => {
    if (!isSliding) {
      Animated.timing(position, {
        toValue: value * sliderWidth,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setSliderValue(value);
    }
  }, [value, isSliding]);

  return (
    <View style={[styles.sliderContainer, style]} {...panResponder.panHandlers}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { width: position }
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: position }]
          }
        ]}
      />
    </View>
  );
};

// Compact Now Playing Component
const CompactPlayer = ({
  currentSong,
  isPlaying,
  togglePlayPause,
  onExpand
}: any) => {
  return (
    <TouchableOpacity
      onPress={onExpand}
      activeOpacity={0.9}
      style={styles.compactPlayer}
    >
      <LinearGradient
        colors={['#2a2a2a', '#1a1a1a']}
        style={styles.compactGradient}
      >
        <Image
          source={{ uri: currentSong.image }}
          style={styles.compactAlbumArt}
        />
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.compactArtist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>
        <View style={styles.compactControls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.compactPlayButton}>
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onExpand}>
            <Ionicons name="chevron-up" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [search, setSearch] = useState("Bollywood");
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingData, setTrendingData] = useState<Song[]>([]);
  const [recommendedData, setRecommendedData] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [expandedPlayer, setExpandedPlayer] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  const debouncedSetSearch = useMemo(
    () => debounce((text: string) => setSearch(text), 300),
    []
  );

  // Animation for rotating vinyl
  useEffect(() => {
    if (isPlaying && expandedPlayer) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    } else {
      spinValue.stopAnimation();
    }
  }, [isPlaying, expandedPlayer]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const searchSong = async () => {
    if (!search) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/search?query=${search}`
      );
      if (!data || data.length === 0) {
        setRecommendedData([]);
        setLoading(false);
        return;
      }
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
      setPlaylist(mappedData);
    } catch (err) {
      console.log("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingSongs = async () => {
    setTrendingLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/search?query=trending`
      );
      if (!data || data.length === 0) {
        setTrendingData([]);
        setTrendingLoading(false);
        return;
      }
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
      setTrendingData(mappedData);
    } catch (err) {
      console.log("Error fetching songs:", err);
    } finally {
      setTrendingLoading(false);
    }
  };

  const playSong = async (song: Song, index: number) => {
    try {
      // Stop current song if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      setCurrentSong(song);
      setCurrentIndex(index);
      setExpandedPlayer(true);

      // Configure audio settings
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load and play the new song
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.media_url },
        { shouldPlay: true }
      );

      soundRef.current = newSound;
      setSound(newSound);
      setIsPlaying(true);

      // Set up playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        setPlaybackStatus(status);
        if (status.isLoaded && status.didJustFinish) {
          // Auto play next song when current finishes
          playNext();
        }
      });

    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const stopSong = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setSound(null);
      setIsPlaying(false);
      setCurrentSong(null);
      setPlaybackStatus(null);
      setExpandedPlayer(false);
    }
  };

  const playNext = async () => {
    if (playlist.length === 0) return;

    const nextIndex = (currentIndex + 1) % playlist.length;
    await playSong(playlist[nextIndex], nextIndex);
  };

  const playPrevious = async () => {
    if (playlist.length === 0) return;

    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    await playSong(playlist[prevIndex], prevIndex);
  };

  const seekForward = async () => {
    if (!soundRef.current || !playbackStatus?.isLoaded) return;

    const newPosition = playbackStatus.positionMillis + 10000; // 10 seconds forward
    await soundRef.current.setPositionAsync(Math.min(newPosition, playbackStatus.durationMillis));
  };

  const seekBackward = async () => {
    if (!soundRef.current || !playbackStatus?.isLoaded) return;

    const newPosition = playbackStatus.positionMillis - 10000; // 10 seconds backward
    await soundRef.current.setPositionAsync(Math.max(newPosition, 0));
  };

  const handleSeek = async (value: number) => {
    if (!soundRef.current || !playbackStatus?.isLoaded) return;

    const newPosition = value * playbackStatus.durationMillis;
    await soundRef.current.setPositionAsync(newPosition);
  };

  const downloadSong = async (song: Song) => {
    try {
      setIsDownloading(song.id);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant media library access to download songs');
        return;
      }

      // Download the file
      const fileUri = FileSystem.documentDirectory + `${song.title.replace(/\s+/g, '_')}.mp3`;
      const { uri } = await FileSystem.downloadAsync(song.media_url, fileUri);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('BeatFlow Downloads', asset, false);

      Alert.alert('Success', `${song.title} has been downloaded successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download the song');
    } finally {
      setIsDownloading(null);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    getTrendingSongs();
    if (search) searchSong();
  }, [search]);

  const formatTime = (milliseconds: number) => {
    if (!milliseconds) return '0:00';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = playbackStatus?.isLoaded
    ? playbackStatus.positionMillis / playbackStatus.durationMillis
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-black pt-10">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: currentSong ? 100 : 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-6 mb-4 px-4">
          <Text className="text-3xl font-bold text-white">BeatFlow 🎧</Text>
          <Text className="text-sm text-gray-400 mt-1">
            Your personalized music dashboard
          </Text>
        </View>

        {/* Expanded Now Playing Section */}
        {currentSong && expandedPlayer && (
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            className="rounded-xl p-4 mb-6 mx-4"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-semibold text-lg">
                Now Playing
              </Text>
              <TouchableOpacity onPress={() => setExpandedPlayer(false)}>
                <Ionicons name="chevron-down" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-start gap-5 w-full">
              <View className="items-center">
                <Animated.Image
                  source={{ uri: currentSong.image }}
                  style={[
                    styles.albumArt,
                    { transform: [{ rotate: spin }], height: 50, width: 50 },
                  ]}
                />
              </View>

              <View className="mb-4 flex-row items-center gap-2">
                <Text className="text-white font-bold text-center text-xl" numberOfLines={1}>
                  {currentSong.title}
                </Text>
                <Text className="text-gray-400 text-sm text-center" numberOfLines={1}>
                  by ~ {currentSong.artist}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mb-4">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-xs">
                  {formatTime(playbackStatus?.positionMillis || 0)}
                </Text>
                <Text className="text-gray-400 text-xs">
                  {formatTime(playbackStatus?.durationMillis || 0)}
                </Text>
              </View>
              <CustomSlider
                value={progress}
                onValueChange={handleSeek}
              />
            </View>

            <View className="flex-row justify-center gap-3 items-center mb-4">
              <TouchableOpacity onPress={seekBackward} className="p-3">
                <Ionicons name="play-back" size={24} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={playPrevious} className="p-3">
                <Ionicons name="play-skip-back" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                className="bg-green-600 p-4 rounded-full"
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={30}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={playNext} className="p-3">
                <Ionicons name="play-skip-forward" size={30} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={seekForward} className="p-3">
                <Ionicons name="play-forward" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

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

        <RecommendationList text={!loading && recommendedData.length > 0 && search && search !== "Bollywood" ? "Search Result" : "Recommended For You"} recommendedData={recommendedData} playSong={playSong} isDownloading={isDownloading} downloadSong={downloadSong} />

        <Text className="text-xl font-semibold text-white mt-6 mb-3 px-4">
          🔥 Trending
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 px-4">
          {trendingData.map((song, i) => (
            <View key={i} className="mr-4 w-48 bg-gray-900 rounded-xl overflow-hidden shadow-md">
              <TouchableOpacity onPress={() => playSong(song, i)}>
                <Image
                  source={{ uri: song.image }}
                  className="w-full h-48"
                />
                <View className="p-3">
                  <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                    {song.title}
                  </Text>
                  <Text className="text-gray-400 text-xs" numberOfLines={1}>
                    {song.artist}
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={12} color="white" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {Math.floor(parseInt(song.duration) / 60)}:
                        {(parseInt(song.duration) % 60).toString().padStart(2, '0')}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => downloadSong(song)}
                      disabled={isDownloading === song.id}
                    >
                      {isDownloading === song.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="download" size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
          {trendingLoading && (
            <View className="flex-row justify-center items-center mt-4">
              <ActivityIndicator color="white" />
              <Text className="text-white ml-2">Loading...</Text>
            </View>
          )}
        </ScrollView>

        {loading && (
          <View className="flex-row justify-center items-center mt-4">
            <ActivityIndicator color="white" />
            <Text className="text-white ml-2">Loading...</Text>
          </View>
        )}
      </ScrollView>

      {/* Compact Player at Bottom */}
      {currentSong && !expandedPlayer && (
        <CompactPlayer
          currentSong={currentSong}
          isPlaying={isPlaying}
          togglePlayPause={togglePlayPause}
          onExpand={() => setExpandedPlayer(true)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  albumArt: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    marginBottom: 20,
  },
  sliderContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1DB954',
    top: '50%',
    marginTop: -10,
    marginLeft: -10,
  },
  compactPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  compactGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  compactAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  compactTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  compactArtist: {
    color: '#aaa',
    fontSize: 12,
  },
  compactControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactPlayButton: {
    marginRight: 16,
    padding: 8,
  },
});