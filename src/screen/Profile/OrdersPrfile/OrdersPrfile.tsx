import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import LoadingModal from "../../../utils/Loader";
 import { STATUS, STATUS_COLORS, STATUS_LABELS } from "../../../utils/Constant";
import useOrders from "../../BottomTab/Orders/useOrders";
import CustomHeader from "../../../compoent/CustomHeader";
 
type OrderStatus = "packaged" | "shipped" | "inTransit" | "delivered";

type Order = {
  id: string;
  trackingId: string;
  fromCity?: string;
  toCity?: string;
  startDate?: string;
  endDate?: string;
  status?: OrderStatus;
  deliveryStatus: OrderStatus;
  pickupDate?: string;
  pickupTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
  [key: string]: any;
};

// const STATUS_STEPS: OrderStatus[] = [
//   "packaged",
//   "shipped",
//   "inTransit",
//   "delivered",
// ];
// Full progress order: all statuses so Pending tab shows correct step for every order
const STATUS_STEPS = [
  STATUS.PENDING,
  STATUS.ASSIGNED,
  STATUS.GOING_TO_PICKUP,
  STATUS.PICKED_UP,
  STATUS.ON_THE_WAY,
  STATUS.ARRIVING,
  STATUS.DELIVERED,
];

const norm = (s: string | undefined) => (s || "").toLowerCase().trim();

