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
  ScrollView,
} from "react-native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { SafeAreaView, } from "react-native-safe-area-context";
import font from "../../../theme/font";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { base_url } from "../../../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import strings from "../../../localization/Localization";

// ─── Types ────────────────────────────────────────────────────────────────────

type LastMessage = {
  text: string;
  senderRole: "user" | "delivery";
  time: string;
} | null;

type Driver = {
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
  deliveryPrice: string | null;
};

type ChatItem = {
  parcelId: number;
  trackingId: string;
  deliveryStatus: string;
  offerId: number;
  offerStatus: string;
  offerAmount: string;
  totalMessages: number;
  unreadCount: number;
  lastMessage: LastMessage;
  driver: Driver;
  parcel: Parcel;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format ISO timestamp → "HH:MM" or "Mon DD" if older than today
 */
function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Capitalize first letter of a string */
function capitalize(str: string) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fff7ed", text: "#ea580c" },
  assigned: { bg: "#f0fdf4", text: "#16a34a" },
  accepted: { bg: "#eff6ff", text: "#2563eb" },
  default: { bg: "#f8fafc", text: "#64748b" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.default;
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {capitalize(status)}
      </Text>
    </View>
  );
};

// ─── Unread Count Badge ───────────────────────────────────────────────────────

const UnreadBadge = ({ count }: { count: number }) => {
  if (!count || count === 0) return null;
  return (
    <View style={styles.unreadBadge}>
      <Text style={styles.unreadBadgeText}>{count > 99 ? "99+" : count}</Text>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyIcon}>💬</Text>
    <Text style={styles.emptyTitle}>{strings.NoChatsYet}</Text>
    <Text style={styles.emptySubtitle}>{strings.NoConversationsSubtitle}</Text>
  </View>
);

// ─── Avatar with fallback ─────────────────────────────────────────────────────

const Avatar = ({ uri, name }: { uri?: string; name?: string }) => {
  const [hasError, setHasError] = useState(false);
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!uri || hasError) {
    return (
      <View style={[styles.avatar, styles.avatarFallback]}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.avatar}
      onError={() => setHasError(true)}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatInboxScreen() {
  const navigation = useNavigation<any>();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────

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

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // ── Search filter ───────────────────────────────────────────────────────────

  const filteredChats = query.trim()
    ? chats.filter(
      (c) =>
        c.driver?.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.trackingId?.toLowerCase().includes(query.toLowerCase()) ||
        c.lastMessage?.text?.toLowerCase().includes(query.toLowerCase())
    )
    : chats;

  // ── Render row ──────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: ChatItem }) => {
    // Show parcelOwner image when last message came from delivery side,
    // otherwise show driver image. Since parcelOwner isn't in the API response,
    // we always fall back to driver image safely.
    const avatarUri =
      item.lastMessage?.senderRole === "delivery"
        ? item.driver?.image   // fallback – parcelOwner not in current API shape
        : item.driver?.image;

    const driverName = item.driver?.name ?? strings.Unknown;
    const lastMsgText = item.lastMessage?.text ?? strings.NoMessagesYet;
    const msgTime = formatTime(item.lastMessage?.time);
    const hasUnread = (item.unreadCount ?? 0) > 0;

    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate(ScreenNameEnum.ChatScreen, {
            item,
            chatName: driverName,
          })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Avatar uri={avatarUri} name={driverName} />
        </View>

        {/* Text column */}
        <View style={styles.textCol}>
          {/* Row 1 – name + time */}
          <View style={styles.nameTimeRow}>
            <Text
              style={[styles.name, hasUnread && styles.nameUnread]}
              numberOfLines={1}
            >
              {driverName}
            </Text>
            {msgTime ? (
              <Text style={styles.time}>{msgTime}</Text>
            ) : null}
          </View>

          {/* Row 2 – tracking ID */}
          <Text style={styles.trackingId} numberOfLines={1}>
            #{item.trackingId}
          </Text>

          {/* Row 3 – last message + status + unread */}
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {lastMsgText}
            </Text>

            <StatusBadge status={item.deliveryStatus} />

            <UnreadBadge count={item.unreadCount} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      <Text style={styles.header}>{strings.Inbox}</Text>
      <ScrollView


        showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchBox}>
          <TextInput
            placeholder={strings.SearchInboxPlaceholder}
            placeholderTextColor="#9aa0a6"
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
            data={filteredChats}                          // ✅ filtered list
            style={styles.list}

            keyExtractor={(item) => String(item.parcelId)} // ✅ correct key
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={[
              { paddingBottom: 24, marginBottom: 120 },
              filteredChats.length === 0 && styles.emptyContainer,
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
      </ScrollView>
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
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: "#eee",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
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
    marginRight: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#f0f0f0",
  },
  avatarFallback: {
    backgroundColor: "#FFCC00",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#0f172a",
    fontWeight: "700",
  },
  textCol: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontFamily: font.MonolithRegular,
    color: "#0f172a",
  },
  nameUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 11,
    color: "#94a3b8",
    marginLeft: 8,
    fontFamily: font.MonolithRegular,
  },
  trackingId: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: font.MonolithRegular,
    marginTop: 2,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    fontFamily: font.MonolithRegular,
  },
  lastMessageUnread: {
    color: "#0f172a",
    fontWeight: "600",
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: font.MonolithRegular,
    fontWeight: "600",
  },
  unreadBadge: {
    backgroundColor: "#FFCC00",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#0f172a",
    fontSize: 10,
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