import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
 import imageIndex from "../../../../assets/imageIndex";
import font from "../../../../theme/font";
import ScreenNameEnum from "../../../../routes/screenName.enum";
  
type OrderStatus = "Pending" | "Completed" | "Canceled";
type Order = {
  id: string;
  name: string;
  phone: string;
  code: string; // e.g. HSW 4736 XK
  status: OrderStatus;
  pickup: string;
  drop: string;
  avatar?: string; // remote/avatar uri if you have
};

const TABS = ["Pending", "Complete", "Canceled"] as const;

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  Pending:   { bg: "#FFF4E5", text: "#C26B00", label: "Pending" },
  Completed: { bg: "#EAF8EE", text: "#00CE9A", label: "Completed" },
  Canceled:  { bg: "#FDECEC", text: "#D32F2F", label: "Canceled" },
};

const ordersSeed: Order[] = [
  {
    id: "1",
    name: "Brandon Gouse",
    phone: "487 315 3576",
    code: "HSW 4736 XK",
    status: "Completed",
    pickup:
      "Sapphire House, 402 A, B, C, Sapna Sangeeta Road, Indore, Madhya Pradesh 452014",
    drop:
      "Shivamprui Colony, Indore, Madhya Pradesh 452014",
    avatar:
      "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "2",
    name: "Ann Culhane",
    phone: "072 579 6968",
    code: "HSW 4736 XK",
    status: "Completed",
    pickup:
      "Sapphire House, 402 A, B, C, Sapna Sangeeta Road, Indore, Madhya Pradesh 452014",
    drop:
      "Shivamprui Colony, Indore, Madhya Pradesh 452014",
    avatar:
      "https://i.pravatar.cc/150?img=32",
  },
  {
    id: "3",
    name: "Lydia Rosser",
    phone: "206 890 6572",
    code: "HSW 4736 XK",
    status: "Pending",
    pickup:
      "Sapphire House, 402 A, B, C, Sapna Sangeeta Road, Indore, Madhya Pradesh 452014",
    drop:
      "Shivamprui Colony, Indore, Madhya Pradesh 452014",
    avatar:
      "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "4",
    name: "Jon Parker",
    phone: "303 444 2011",
    code: "HSW 4736 XK",
    status: "Canceled",
    pickup:
      "21 Bridge Ave, NY 10001",
    drop:
      "9 Pine Rd, WA 98001",
    avatar: "https://i.pravatar.cc/150?img=47",
  },
];

const DeliveryHome = () => {
  const navigation = useNavigation();

  // online pill (optional, kept from your version)
  const [isOnline, setIsOnline] = useState(false);
  const pillX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pillX, {
      toValue: isOnline ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOnline]);
  const knobTranslate = pillX.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 96],
  });

  // tabs + filter
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const filtered: Order[] = useMemo(() => {
    if (activeTab === "Complete") {
      return ordersSeed.filter((o) => o.status === "Completed");
    }
    if (activeTab === "Canceled") {
      return ordersSeed.filter((o) => o.status === "Canceled");
    }
    return ordersSeed.filter((o) => o.status === "Pending");
  }, [activeTab]);

  // list enter animation on tab change
  const listSlide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    listSlide.setValue(0);
    Animated.timing(listSlide, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [activeTab]);
  const translateX = listSlide.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const fade = listSlide.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
const navgation = useNavigation()
  const renderItem = ({ item }: { item: Order }) => {
    const st = STATUS_STYLES[item.status];
    console.log
    return (
      <TouchableOpacity style={styles.card} 
      
      
  onPress={() => {
    if (item.status == "Pending") {
      navigation.navigate(ScreenNameEnum.ParcelDetails, {
        item: item,
      });
    }
  }}

      >
        {/* Top row: avatar, name/phone, status pill, code */}
        
        <View style={styles.cardTop}>
          <Image
            source={
              item.avatar
                ? { uri: item.avatar }
                : imageIndex?.avatar || { uri: "" }
            }
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.phone} numberOfLines={1}>
              {item.phone}
            </Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusPillText, { color: st.text }]}>
              {st.label}
            </Text>
          </View>
        </View>
 
         <Text style={styles.code} numberOfLines={1}>
          {item.code}
        </Text>

        {/* Pickup / Drop block */}
        <View style={styles.splitter} />

        <View style={styles.stopsRow}>
          {/* timeline dots/line image (replace with your own if needed) */}
          <Image
            source={imageIndex?.Dots || { uri: "" }}
            style={{ width: 12, height: 88, marginRight: 10 }}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.stopLabel}>Pickup Location</Text>
            <Text style={styles.stopValue} numberOfLines={2}>
              {item.pickup}
            </Text>

            <Text style={[styles.stopLabel, { marginTop: 10 }]}>
              Drop Location
            </Text>
            <Text style={styles.stopValue} numberOfLines={2}>
              {item.drop}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <Image
          source={imageIndex?.Filter || { uri: "" }}
          style={{ height: 22, width: 22 }}
          resizeMode="contain"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      <Animated.View style={{ flex: 1, transform: [{ translateX }], opacity: fade }}>
        <FlatList
          data={filtered}
          style={{
            marginTop:10
          }}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders here yet.</Text>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default DeliveryHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },

  /* header */
  ordersHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#000",
    fontWeight: "700",
   },

  /* summary cards */
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  summaryTitle: {
    color: "#EDEDED",
    fontSize: 14,
    marginTop: 8,
    fontFamily: font.MonolithRegular,
  },
  summaryValue: {
    marginTop: 5,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: font.MonolithRegular,
  },

  /* tabs */
  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 20,
    marginBottom: 12,
     alignItems: "center",
    marginTop:12
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#000",
    height: 40,
  },
  tabText: {
    fontSize: 13,
    color: "#1C1B1B",
   },
  tabTextActive: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
   },

  /* cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  borderColor: "#eee",
  borderWidth: 1,

  // ✅ iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    color: "black",
    fontWeight: "700",
   },
  phone: {
    marginTop: 2,
    fontSize: 13,
    color: "#9DB2BF",
    fontFamily: font.MonolithRegular,
  },
  statusPill: {
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: font.MonolithRegular,
  },
  code: {
     marginLeft: 52, // align under name (40 avatar + 12 gap)
    fontSize: 12,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  splitter: {
     borderWidth:0.5,
     borderColor:"#D9D9D9",
     marginTop:10 ,
     marginBottom:5
   },

  stopsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
    marginLeft: 8,
  },
  stopLabel: {
    fontSize: 13,
    color: "#3B4051",
    fontWeight:"500"
   },
  stopValue: {
    fontSize: 13,
    color: "#808080",
    marginTop: 4,
    lineHeight: 20,
    fontWeight:"500"
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },
});