export default function OrdersScreen() {
  const {
    isLoading,
    orderData,
    getParceldetailsApi
  } = useOrders()
  const [tab, setTab] = useState<"pending" | "complete" | "cancelled">("pending");
  const nava = useNavigation()
  const [refreshing, setRefreshing] = useState(false);

  // Pending = all except Complete & Cancelled. Complete = delivered/completed. Cancelled = cancelled only.
  const data = useMemo(() => {
    return orderData.filter((o: Order) => {
      const status = norm(o.deliveryStatus);
      const isDelivered =
        status === STATUS.DELIVERED || status === STATUS.COMPLETED;
      const isCancelled = status === STATUS.CANCELLED;

      if (tab === "complete") return isDelivered;
      if (tab === "cancelled") return isCancelled;
      return !isDelivered && !isCancelled;
    });
  }, [tab, orderData]);


  // 2. Pull to Refresh Logic
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (getParceldetailsApi) {
        await getParceldetailsApi();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [getParceldetailsApi]);
  const OrderCard = ({ order }: { order: Order }) => {
    const formatDate = (isoString: string | undefined) => {
      if (!isoString) return "—";
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };
    return (
      <TouchableOpacity style={styles.card}
        activeOpacity={1}
        onPress={() => {
          const s = norm(order.deliveryStatus);
          if (s === STATUS.CANCELLED) return;
          (nava as any).navigate(ScreenNameEnum.ViewDetails, { item: order });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.trackingLabel}>Tracking ID:</Text>
          <Text style={styles.trackingId}>{order.trackingId}</Text>
        </View>

        {/* <ProgressTrack status={order.status} /> */}
        <ProgressTrack status={order.deliveryStatus} />
        <View style={styles.row}>
          <View style={styles.cityBlock}>
            <Text style={styles.date}>{formatDate(order.pickupDate)}</Text>
            <Text style={styles.city}>{order?.pickupLocation}</Text>
          </View>

          <Pressable style={styles.playButton}>
            <Image
              style={{
                height: 22,
                width: 22
              }}
              source={imageIndex.BackLeft} />
          </Pressable>

          <View style={[styles.cityBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.date}>{formatDate(order.pickupTime)}</Text>
            <Text style={styles.city}>{order?.dropLocation}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <StatusPill status={order.deliveryStatus} />
          <Pressable onPress={() => (nava as any).navigate(ScreenNameEnum.ViewDetails, { item: order })}>
            <Text style={styles.viewDetails}>
              {norm(order.deliveryStatus) === STATUS.DELIVERED || norm(order.deliveryStatus) === STATUS.COMPLETED ? "Write a Review" : "View Details"}
            </Text>
          </Pressable>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent />
            <CustomHeader label="Orders" />

      <LoadingModal visible={isLoading} />
      <View style={styles.container}>
        <Text style={styles.title}>Orders</Text>
        {/* Tabs */}
        <View style={styles.tabsWrap}>
          <SegmentedTab
            label="Pending"
            active={tab === "pending"}
            onPress={() => setTab("pending")}
          />
          <SegmentedTab
            label="Complete"
            active={tab === "complete"}
            onPress={() => setTab("complete")}
          />
          <SegmentedTab
            label="Canceled"
            active={tab === "cancelled"}
            onPress={() => setTab("cancelled")}
          />
        </View>

        <FlatList
          contentContainerStyle={{ paddingBottom: 120, marginTop: 11 }}
          // data={orderData}
          data={data}
          keyExtractor={(item:any) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
              No orders found
            </Text>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FFCC00"]}
              tintColor="#FFCC00"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}


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

// const StatusPill = ({ status }: { status: OrderStatus }) => {
//   const text =
//     status === STATUS.PENDING
//       ? "Still Packaged"
//       : status === STATUS.PICKED_UP
//         ? "In Shipping"
//         : status === STATUS.ON_THE_WAY
//           ? "In Transit"
//           : status === STATUS.DELIVERED ?
//             STATUS_LABELS[STATUS.DELIVERED]
//             : STATUS_LABELS[STATUS.PENDING];

//   const pillStyle =
//     status === "delivered" ? styles.pillDone : styles.pillProgress;

//   return (
//     <View style={[styles.pill, pillStyle]}>
//       <Text style={[styles.pillText, {
//         color: "white"
//       }]}>{text}</Text>
//     </View>
//   );
// };

const StatusPill = ({ status }: { status: OrderStatus }) => {
  const s = norm(status);
  const text =
    s === STATUS.CANCELLED
      ? "Cancelled"
      : STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? status ?? "Pending";

  const pillStyle =
    s === STATUS.DELIVERED || s === STATUS.COMPLETED
      ? styles.pillDone
      : s === STATUS.CANCELLED
      ? styles.pillCancelled
      : styles.pillProgress;

  const textColor =
    s === STATUS.DELIVERED || s === STATUS.COMPLETED
      ? "#FFFFFF"
      : s === STATUS.CANCELLED
      ? "#FFFFFF"
      : "#000000";
   const statusKey =  s;
    const statusLabel = STATUS_LABELS[statusKey] || 'Unknown';
    const statusColor = STATUS_COLORS[statusKey] || 'black';
  return (
    <View style={[styles.pill,  ]}>
      <Text style={[styles.pillText, { color: statusColor }]}>{statusLabel}</Text>
    </View>
  );
};

const ProgressTrack = ({ status }: { status: string }) => {
  const s = norm(status);
  const currentIdx = STATUS_STEPS.indexOf(s);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;

  const progressPercent = (activeIdx / (STATUS_STEPS.length - 1)) * 100;

  const completedCount = activeIdx + 1;
  const totalSteps = STATUS_STEPS.length;

  return (
    <View>
      <Text style={styles.stepCompleteText}>
        Step {completedCount} of {totalSteps} complete
      </Text>
      <View style={styles.trackBase}>
        {/* Background Grey Line */}
        <View style={styles.trackLine} />

        {/* Active Yellow Line */}
        <View style={[styles.trackFill, { width: `${progressPercent}%` }]} />

        {/* Milestone dots */}
        {STATUS_STEPS.map((step, i) => {
          const isActive = i <= activeIdx;
          return (
            <View
              key={step}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
                { left: `${(i / (STATUS_STEPS.length - 1)) * 100}%` },
              ]}
            />
          );
        })}
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
  title: { fontSize: 28, fontFamily: font.MonolithRegular, color: TEXT, marginBottom: 10 },

  tabsWrap: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    marginTop: 11,
    shadowRadius: 1.41,
    borderWidth: 0.8,
    borderColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: { backgroundColor: "#FFCC00" },
  tabText: { fontSize: 14, fontFamily: font.MonolithRegular, color: "#FFCC00" },
  tabTextActive: { color: "#000", fontSize: 14, fontFamily: font.MonolithRegular, },

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
  trackingLabel: { color: MUTED, fontFamily: font.MonolithRegular, },
  trackingId: { color: TEXT, fontFamily: font.MonolithRegular, },
  pillCancelled: { backgroundColor: "#DC2626" },
  stepCompleteText: {
    color: MUTED,
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    marginBottom: 6,
  },
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
  dotActive: { backgroundColor: YELLOW, borderColor: YELLOW },
  dotInactive: { backgroundColor: "#FFF", borderColor: "#E8E8E8" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cityBlock: { flex: 1 },
  date: { color: MUTED, fontSize: 12, marginBottom: 4, fontFamily: font.MonolithRegular, },
  city: { color: TEXT, fontSize: 16, fontFamily: font.MonolithRegular, },

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
    backgroundColor: "#60a552",
  },
  pillText: { fontFamily: font.MonolithRegular, fontSize: 15, color: TEXT },
  viewDetails: { color: YELLOW, fontFamily: font.MonolithRegular, },
});
