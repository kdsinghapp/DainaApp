import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { SafeAreaView } from "react-native-safe-area-context";
import font from "../../../theme/font";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { base_url } from "../../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage"; // adjust import if you use a different token source
import imageIndex from "../../../assets/imageIndex";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  isOnline?: boolean;
  unreadCount?: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toTimeString = (raw: string | undefined): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

 
// ─── Placeholder when list is empty ──────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyIcon}>💬</Text>
    <Text style={styles.emptyTitle}>No chats yet</Text>
    <Text style={styles.emptySubtitle}>Your conversations will appear here</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatInboxScreen() {
  const navigation = useNavigation<any>();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ── Fetch chat history ──────────────────────────────────────────────────────
  const fetchChats = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      // Get token — adjust based on how you store it
      const token = await AsyncStorage.getItem("token");

      const url = `${base_url}/chat/history`; // fixed double-slash
      console.log("Fetching chat history:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const json = await response.json();
      console.log("Chat consvers.  response:", json?.chats);

      // API shape: { status:1, message:"...", count:0, chats:[] }
      
      setChats(json?.chats);
    } catch (err: any) {
      console.error("fetchChats error:", err);
      setError("Failed to load chats. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // ── Filtered list ───────────────────────────────────────────────────────────
 
  // ── Render row ──────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ChatItem }) =>  {
    console.log("item",item)
    return(
          <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() =>
        navigation.navigate(ScreenNameEnum.ChatScreen, { item: item, chatName: item.name })
      }
    >

      {item?.lastMessage?.senderRole == "delivery" ? (
           <View style={styles.avatarWrap}>
        <Image
          source={{ uri: item?.parcelOwner?.image }}
          style={styles.avatar}
         />
       </View>
      ):(
   <View style={styles.avatarWrap}>
        <Image
          source={{ uri: item?.driver?.image }}
          style={styles.avatar}
         />
       </View>
      )
    }  
    {
      item?.lastMessage?.senderRole == "delivery" ? (
          <View style={styles.textCol}>
        <View style={styles.nameTimeRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.parcelOwner?.name}
          </Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
             ]}
            numberOfLines={1}
          >
            {item?.deliveryStatus || "No messages yet"}
          </Text>
        </View>
      </View>
      ) :(
          <View style={styles.textCol}>
        <View style={styles.nameTimeRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item?.driver?.name}
          </Text>
          <Text style={styles.time}>{item.parcelId}</Text>
        </View>
  

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
             ]}
            numberOfLines={1}
          >
            {item?.deliveryStatus || "No messages yet"}
          </Text>
          
        </View>
      </View>
      )
    }

    
    </TouchableOpacity>
    )
  }
  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      <Text style={styles.header}>Inbox</Text>

      {/* Search */}
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

      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Loading spinner (first load) */}
      {loading && !refreshing ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#FFCC00" />
        </View>
      ) : (
        <FlatList
          data={chats}
          style={styles.list}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            { paddingBottom: 16 },
            chats.length === 0 && styles.emptyContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchChats(true)}
              colors={["#FFCC00"]}
              tintColor="#FFCC00"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    fontFamily: font.MonolithRegular,
  },
  searchBox: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    height: 48,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  input: {
    fontSize: 16,
    color: "black",
    fontFamily: font.MonolithRegular,
    paddingVertical: 0,
  },
  list: {
    marginTop: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "#eef2f7",
    marginLeft: AVATAR_SIZE + 16,
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
    backgroundColor: "#f0f0f0",
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
    fontFamily: font.MonolithRegular,
    color: "#0f172a",
  },
  time: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 8,
    fontFamily: font.MonolithRegular,
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
    color: "#64748b",
    fontFamily: font.MonolithRegular,
  },
  unreadMessage: {
    color: "#0f172a",
    fontFamily: font.MonolithRegular,
    fontSize: 13,
    fontWeight: "600",
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
    color: "#fff",
    fontSize: 11,
    fontFamily: font.MonolithRegular,
    fontWeight: "700",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#0f172a",
    fontFamily: font.MonolithRegular,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: font.MonolithRegular,
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    fontFamily: font.MonolithRegular,
    textAlign: "center",
  },
});