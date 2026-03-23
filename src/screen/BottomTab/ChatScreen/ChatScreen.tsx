import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import imageIndex from "../../../assets/imageIndex";
import { useNavigation, useRoute } from "@react-navigation/native";
import font from "../../../theme/font";
import { base_url } from "../../../Api";
import { useSelector } from "react-redux";
import { Alert } from "react-native";
import { Linking } from "react-native";
import CounterOfferModal from "../../../compoent/MakeCounterModal";
import AcceptOfferModal from "../../../compoent/AcceptOfferModal";
import { errorToast, successToast } from "../../../utils/customToast";
import ScreenNameEnum from "../../../routes/screenName.enum";

// ─── Config ──────────────────────────────────────────────────────────────────
const WS_BASE = "wss://aitechnotech.in/DAINA/ws/chat";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  time: string;         // display string  e.g. "11:30 AM"
  isRead?: boolean;
}

interface ApiMessage {
  id: number;
  senderId: number;
  senderRole: string;
  message: string;
  isRead: boolean;
  isMine: boolean;           // ✅ use this field from API
  createdAt: string;         // ISO string
}

interface WsIncoming {
  message: string;
  sender_type?: string;
  is_mine?: boolean;
  created_at?: string;
  timestamp?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convert ISO timestamp → "hh:mm AM/PM"
 * Works for both UTC and local ISO strings from the API.
 */
const toTimeString = (iso?: string): string => {
  if (!iso) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // The API returns timestamps without 'Z', but they are UTC — append Z so
  // the browser/JS engine parses them correctly as UTC.
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  return new Date(normalized).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Convert ISO → Date label like "Today", "Yesterday", or "Mar 18"
 */
const toDayLabel = (iso: string): string => {
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`;
  const d = new Date(normalized);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const cleanToken = (t: string | null): string | null => {
  if (!t) return null;
  return t.startsWith("Bearer ") ? t.replace("Bearer ", "").trim() : t.trim();
};

// ─── Build flat list items (messages + day separators) ───────────────────────
type ListItem =
  | { type: "separator"; id: string; label: string }
  | { type: "message"; id: string; msg: Message };

const buildListItems = (messages: Message[], rawDates: Record<string, string>): ListItem[] => {
  const items: ListItem[] = [];
  let lastLabel = "";

  messages.forEach((msg) => {
    const iso = rawDates[msg.id] ?? "";
    const label = iso ? toDayLabel(iso) : "";

    if (label && label !== lastLabel) {
      items.push({ type: "separator", id: `sep_${msg.id}`, label });
      lastLabel = label;
    }
    items.push({ type: "message", id: msg.id, msg });
  });

  return items;
};

// ─── Component ───────────────────────────────────────────────────────────────
const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = (route?.params as any) || {};
  const parcelId = item?.parcelId;

  const [counterModalVisible, setCounterModalVisible] = useState(false);
  const [offerModalVisible, setOfferModalVisible] = useState(false);

  const onAcceptOffer = async (id: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const apiUrl = `https://aitechnotech.in/DAINA/api/offers/${id}/accept`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      if (response.ok) {
        successToast("Offer accepted successfully!");
        (navigation as any).navigate(ScreenNameEnum.TabNavigator);
      } else {
        errorToast(result?.message || "Failed to accept offer");
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      errorToast("Something went wrong");
    }
  };

