import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  RefreshControl,
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

const FallbackAvatar = ({ name }: { name: string }) => (
  <View style={styles.fallbackAvatar}>
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

  const filtered = query.trim()
    ? chats.filter((c) =>
      c.parcelOwner?.name?.toLowerCase().includes(query.toLowerCase()) ||
      c.trackingId?.toLowerCase().includes(query.toLowerCase())
    )
    : chats;

  const renderItem = ({ item }: { item: ChatItem }) => {
    const avatarUri = item?.parcelOwner?.image;
    const displayName = item?.parcelOwner?.name ?? "User";
    const lastMsgText = item?.lastMessage?.text ?? strings.NoMessagesYet;
    const lastMsgTime = toTimeString(item?.lastMessage?.time);
    const hasUnread = (item?.unreadCount ?? 0) > 0;

    return (
      <TouchableOpacity
        style={[styles.row, hasUnread && styles.unreadRow]}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(ScreenNameEnum.ChatScreen, {
            item,
            chatName: displayName,
          })
        }
      >
        <View style={styles.rowContent}>
          <View style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <FallbackAvatar name={displayName} />
            )}
            {hasUnread && <View style={styles.unreadIndicator} />}
          </View>

          <View style={styles.textCol}>
            <View style={styles.nameTimeRow}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={[styles.time, hasUnread && styles.unreadText]}>{lastMsgTime}</Text>
            </View>

            <View style={styles.idStatusRow}>
              <Text style={styles.trackingId} numberOfLines={1}>
                #{item.trackingId}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusColor(item.deliveryStatus) + '15' }]}>
                <Text style={[styles.statusText, { color: statusColor(item.deliveryStatus) }]}>
                  {item.deliveryStatus}
                </Text>
              </View>
            </View>

            <View style={styles.messageRow}>
              <Text
                style={[styles.lastMessage, hasUnread && styles.unreadMessageText]}
                numberOfLines={1}
              >
                {lastMsgText}
              </Text>

              {hasUnread && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
              )}
              <Icon name="chevron-forward" size={16} color="#CBD5E1" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      <View style={styles.headerRow}>
        <Text style={styles.header}>{strings.Inbox}</Text>
      </View>

      <NewOrderNotificationModal />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Image source={imageIndex.search1} style={{ height: 16, width: 16 }} />

          <TextInput
            placeholder={strings.SearchInboxPlaceholder}
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            style={styles.input}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Icon name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        style={styles.list}

        keyExtractor={(item) => String(item.parcelId)}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          filtered.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? <EmptyState /> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchChats(true)}
            colors={["#FFCC00"]}
            tintColor="#FFCC00"
          />
        }
      />
    </SafeAreaView>
  );
}

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",

  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  header: {
    fontSize: 28,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontFamily: font.MonolithRegular,
    marginLeft: 10,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
    marginBottom: 55
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  row: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d6e1f9ff",

    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
  },
  unreadRow: {
    borderColor: "#FFCC0030",
    backgroundColor: "#FFCC0008",
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2.2,
    backgroundColor: "#F1F5F9",
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFCC00",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  fallbackAvatar: {
    backgroundColor: "#FFCC0020",
    justifyContent: "center",
    alignItems: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2.2,
  },
  fallbackText: {
    fontSize: 22,
    color: "#FFCC00",
    fontFamily: font.MonolithRegular

  },
  textCol: {
    flex: 1,
    marginLeft: 14,
  },
  nameTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: font.MonolithRegular,
  },
  unreadText: {
    color: "#FFCC00",
    fontFamily: font.MonolithRegular

  },
  idStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  trackingId: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  statusPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  statusText: {
    fontSize: 10,
    fontFamily: font.MonolithRegular,
    textTransform: "uppercase",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    marginRight: 10,
  },
  unreadMessageText: {
    color: "#1E293B",
    fontFamily: font.MonolithRegular

  },
  badge: {
    backgroundColor: "#FFCC00",
    borderRadius: 10,
    height: 20,
    minWidth: 20,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  badgeText: {
    color: "#0F172A",
    fontSize: 11,
    fontFamily: font.MonolithRegular

  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: -40,
  },
  illustrationWrap: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  illustrationBg: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFCC0010",
  },
  emptyLogo: {
    height: 80,
    width: 80,
  },
  emptyTitle: {
    fontSize: 22,
    color: "#0F172A",
    marginBottom: 8,
    fontFamily: font.MonolithRegular,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: font.MonolithRegular,

  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#fecaca",
    gap: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    flex: 1,
  },
});