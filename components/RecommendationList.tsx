import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Song } from "screens/HomeScreen";

interface props {
    text?:string;
    recommendedData: Song[];
    playSong: (song: Song, i: number) => void;
    isDownloading?: string | null;
    downloadSong?: (song: Song) => void;
}

export default function RecommendationList({ text , recommendedData, playSong, isDownloading, downloadSong }: props) {
    return (
        <>
            <Text className="text-xl font-semibold text-white mt-6 mb-3 px-4">
                {text ? text : "🎧 Recommended for You"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 px-4 max-h-fit">
                {recommendedData.map((song, i) => (
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
                                        onPress={() => downloadSong ? downloadSong(song) : null}
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
            </ScrollView>
        </>
    )
}