  const onCounterOffer = async (id: number, amount: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const apiUrl = `${base_url}/offers/${id}/counter-offer`;
      const body = new URLSearchParams({
        counterAmount: String(amount),
        counterMessage: "hi",
      }).toString();

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      const result = await response.json();
      if (response.ok && (result.status == 1 || result.success === true)) {
        successToast("Counter offer sent successfully!");
        setCounterModalVisible(false);
        navigation.goBack();
      } else {
        errorToast(result?.message || "Failed to send counter offer");
      }
    } catch (error) {
      console.log("Counter offer error:", error);
      errorToast("Something went wrong");
    }
  };

  const userData: any = useSelector((state: any) => state.auth.userData);
  const [messages, setMessages] = useState<Message[]>([]);
  // Store raw ISO dates keyed by message id for day-separator calculation
  const rawDatesRef = useRef<Record<string, string>>({});
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // ── 0. Load & clean token ─────────────────────────────────────────────────
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(cleanToken(storedToken));
      } catch (e) {
        console.error("Token load error:", e);
      } finally {
        setTokenLoaded(true);
      }
    };
    loadToken();
  }, []);

  // ── 1. Fetch existing chat history ────────────────────────────────────────
  useEffect(() => {
    if (!tokenLoaded || !parcelId || !token) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const url = `${base_url}/chat/${parcelId}/messages`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          console.error(`HTTP Error: ${response.status}`);
          return;
        }

        const json = await response.json();
        // ✅ API returns { messages: [...] }  OR  a plain array
        const raw: ApiMessage[] = Array.isArray(json) ? json : json?.messages ?? [];

        const dates: Record<string, string> = {};

        const mapped: Message[] = raw.map((m) => {
          const id = String(m.id);
          dates[id] = m.createdAt; // store raw ISO for day-label
          return {
            id,
            text: m.message,
            // ✅ isMine from the API is the single source of truth
            sender: m.isMine ? "me" : "other",
            time: toTimeString(m.createdAt),
            isRead: m.isRead,
          };
        });

        rawDatesRef.current = dates;
        setMessages(mapped);
      } catch (error) {
        console.error("Fetch Messages Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [parcelId, token, tokenLoaded]);

  // ── 2. Connect WebSocket ──────────────────────────────────────────────────
  useEffect(() => {
    if (!tokenLoaded || !parcelId || !token) return;

    const wsUrl = `${WS_BASE}/${parcelId}?token=${token}`;

    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
    } catch (e) {
      console.error("WebSocket creation error:", e);
      return;
    }

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      try {
        const data: WsIncoming = JSON.parse(event.data);

        // ✅ Use is_mine flag if present; otherwise fall back to sender_type
        const isMine =
          data.is_mine !== undefined
            ? data.is_mine
            : data.sender_type === "user";   // adjust to your backend's value

        // If the server echoes our own messages we skip them to avoid duplicates
        if (isMine) return;

        const iso = data.created_at ?? data.timestamp ?? new Date().toISOString();
        const msgId = `ws_${Date.now()}_${Math.random()}`;
        rawDatesRef.current[msgId] = iso;

        const incoming: Message = {
          id: msgId,
          text: data.message,
          sender: "other",
          time: toTimeString(iso),
        };

        setMessages((prev) => [...prev, incoming]);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onerror = (e) => console.error("WS error:", e);
    ws.onclose = (e) => {
      console.log("WS closed:", e.code, e.reason);
      setConnected(false);
    };

    return () => {
      ws.onclose = null;
      ws.close();
      wsRef.current = null;
    };
  }, [parcelId, token, tokenLoaded]);

  // ── 3. Auto-scroll on new message ────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(
      () => flatListRef.current?.scrollToEnd({ animated: true }),
      100
    );
    return () => clearTimeout(timer);
  }, [messages]);

  // ── 4. Send message ───────────────────────────────────────────────────────
  const sendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const msgId = `me_${Date.now()}`;
    rawDatesRef.current[msgId] = now;

    const newMsg: Message = {
      id: msgId,
      text: trimmed,
      sender: "me",
      time: toTimeString(now),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: trimmed }));
    } else {
      console.warn("WebSocket not open — message may not be delivered.");
    }
  }, [inputText]);

  // ── Render helpers ────────────────────────────────────────────────────────
  const listItems = buildListItems(messages, rawDatesRef.current);

  const renderItem = ({ item: listItem }: { item: ListItem }) => {
    if (listItem.type === "separator") {
      return (
        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorLabel}>{listItem.label}</Text>
          <View style={styles.separatorLine} />
        </View>
      );
    }

    const { msg } = listItem;
    const isMe = msg.sender === "me";

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
            {msg.text}
          </Text>

          {/* Time + read receipt row */}
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                { color: isMe ? "rgba(255,255,255,0.75)" : "#aaa" },
              ]}
            >
              {msg.time}
            </Text>
            {/* {isMe && (
              <Text style={styles.readTick}>
                {msg.isRead ? "✓✓" : "✓"}
              </Text>
            )} */}
          </View>
        </View>
      </View>
    );
  };
  // ── Delivery agent info from API response chattingWith ────────────────────
  const chattingWith = item?.chatngWith;
  const agentName =
    item?.carrierName ??
    item?.parcelOwner?.name ??
    item?.driver?.name ??
    "Delivery Agent";

  const agentImage =
    item?.deliveryUser?.profile_image ??
    item?.parcelOwner?.image ??
    item?.driver?.image ??
    null;
  console.log("item", item)
  const handleCall = (phone: number) => {
    if (!phone) {
      Alert.alert("Error", "Phone number not available");
      return;
    }

    let phoneNumber = '';

    if (Platform.OS === 'android') {
      phoneNumber = `tel:${phone}`;
    } else {
      // iOS ke liye
      phoneNumber = `telprompt:${phone}`;
    }

    Linking.canOpenURL(phoneNumber)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Phone call not supported');
        } else {
          return Linking.openURL(phoneNumber);
        }
      })
      .catch((err) => console.log('Call Error:', err));
  };
  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={imageIndex.back} style={styles.backIcon} />
        </TouchableOpacity>

        {agentImage ? (
          <Image source={{ uri: agentImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {agentName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {agentName}  {parcelId}
          </Text>
          {/* <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: connected ? "#4CAF50" : "#aaa" },
              ]}
            />
            <Text style={[styles.statusText, { color: connected ? "#4CAF50" : "#aaa" }]}>
              {connected ? "Online" : "Offline"}
            </Text>
          </View> */}
        </View>

        {/* Offer button */}
        {item?.offerAmount && userData?.type !== "Delivery" && (
          <TouchableOpacity
            onPress={() => setOfferModalVisible(true)}
            style={styles.headerOfferBtn}>
            <Text style={styles.headerOfferText}>Order Open</Text>
            {/* <Text style={styles.headerOfferText}>Offer: ${item?.offerAmount}</Text> */}
          </TouchableOpacity>
        )}
        {/* Parcel badge */}
        <TouchableOpacity onPress={() => handleCall(item?.parcelOwner?.phone)}>

          <Image source={imageIndex.Calblack}
            style={{
              height: 33,
              width: 33,
              resizeMode: "contain"
            }}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}
      >
        {/* ── Messages ── */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#FFCC00" />
            <Text style={styles.loadingText}>Loading messages…</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={listItems}
            renderItem={renderItem}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>No messages yet. Say hi!</Text>
              </View>
            }
          />
        )}

        {/* ── Input Box ── */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#bbb"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendButton,
              { opacity: inputText.trim() ? 1 : 0.4 },
            ]}
            activeOpacity={0.7}
            disabled={!inputText.trim()}
          >
            <Image
              source={imageIndex.Messagesend}
              style={styles.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>


      <AcceptOfferModal
        visible={offerModalVisible}
        offerAmount={item?.offerAmount}
        message={item?.message}
        onCancel={() => setOfferModalVisible(false)}
        onAccept={() => {
          setOfferModalVisible(false);
          onAcceptOffer(item?.id || item?.offerId);
        }}
        onCounterPress={() => {
          setOfferModalVisible(false);
          // setCounterModalVisible(true);
        }}
      />
      {/* <AcceptOfferModal
        visible={offerModalVisible}
        offerAmount={item?.offerAmount}
        
        message={item?.message}
        onCancel={() => setOfferModalVisible(false)}
        onAccept={() => {
          setOfferModalVisible(false);
          onAcceptOffer(item?.id || item?.offerId);
        }}
        onCounterPress={() => {
          setOfferModalVisible(false);
          setCounterModalVisible(true);
        }}
      /> */}

      <CounterOfferModal
        visible={counterModalVisible}
        defaultValue={"1"}
        currency="$"
        min={1}
        max={50000}
        onCancel={() => setCounterModalVisible(false)}
        onSubmit={(amount: any) => {
          const id = item?.id || item?.offerId;
          if (id) {
            onCounterOffer(id, amount);
          } else {
            errorToast("Invalid offer ID");
          }
        }}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const YELLOW = "#FFCC00";
const YELLOW_LIGHT = "#FFF3B0";
const DARK = "#1A1A2E";
const GRAY_BG = "#F2F3F5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    gap: 10,
    // subtle shadow

  },
  backBtn: {
    padding: 2,
  },
  backIcon: {
    height: 36,
    width: 36,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK,
    fontFamily: font.MonolithRegular,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: font.MonolithRegular,
  },
  parcelBadge: {
    backgroundColor: YELLOW_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: YELLOW,
  },
  parcelBadgeText: {
    fontSize: 11,
    color: "#7a5f00",
    fontFamily: font.MonolithRegular,
    fontWeight: "600",
  },

  // ── Loader / Empty
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#aaa",
    fontFamily: font.MonolithRegular,
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    fontFamily: font.MonolithRegular,
    fontSize: 14,
  },

  // ── Day separator
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  separatorLabel: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: font.MonolithRegular,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },

  // ── Chat
  chatContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    flexGrow: 1,
  },
  bubbleWrapper: {
    marginVertical: 3,
    flexDirection: "row",
  },
  bubbleWrapperMe: {
    justifyContent: "flex-end",
  },
  bubbleWrapperOther: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 18,
  },
  myMessage: {
    backgroundColor: YELLOW,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: GRAY_BG,
    borderBottomLeftRadius: 4,
  },
  myMessageText: {
    color: "#fff",
    fontFamily: font.MonolithRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  otherMessageText: {
    color: DARK,
    fontFamily: font.MonolithRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 3,
    gap: 3,
  },
  timeText: {
    fontSize: 10,
    fontFamily: font.MonolithRegular,
  },
  readTick: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },

  // ── Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 16,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: GRAY_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    marginRight: 8,
    fontFamily: font.MonolithRegular,
    fontSize: 14,
    color: DARK,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },
  sendIcon: {
    height: 20,
    width: 20,
    tintColor: "#fff",
  },
  offerBanner: {
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6D2',
  },
  offerBannerText: {
    fontFamily: font.MonolithRegular,
    fontSize: 14,
    color: '#4A4A4A',
  },
  offerBannerAmount: {
    fontWeight: 'bold',
    color: '#E6A23C',
    fontSize: 16,
  },
  offerBannerSubText: {
    fontFamily: font.MonolithRegular,
    fontSize: 12,
    color: '#8C8C8C',
    marginTop: 2,
  },
  offerBannerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  offerBannerAcceptBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    elevation: 1,
  },
  offerBannerAcceptText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font.MonolithRegular,
  },
  offerBannerCounterBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  offerBannerCounterText: {
    color: '#FFCC00',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font.MonolithRegular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontFamily: font.MonolithRegular,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  offerSection: {
    marginTop: 15,
  },
  offerLabel: {
    fontFamily: font.MonolithRegular,
    fontSize: 12,
    color: '#888',
  },
  offerValue: {
    fontFamily: font.MonolithRegular,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 4,
  },
  offerMessage: {
    fontFamily: font.MonolithRegular,
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 4,
  },
  modalActions: {
    marginTop: 25,
    gap: 12,
  },
  modalAcceptBtn: {
    backgroundColor: '#FFCC00',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  modalAcceptText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: font.MonolithRegular,
  },
  modalCounterBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCounterText: {
    color: '#FFCC00',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: font.MonolithRegular,
  },
  headerOfferBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFCC00',
    marginRight: 6,
  },
  headerOfferText: {
    fontFamily: font.MonolithRegular,
    fontSize: 12,
    color: 'white',
  },
  headerAcceptBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAcceptText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: font.MonolithRegular,
  },
  headerCounterBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCounterText: {
    color: '#FFCC00',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: font.MonolithRegular,
  },
});

export default ChatScreen;