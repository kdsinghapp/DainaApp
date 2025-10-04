import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
 } from "react-native";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import CustomHeader from "../../../compoent/CustomHeader";

type OrderStatus = "packaged" | "shipped" | "inTransit" | "delivered";

type Order = {
  id: string;
  trackingId: string;
  fromCity: string;
  toCity: string;
  startDate: string; // ISO or formatted string
  endDate: string;
  status: OrderStatus;
};

const STATUS_STEPS: OrderStatus[] = [
  "packaged",
  "shipped",
  "inTransit",
  "delivered",
];

// --- Sample data (replace with API response) ---
const SAMPLE: Order[] = [
  {
    id: "1",
    trackingId: "TY9860036NM",
    fromCity: "New York",
    toCity: "Mumbai",
    startDate: "Jan 30, 2023",
    endDate: "Jan 31, 2023",
    status: "packaged",
  },
  {
    id: "2",
    trackingId: "TY9860036NM",
    fromCity: "New York",
    toCity: "Mumbai",
    startDate: "Jan 30, 2023",
    endDate: "Jan 31, 2023",
    status: "shipped",
  },
  {
    id: "3",
    trackingId: "TY9860036NM",
    fromCity: "New York",
    toCity: "Mumbai",
    startDate: "Jan 30, 2023",
    endDate: "Jan 31, 2023",
    status: "inTransit",
  },
  {
    id: "4",
    trackingId: "TY9860036NM",
    fromCity: "New York",
    toCity: "Mumbai",
    startDate: "Jan 30, 2023",
    endDate: "Jan 31, 2023",
    status: "delivered",
  },
];

export default function OrdersPrfile() {
  const [tab, setTab] = useState<"pending" | "complete">("pending");
const nava = useNavigation()
  // Filter by tab
  const data = useMemo(() => {
    return SAMPLE.filter((o) =>
      tab === "pending" ? o.status !== "delivered" : o.status === "delivered"
    );
  }, [tab]);
  const OrderCard = ({ order }: { order: Order }) => {
    return (
      <TouchableOpacity style={styles.card} 
      
    //   onPress={()=>{
    //     nava.navigate(ScreenNameEnum.ViewDetails)
    //   }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.trackingLabel}>Tracking ID:</Text>
          <Text style={styles.trackingId}>{order.trackingId}</Text>
        </View>
  
   
        <View style={styles.row}>
          <View style={styles.cityBlock}>
            <Text style={styles.date}>{order.startDate}</Text>
            <Text style={styles.city}>{order.fromCity}</Text>
          </View>
  
          <Pressable style={styles.playButton}>
          <Image  
          style={{
            height:22,
            width:22
          }}
          source={imageIndex.BackLeft}/>
          </Pressable>
  
          <View style={[styles.cityBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.date}>{order.endDate}</Text>
            <Text style={styles.city}>{order.toCity}</Text>
          </View>
        </View>
  
         
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent/>
      <CustomHeader


                
label="Orders" />
      <View style={styles.container}>
 

       

        <FlatList
          contentContainerStyle={{ paddingBottom: 24 ,marginTop:11 }}
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

/* -------------------- UI Pieces -------------------- */

const SegmentedTab = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const StatusPill = ({ status }: { status: OrderStatus }) => {
  const text =
    status === "packaged"
      ? "Still Packaged"
      : status === "shipped"
      ? "In Shipping"
      : status === "inTransit"
      ? "In Transit"
      : "Delivered";

  const pillStyle =
    status === "delivered" ? styles.pillDone : styles.pillProgress;

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText,{
        color:"white"
      }]}>{text}</Text>
    </View>
  );
};

const ProgressTrack = ({ status }: { status: OrderStatus }) => {
  // Calculate progress 0..1 based on step index
  const idx = STATUS_STEPS.indexOf(status);
  const progress = idx / (STATUS_STEPS.length - 1);

  return (
    <View>
      {/* Dots + line */}
      <View style={styles.trackBase}>
        <View style={styles.trackLine} />
        <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
        {/* 4 milestone dots */}
        {STATUS_STEPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i <= idx ? styles.dotActive : styles.dotInactive,
              { left: `${(i / (STATUS_STEPS.length - 1)) * 100}%` },
            ]}
          />
        ))}
      </View>
    </View>
  );
};



/* -------------------- Styles -------------------- */

const YELLOW = "#FFCC00";
const TEXT = "#0F0F0F";
const MUTED = "#7C7C7C";
const CARD = "#FFFFFF";
const BG = "white";
const BORDER = "#EFEFEF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 28,   fontFamily:font.MonolithRegular, color: TEXT, marginBottom: 10 },

  tabsWrap: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 1, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    marginTop:11,
    shadowRadius: 1.41,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#FFCC00" },
  tabText: { fontSize: 14, fontFamily:font.MonolithRegular, color: MUTED },
  tabTextActive: { color: "#000",fontSize: 14, fontFamily:font.MonolithRegular, },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  trackingLabel: { color: MUTED, fontFamily:font.MonolithRegular,  },
  trackingId: { color: TEXT, fontFamily:font.MonolithRegular,  },

  trackBase: {
    height: 24,
    justifyContent: "center",
    marginBottom: 12,
  },
  trackLine: {
    position: "absolute",
    height: 4,
    backgroundColor: "#E8E8E8",
    left: 8,
    right: 8,
    borderRadius: 4,
  },
  trackFill: {
    position: "absolute",
    height: 4,
    backgroundColor: YELLOW,
    left: 8,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    marginLeft: -8, // center on position
    borderRadius: 8,
    top: 4,
    borderWidth: 3,
  },
  dotActive: { backgroundColor: YELLOW, borderColor: "#FFF" },
  dotInactive: { backgroundColor: "#FFF", borderColor: "#E8E8E8" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cityBlock: { flex: 1 },
  date: { color: MUTED, fontSize: 12, marginBottom: 4,fontFamily:font.MonolithRegular,  },
  city: { color: TEXT, fontSize: 16, fontFamily:font.MonolithRegular,  },

  playButton: {
    width: 28,
    height: 28,
 
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  pillProgress: {
    backgroundColor: "#FFCC00",
  },
  pillDone: {
    backgroundColor: "#DFF7DA",
  },
  pillText: {fontFamily:font.MonolithRegular, fontSize: 12, color: TEXT },

  viewDetails: { color: "#8A8A8A", fontFamily:font.MonolithRegular,  },
});
