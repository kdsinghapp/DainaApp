import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { SafeAreaView } from "react-native-safe-area-context";
import font from "../../../theme/font";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;        // e.g., "3:40 PM"
  avatar: string;      // image url
  isOnline?: boolean;
  unreadCount?: number;
};

const SAMPLE_DATA: ChatItem[] = [
  {
    id: "1",
    name: "Jenny Wilson",
    lastMessage: "Of course, we just added that to yo…",
    time: "3:40 PM",
    avatar: "https://i.pravatar.cc/100?img=5",
    isOnline: true,
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Davis Siphron",
    lastMessage: "From chew toys to cozy beds, we've got ev…",
    time: "3:40 PM",
    avatar: "https://i.pravatar.cc/100?img=14",
  },
  {
    id: "3",
    name: "Aspen Herwitz",
    lastMessage: "Perfect. I’ll ping you after training.",
    time: "3:36 PM",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    id: "4",
    name: "Cheyenne Kenter",
    lastMessage: "Monday works. Send the doc when ready.",
    time: "3:40 PM",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: "5",
    name: "Livia Ekstrom Bothman",
    lastMessage: "Let’s switch to 3-4-3 in the 2nd half.",
    time: "3:38 PM",
    avatar: "https://i.pravatar.cc/100?img=18",
  },
];

export default function ChatInboxScreen({
  onPressChat,
}: {
  onPressChat?: (item: ChatItem) => void;
}) {
  const [query, setQuery] = useState("");

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SAMPLE_DATA;
    return SAMPLE_DATA.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.lastMessage.toLowerCase().includes(q)
    );
  }, [query]);
const navagtaion = useNavigation()
  const renderItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() =>navagtaion.navigate(ScreenNameEnum.ChatScreen) }
      // onPress={() => onPressChat?.(item)}
    >
      <View style={styles.avatarWrap}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>

      <View style={styles.textCol}>
        <View style={styles.nameTimeRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[styles.lastMessage, item.unreadCount ? styles.unread : null]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>

          {!!item.unreadCount && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent/>
      <Text style={styles.header}>Inbox</Text>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Search…"
          placeholderTextColor="#9aa0a6"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={[]} 
        style={{
          marginTop:15
        }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    fontSize: 28,
     marginBottom: 12,
    color: "#0f172a",
    fontFamily:font.MonolithRegular
  },
  searchBox: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 0,  // better alignment with TextInput
    marginBottom: 8,
    height: 48,
    justifyContent: "center",

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

     borderWidth: 1,
    borderColor: "#eee",

  },
  input: {
    fontSize: 16,
    color: "black",
    fontFamily: font.MonolithRegular,
    paddingVertical: 0,   // remove extra padding in Android

  },
  separator: {
    height: 1,
    backgroundColor: "#eef2f7",
    marginLeft: AVATAR_SIZE + 16, // align with text column
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: 16,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
  },
  onlineDot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    right: 0,
    bottom: 0,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  textCol: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontFamily:font.MonolithRegular,
    color: "#0f172a",
  },
  time: {
    fontSize: 12,
    color: "black",
    marginLeft: 8,
    fontFamily:font.MonolithRegular

  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: "#1E1E1E",
    fontFamily:font.MonolithRegular

  },
  unread: {
    color: "#FFCC00",
    fontFamily:font.MonolithRegular ,
    fontSize:12

   },
  badge: {
    backgroundColor: "#FFCC00",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontFamily:font.MonolithRegular
  },
});
