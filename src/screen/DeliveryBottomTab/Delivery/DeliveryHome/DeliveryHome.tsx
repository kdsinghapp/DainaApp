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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
import HomeHeaderBar from "../../../../compoent/HomeHeaderBar";
import imageIndex from "../../../../assets/imageIndex";
import font from "../../../../theme/font";
import OnlineSlideRight from "../../../../compoent/OnlineSlideRight";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import { successToast } from "../../../../utils/customToast";

type Parcel = {
  id: string;
  date: string;
  from: string;
  to: string;
  status: "Pending" | "Delivered" | "Canceled";
  statusColor: string;
  iconBg: string;
  icon?: string;
};

const TABS = ["Pending", "Complete", "Canceled"] as const;

const DeliveryHome = () => {
 
  // ---------- DATA ----------
  const parcels: Parcel[] = [
    {
      id: "5R9G87R",
      date: "14 May 2023",
      from: "1234 Elm Street Springfield, IL 62701",
      to: "5678 Maple Avenue Seattle, WA 98101",
      status: "Pending",
      statusColor: "#FFA000",
      iconBg: "#FFF7E0",
    },
    {
      id: "8ZX2K1B",
      date: "15 May 2023",
      from: "21 Bridge Ave, NY 10001",
      to: "9 Pine Rd, WA 98001",
      status: "Delivered",
      statusColor: "#4CAF50",
      iconBg: "#E8F5E9",
    },
    {
      id: "3AA9M3Q",
      date: "12 May 2023",
      from: "10 Park St, TX 73301",
      to: "44 Lake Dr, CA 90001",
      status: "Canceled",
      statusColor: "#E53935",
      iconBg: "#FDECEC",
    },
  ];

  // ---------- STATE ----------
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [isOnline, setIsOnline] = useState(false);

  // ---------- FILTERED LIST ----------
  const filtered = useMemo(() => {
    if (activeTab === "Complete")
      return parcels.filter((p) => p.status === "Delivered");
    if (activeTab === "Canceled")
      return parcels.filter((p) => p.status === "Canceled");
    return parcels.filter((p) => p.status === "Pending");
  }, [activeTab]);

  // ---------- ANIMATIONS ----------
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
    outputRange: [4, 96], // knob slides smoothly left ↔ right
  });

  // list slide when changing tab
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

  const translateX = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const fade = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const navigation = useNavigation()

  // ---------- RENDER ----------
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />

      <HomeHeaderBar
        location="Wallace, Australia"
        onLocationPress={() => console.log("Change location")}
        onNotificationPress={() => console.log("Notifications clicked")}
        hasNotification={true}
      />

    <OnlineSlideRight 
    onSlideSuccess={() => 
successToast("Online")

    } 

    />
    
    <View style={styles.container1}>
      {/* Earnings */}
      <View style={styles.card1}>
        <Image source={imageIndex.earing} style={{
            height:35,
            width:35
        }} 
        
        resizeMode="contain"
        />
        <Text style={styles.title}>Today's Earnings</Text>
        <Text style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop:5
        }}>7.72€</Text>
      </View>

      {/* Rides */}
      <View style={styles.card1}>
        <Image source={imageIndex.cars} style={{
          height:35,
          width:35
        }}        resizeMode="contain"
        />
        <Text style={styles.title}>Today's Rides</Text>
        <Text style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop:5
        }}>12</Text>
      </View>
    </View>

      {/* Orders header row */}
      <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <Image
          source={imageIndex?.Filter || { uri: "" }}
          style={{ height: 24, width: 24 }}
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
      <Animated.View
        style={{ flex: 1, transform: [{ translateX }], opacity: fade }}
      >
        <FlatList
          data={filtered}
          style={{
            marginTop:12
          }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: item.iconBg || "#F5F5F5" },
                  ]}
                >
                  <Image
                    source={imageIndex?.icons || { uri: "" }}
                    style={{ height: 24, width: 24 }}
                    resizeMode="contain"
                  />
                </View>

                <Text style={[styles.cardId, styles.bold]}>#{item.id}</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>

              <View style={styles.routeRow}>
                <Image
                  source={imageIndex?.Vector || { uri: "" }}
                  style={{ height: 88, width: 10 }}
                  resizeMode="contain"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.label}>From</Text>
                  <Text style={[styles.value, { marginTop: 4 }]}>
                    {item.from}
                  </Text>
                  <Text style={[styles.label, { marginTop: 10 }]}>To</Text>
                  <Text style={[styles.value, { marginTop: 4 }]}>{item.to}</Text>
                  {/* <View style={styles.statusRow}>
                    <Text style={styles.statusText}>Delivery Status :</Text>
                    <Text
                      style={[
                        styles.statusValue,
                        { color: item.statusColor || "#555" },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View> */}
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders here yet.</Text>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default DeliveryHome;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },

  topRow: {
    marginTop: 8,
    marginBottom: 4,
  },

  pill: {
    width: 180,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD600",
    justifyContent: "center",
    overflow: "hidden",
  },
  pillHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pillLeftText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    fontWeight: "700",
  },
  pillRightText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    fontWeight: "600",
  },
  knob: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: 80,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  onlineText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    textAlign: "center",
  },

  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "black",
     fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 4,
    borderRadius: 12,
    marginBottom: 12,
    height:55,
    justifyContent:"center" ,
    alignItems:"center"

  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#000000",
    elevation: 1,
    height:45,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    justifyContent:"center",
    alignItems:"center"
  },
  tabText: {
    fontSize: 13,
    color: "#1C1B1B",
    fontFamily: font.MonolithRegular,
  },
  tabTextActive: {
    color: "white",
    fontWeight: "700",
     fontSize: 15,


  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
     marginTop: 20,
  },
  card1: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    height: 28,
    width: 28,
    marginBottom: 11,
   },
  title: {
    color: "#EDEDED",
    fontSize: 14,
     marginTop:8
  },
 

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardId: {
    fontSize: 15,
    marginRight: 8,
    color: "black",
  },
  bold: { fontWeight: "700", fontFamily: font.MonolithRegular },
  cardDate: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft:18
  },
  label: {
    fontSize: 13,
    color: "#BABFC5",
    fontFamily: font.MonolithRegular,
  },
  value: {
    fontSize: 14,
    color: "#76889A",
    fontFamily: font.MonolithRegular,
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginRight: 6,
    fontFamily: font.MonolithRegular,
  },
  statusValue: {
    fontSize: 13,
    fontFamily: font.MonolithRegular,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },
});
