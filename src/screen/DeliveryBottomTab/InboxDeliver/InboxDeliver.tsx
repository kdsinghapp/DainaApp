import React, { useCallback, useEffect, useState } from "react";
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
  Platform,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { SafeAreaView } from "react-native-safe-area-context";
import font from "../../../theme/font";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { base_url } from "../../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NewOrderNotificationModal from "../../../compoent/NewOrderNotificationModal";
import strings from "../../../localization/Localization";
import imageIndex from "../../../assets/imageIndex";
import { hp } from "../../../utils/Constant";

// ─── Types ────────────────────────────────────────────────────────────────────

type LastMessage = {
  text: string;
  senderRole: "delivery" | "user";
  time: string;
};

type ParcelOwner = {
  id: number;
  name: string;
  phone: string;
  image: string;
  email: string;
};

type Parcel = {
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string | null;
  pickupTime: string | null;
  deliveryPrice: number | null;
};

type ChatItem = {
  parcelId: number;
  trackingId: string;
  deliveryStatus: string;
  totalMessages: number;
  unreadCount: number;
  lastMessage: LastMessage;
  parcelOwner: ParcelOwner;
  parcel: Parcel;
  // driver may exist on some items
  driver?: {
    id: number;
    name: string;
    image: string;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toTimeString = (raw: string | undefined): string => {
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date.getTime())) return raw;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const statusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending": return "#f59e0b";
    case "delivered": return "#22c55e";
    case "cancelled": return "#ef4444";
    default: return "#64748b";
  }
};

// ─── Placeholder ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <View style={styles.illustrationWrap}>
      <View style={styles.illustrationBg} />
      <Image source={imageIndex.bubleYeelow} style={styles.emptyLogo} />
    </View>
    <Text style={styles.emptyTitle}>{strings.NoChatsYet}</Text>
    <Text style={styles.emptySubtitle}>{strings.NoConversationsSubtitle}</Text>
  </View>
);

// ─── Fallback avatar ──────────────────────────────────────────────────────────

const FallbackAvatar = ({ name }: { name: string }) => (
  <View style={[styles.avatar, styles.fallbackAvatar]}>
    <Text style={styles.fallbackText}>
      {name ? name.charAt(0).toUpperCase() : "?"}
    </Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InboxDeliver() {
  const navigation = useNavigation<any>();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      const url = `${base_url}/chat/history`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError(strings.SessionExpired);
        return;
      }
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const json = await response.json();
      // API shape: { status, message, count, chats: [...] }
      setChats(Array.isArray(json?.chats) ? json.chats : []);
    } catch (err: any) {
      console.error("fetchChats error:", err);
      setError(strings.FailedLoadChats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );
  useEffect(() => { fetchChats(); }, [fetchChats]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = query.trim()
    ? chats.filter((c) =>
      c.parcelOwner?.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.trackingId?.toLowerCase().includes(query.toLowerCase())
    )
    : chats;

  // ── Render row ──────────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ChatItem }) => {
    // For "delivery" side: show parcelOwner info; otherwise show driver (if exists)
    const isDeliverySender = item?.lastMessage?.senderRole === "delivery";

    // Avatar: always show parcelOwner image (delivery-side inbox = parcelOwner is the customer)
    const avatarUri = item?.parcelOwner?.image;
    const displayName = item?.parcelOwner?.name ?? "User";
    const lastMsgText = item?.lastMessage?.text ?? strings.NoMessagesYet;
    const lastMsgTime = toTimeString(item?.lastMessage?.time);
    const hasUnread = (item?.unreadCount ?? 0) > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate(ScreenNameEnum.ChatScreen, {
            item,
            chatName: displayName,
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
            />
          ) : (
            <FallbackAvatar name={displayName} />
          )}
        </View>

        {/* Text content */}
        <View style={styles.textCol}>
          {/* Name + time */}
          <View style={styles.nameTimeRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.time}>{lastMsgTime}</Text>
          </View>

          {/* Tracking ID */}
          <Text style={styles.trackingId} numberOfLines={1}>
            {item.trackingId}
          </Text>

          {/* Last message + badge */}
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {lastMsgText}
            </Text>

            {hasUnread && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          {/* Delivery status pill */}
          <View style={[styles.statusPill,]}>
            <Text style={[styles.statusText, { color: statusColor(item.deliveryStatus) }]}>
              {item.deliveryStatus}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  console.log("ssss", filtered)
  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      <Text style={styles.header}>{strings.Inbox}</Text>
      <NewOrderNotificationModal />
      {/* Search */}
      <View style={styles.searchBox}>
        <Icon name="search-outline" size={20} color="#94A3B8" style={{ marginRight: 10 }} />
        <TextInput
          placeholder={strings.SearchInboxPlaceholder}
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
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
          data={filtered}
          style={[
            styles.list,
            {
              marginBottom: 11,
              flex: 1, // ✅ IMPORTANT
            },
          ]}
          keyExtractor={(item) => String(item.parcelId)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={[
            { paddingBottom: 75 },
            filtered.length === 0 && styles.emptyContainer,
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

const AVATAR_SIZE = 50;

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    height: 67,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "black",
    fontFamily: font.MonolithRegular,
    paddingVertical: 0,
  },
  list: { marginTop: 8 },
  separator: {
    height: 1,
    backgroundColor: "#eef2f7",
    marginLeft: AVATAR_SIZE + 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  avatarWrap: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#f0f0f0",
  },
  fallbackAvatar: {
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 20,
    fontFamily: font.MonolithRegular,
    color: "#0f172a",
  },
  textCol: { flex: 1 },
  nameTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
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
  trackingId: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: font.MonolithRegular,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
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
    color: "#0f172a",
    fontSize: 11,
    fontFamily: font.MonolithRegular,

  },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: font.MonolithRegular,
    textTransform: "capitalize",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hp(15),
    paddingHorizontal: 40,
  },
  illustrationWrap: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: 'relative',
  },
  illustrationBg: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFCC00",
    opacity: 0.1,
  },
  emptyLogo: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
  },
  emptyTitle: {
    fontSize: 22,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    lineHeight: 22,
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