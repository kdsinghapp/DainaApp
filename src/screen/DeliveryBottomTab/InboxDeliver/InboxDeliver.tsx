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
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate(ScreenNameEnum.ChatScreen, {
            item,
            chatName: displayName,
          })
        }
      >
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <FallbackAvatar name={displayName} />
          )}
          {hasUnread && <View style={styles.activeDot} />}
        </View>

        <View style={styles.contentCol}>
          <View style={styles.topRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.unreadTime]}>
              {lastMsgTime}
            </Text>
          </View>

          <View style={styles.middleRow}>
            <View style={styles.tagWrapper}>

              <View style={[styles.statusTag, { backgroundColor: statusColor(item.deliveryStatus) + '12' }]}>
                <Text style={[styles.statusTagText, { color: statusColor(item.deliveryStatus) }]}>
                  {item.deliveryStatus}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Text
              style={[styles.messageText, hasUnread && styles.unreadMessageText]}
              numberOfLines={1}
            >
              {lastMsgText}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
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
    backgroundColor: "#F8FAFC",
  },
  headerRow: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  header: {
    fontSize: 32,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    fontFamily: font.MonolithRegular,
    marginLeft: 12,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  unreadRow: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFCC0030",
    shadowOpacity: 0.08,
    shadowColor: "#FFCC00",
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2.5,
    backgroundColor: "#F1F5F9",
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFCC00",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  fallbackAvatar: {
    backgroundColor: "#FFCC0015",
    justifyContent: "center",
    alignItems: "center",
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2.5,
  },
  fallbackText: {
    fontSize: 24,
    color: "#FFCC00",
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nameText: {
    fontSize: 17,
    color: "#0F172A",
    fontFamily: font.MonolithRegular,
    fontWeight: '600',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: font.MonolithRegular,
  },
  unreadTime: {
    color: "#FFCC00",
    fontWeight: '600',
  },
  middleRow: {
    marginBottom: 8,
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trackingTagText: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    fontFamily: font.MonolithRegular,
    marginRight: 10,
  },
  unreadMessageText: {
    color: "#0F172A",
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: "#FFCC00",
    borderRadius: 10,
    height: 20,
    minWidth: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#000000",
    fontSize: 11,
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 48,
    marginTop: -60,
  },
  illustrationWrap: {
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  illustrationBg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFCC0008",
  },
  emptyLogo: {
    height: 100,
    width: 100,
  },
  emptyTitle: {
    fontSize: 24,
    color: "#0F172A",
    marginBottom: 10,
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: font.MonolithRegular,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
    fontFamily: font.MonolithRegular,
  },
});