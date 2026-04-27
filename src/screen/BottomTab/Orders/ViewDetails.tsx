import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking
} from "react-native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import font from "../../../theme/font";
import imageIndex from "../../../assets/imageIndex";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { GetApi } from "../../../Api/apiRequest";
 import { STATUS, STATUS_LABELS, STATUS_ICONS, STATUS_COLORS } from "../../../utils/Constant";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { successToast } from "../../../utils/customToast";
import { color } from "../../../constant";
import RatingModal from "../../../compoent/RatingModal";
import { WebSocket_Url } from "../../../Api";
import strings from "../../../localization/Localization";

type Order = {
  id: string;
  trackingId: string;
  fromCity: string;
  toCity: string;
  startDate: string;
  endDate: string;
  status: string;
};

const STATUS_STEPS = [
  STATUS.PENDING,
  STATUS.ASSIGNED,
  STATUS.GOING_TO_PICKUP,
  STATUS.PICKED_UP,
  STATUS.ON_THE_WAY,
  STATUS.DELIVERED,
];

const norm = (s: string | undefined) => (s || "").toLowerCase().trim();


export default function ViewDetails() {
  const nav = useNavigation()
  const route: any = useRoute();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const ratingSubmittedRef = useRef(false);
  const closeRatingModal = useCallback(() => {
    setShowRatingModal(false);
   }, [nav]);
  const handleRatingSubmit = useCallback(
    async (rating: number, comment: string) => {
      if (rating < 1) return;
      setRatingSubmitting(true);
      try {
        // TODO: replace with your API e.g. POST /order/{id}/rating or /delivery/rating
        // const parcelId = parcel?.id ?? item?.id;
        // await PostApi({ url: `/rate-delivery`, body: { parcelId, rating, comment } });
        ratingSubmittedRef.current = true;
        setShowRatingModal(false);
        successToast("Thanks for your rating!");
        nav.goBack();
      } catch (_) {
      } finally {
        setRatingSubmitting(false);
      }
    },
    [nav]
  );

  const { item } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [parcel, setParcel] = useState(item ?? null);
  const [statusKey, setStatusKey] = useState<string | null>(() => item?.deliveryStatus ?? null);
  const isMounted = useRef(true);
  const socketRef = useRef<WebSocket | null>(null);
  const getDetailRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const getDetail = async () => {
    const parcelId = parcel?.id ?? item?.id;
    if (!parcelId) return;
    const param = { url: `/parcel-details/${parcelId}` };
    const res = await GetApi(param, setLoading);
    if (isMounted.current && res?.status === 1 && res?.parcel) {
      setParcel({ ...res.parcel });
    }
  };
  getDetailRef.current = getDetail;

  useFocusEffect(
    useCallback(() => {
      getDetailRef.current?.();
      return () => { };
    }, []),
  );

  useEffect(() => {
    const key = parcel?.deliveryStatus ?? item?.deliveryStatus ?? null;
    setStatusKey(key);
  }, [parcel?.deliveryStatus, item?.deliveryStatus]);

  useEffect(() => {
    isMounted.current = true;
    getDetail();
    return () => {
      isMounted.current = false;
    };
  }, [item?.id]);
  useEffect(() => {
    let ws: WebSocket | null = null;
    const connectSocket = (token: string) => {
      return new Promise<void>((resolve, reject) => {
        try {
          const wsUrl = `${WebSocket_Url}/user?token=${encodeURIComponent(token)}`;
          ws = new WebSocket(wsUrl);
          let resolved = false;
          ws.onopen = () => {
            resolved = true;
            socketRef.current = ws;
            try {
              ws?.send(JSON.stringify({ type: "ping" }));
            } catch (_) { }
            resolve();
          };
          ws.onmessage = async (event: { data: string | Blob | ArrayBuffer }) => {
            let raw: string;
            const d = event.data;
            if (typeof d === "string") raw = d;
            else if (d && typeof (d as Blob).text === "function") raw = await (d as Blob).text();
            else if (d instanceof ArrayBuffer) raw = new TextDecoder().decode(d);
            else raw = String(d);
            try {
              const data = JSON.parse(raw);
              if (data?.type === "parcel_status_update") {
                successToast(data?.message ?? "Parcel updated");
                getDetailRef.current?.();
              }
              if (data?.type === "order_update" || data?.refreshOrders) {
                getDetailRef.current?.();
              }
            } catch (_) { }
          };
          ws.onerror = (e: unknown) => {
            const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "WebSocket error";
            if (!resolved) reject(new Error(msg));
          };
          ws.onclose = (event: { reason?: string }) => {
            socketRef.current = null;
            if (!resolved) reject(new Error(event.reason ?? "Connection closed"));
          };
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    };
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        await connectSocket(token);
      } catch (_) { }
    };
    init();
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const source = parcel ?? item ?? {};
  const order: Order = {
    id: source?.id ?? "1",
    trackingId: source?.trackingId ?? "—",
    fromCity: source?.pickupLocation ?? "Unknown",
    toCity: source?.dropLocation ?? "Unknown",
    startDate: formatDate(source?.pickupDate),
    endDate: formatDate(source?.dropDate ?? new Date().toISOString()),
    status: statusKey ?? source?.deliveryStatus ?? STATUS.PENDING,
  };

  const statusNorm = norm(order.status);
  const currentIdx = STATUS_STEPS.indexOf(statusNorm);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;
  const progress =
    currentIdx >= 0 ? currentIdx / (STATUS_STEPS.length - 1) : 0;
  const statusLabel = STATUS_LABELS[statusNorm] || "Unknown";
  const statusColor = STATUS_COLORS[statusNorm] || "black";

  console.log("ss", parcel)
  const navigation = useNavigation()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBarComponent />
      <CustomHeader label={strings.Back} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32, marginTop: 11 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Card */}
        <TouchableOpacity style={styles.card} activeOpacity={1}
          onPress={() => {
            // navigation.navigate(ScreenNameEnum.CourierTrackingScreen, {
            //   item: item
            // })
          }}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.muted}>{strings.TrackingID}:</Text>
            <Text style={styles.bold}>{order.trackingId}</Text>
          </View>

          <Text style={styles.stepCompleteText}>
            {strings.formatString(strings.StepXofY, activeIdx + 1, STATUS_STEPS.length)}
          </Text>
          {/* Progress Bar */}
          <View style={styles.trackBase}
          >
            <View style={styles.trackLine} />
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
            {/* {STATUS_STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i <= currentIdx ? styles.dotActive : styles.dotInactive,
                  { left: `${(i / (STATUS_STEPS.length - 1)) * 100}%` },
                ]}
              />
            ))} */}

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

          {/* City Info */}
          {/* <TouchableOpacity style={styles.row}
            onPress={() => {
              if (statusNorm === STATUS.PENDING) {
                navigation.navigate(ScreenNameEnum.OfferOR, {
                  id: { parcel: parcel }
                })
              } else {
                navigation.navigate(ScreenNameEnum.CourierTrackingScreen, {
                  item: parcel
                })
              }
            }}
          > */}
          <TouchableOpacity
            style={[
              styles.row,
              statusNorm === STATUS.DELIVERED && { opacity: 0.5 } // thoda fade dikhe
            ]}
            disabled={statusNorm === STATUS.DELIVERED}
            onPress={() => {
              if (statusNorm === STATUS.DELIVERED) return; // extra safety

              if (statusNorm === STATUS.PENDING) {
                navigation.navigate(ScreenNameEnum.OfferOR, {
                  id: { parcel: parcel },
                });
              } else {
                navigation.navigate(ScreenNameEnum.CourierTrackingScreen, {
                  item: parcel,
                });
              }
            }}
          >
            <View style={styles.cityBlock}>
              <Text style={styles.date}>{order.startDate}</Text>
              <Text style={styles.city}>{order.fromCity}</Text>
            </View>

            <View style={[styles.cityBlock, { alignItems: "flex-end" }]}>
              <Text style={styles.date}>{order.endDate}</Text>
              <Text style={styles.city}>{order.toCity}</Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              borderWidth: 0.8,
              marginTop: 11,
              borderColor: "#EDEFEE",
              marginBottom: 10,
            }}
          />
          <RatingModal
            visible={showRatingModal}
            onClose={closeRatingModal}
            onSubmit={handleRatingSubmit}
            isSubmitting={ratingSubmitting}
          />
          {/* Footer */}
          <View style={styles.footerRow}>
            <View
              style={[
                styles.pill,
                activeIdx >= STATUS_STEPS.length - 1 ? styles.pillDone : styles.pillProgress,
                { backgroundColor: statusColor },
              ]}
            >
              <Text style={styles.pillText}>
                {statusLabel}
                {/* {order.status === "pending" ? "Waiting for Driver" : order.status === "packaged"
                  ? "Still Packaged"
                  : order.status === "shipped"
                    ? "In Shipping"
                    : order.status === "inTransit"
                      ? "In Transit"
                      : "Delivered"} */}
              </Text>
            </View>
            {statusNorm === STATUS.DELIVERED ? (
              <TouchableOpacity

                onPress={() => {
                  setShowRatingModal(true)
                }}
                style={{
                  backgroundColor: color.baground,
                  padding: 5,
                  borderRadius: 20,
                  paddingVertical: 7
                }}>
                <Text style={[styles.viewDetails, {
                  color: "white",
                  fontFamily: font.MonolithRegular
                }]}

                >
                  {strings.RateYourDelivery}</Text>
              </TouchableOpacity>

            ) : (

              <TouchableOpacity
                onPress={() => {
                  if (statusNorm === STATUS.PENDING) {
                    navigation.navigate(ScreenNameEnum.OfferOR, {
                      id: { parcel: parcel }
                    })
                  } else {
                    navigation.navigate(ScreenNameEnum.CourierTrackingScreen, {
                      item: parcel
                    })
                  }
                }}
                activeOpacity={0.5}
                style={{
                  backgroundColor: color.baground,
                  padding: 5,
                  borderRadius: 20,
                  paddingVertical: 7
                }}
              >
                <Text style={[styles.viewDetails, {
                  color: "white"
                }]}

                >
                  {statusNorm === STATUS.PENDING ? strings.ViewOffer : strings.TrackDetail}</Text>
              </TouchableOpacity>
            )}


          </View>
        </TouchableOpacity>
        <View style={{
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginTop: 10,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center"

        }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",

          }}>
            {parcel?.assignedDriver?.image ? <Image source={{ uri: parcel?.assignedDriver?.image }}
              style={{
                height: 60,
                width: 60,
                borderRadius: 50
              }}
            /> :



              <Image source={imageIndex.dpuser}
                style={{
                  height: 55,
                  width: 55,
                }}
              />}

            <View style={{
              marginLeft: 11

            }}>
              {parcel?.assignedDriver?.name && <Text style={{
                fontSize: 13,
                color: "gray",
                fontFamily: font.MonolithRegular
              }}>{parcel?.assignedDriver?.name}</Text>}
              {parcel?.assignedDriver?.email &&
                <Text style={{
                  fontSize: 13,
                  color: "gray",
                  fontFamily: font.MonolithRegular
                }}>{parcel?.assignedDriver?.email}</Text>
              }
              {
                parcel?.assignedDriver?.address &&
                <Text style={{
                  fontSize: 13,
                  color: "gray",
                  fontFamily: font.MonolithRegular
                }}>{parcel?.assignedDriver?.address}</Text>
              }

            </View>

          </View>
          <TouchableOpacity
            onPress={() => {
              const phone = parcel?.assignedDriver?.phone;
              if (phone) {
                Linking.openURL(`tel:${phone}`);
              }
            }}
          >
            <Image
              source={imageIndex.Calls}
              style={{
                height: 33,
                width: 33,
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Tracking Package – steps with icon + label */}
        <View style={styles.sectionTitleRow}>
          {/* {source?.imageUrl ? (
            <Image
              source={{ uri: source.imageUrl }}
              style={styles.trackingSectionIcon}
              resizeMode="contain"
            />
          ) : (
            <Image source={imageIndex.Rectangle} style={styles.trackingSectionIcon} resizeMode="contain" />
          )} */}
          <Text style={styles.sectionTitle}>{strings.TrackingPackage}</Text>
        </View>
        <View style={styles.timelineWrap}>
          {STATUS_STEPS.map((step, i) => {
            const isDone = i <= activeIdx;
            const isLast = i === STATUS_STEPS.length - 1;
            const iconName = (STATUS_ICONS as Record<string, string>)[step] || "ellipse-outline";
            return (
              <View key={step} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIconWrap, isDone ? styles.stepIconDone : styles.stepIconPending]}>
                    <Icon
                      name={isDone ? "checkmark-circle" : (iconName as any)}
                      size={24}
                      color={isDone ? "#FFF" : "#9CA3AF"}
                    />
                  </View>
                  {!isLast && (
                    <View style={[styles.stepConnector, isDone ? styles.stepConnectorDone : styles.stepConnectorPending]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>
                    {STATUS_LABELS[step] ?? step}
                  </Text>
                  {isDone && <Text style={styles.stepBadge}>{strings.Done}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const YELLOW = "#FFCC00";
const TEXT = "#0F0F0F";
const MUTED = "#7C7C7C";
const CARD = "#FFFFFF";
const BG = "#F7F7F7";
const BORDER = "#EFEFEF";

const styles = StyleSheet.create({
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  backArrow: { fontSize: 26, fontWeight: "700", color: "#6b6b6b", width: 24 },
  headerTitle: { flex: 1, textAlign: "center", fontWeight: "700", fontSize: 16, color: "#4d4d4d" },

  card: {
    backgroundColor: CARD,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#eee", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  muted: { color: MUTED, fontFamily: font.MonolithRegular },
  bold: { color: TEXT, fontFamily: font.MonolithRegular },
  stepCompleteText: {
    color: MUTED,
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    marginBottom: 6,
  },
  trackBase: { height: 24, justifyContent: "center", marginBottom: 10 },
  trackLine: { position: "absolute", height: 4, backgroundColor: "#E8E8E8", left: 8, right: 8, borderRadius: 4 },
  trackFill: { position: "absolute", height: 4, backgroundColor: YELLOW, left: 8, borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  dot: { position: "absolute", width: 16, height: 16, marginLeft: -8, borderRadius: 8, top: 4, borderWidth: 3 },
  dotActive: { backgroundColor: YELLOW, borderColor: YELLOW },
  dotInactive: { backgroundColor: "#FFF", borderColor: "#E8E8E8" },

  row: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cityBlock: { flex: 1 },
  date: { color: MUTED, fontSize: 12, fontFamily: font.MonolithRegular, marginBottom: 4 },
  city: { color: TEXT, fontSize: 16, fontFamily: font.MonolithRegular },
  playButton: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: BORDER,
    alignItems: "center", justifyContent: "center", marginHorizontal: 10, backgroundColor: "#FFF",
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pill: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  pillProgress: { backgroundColor: "#FFCC00" },
  pillDone: { backgroundColor: "#FFCC00" },
  pillText: { fontFamily: font.MonolithRegular, fontSize: 12, color: "white" },
  viewDetails: { color: "black", fontFamily: font.MonolithRegular, fontSize: 12, },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginTop: 18, marginHorizontal: 16, marginBottom: 12 },
  trackingSectionIcon: { width: 28, height: 28, marginRight: 10 },
  sectionTitle: { color: TEXT, fontFamily: font.MonolithRegular, fontSize: 16 },
  timelineWrap: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,

  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  stepLeft: { width: 44, alignItems: "center" },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconDone: { backgroundColor: YELLOW },
  stepIconPending: { backgroundColor: "#E5E7EB" },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 4,
    borderRadius: 1,
    alignSelf: "center",
  },
  stepConnectorDone: { backgroundColor: YELLOW },
  stepConnectorPending: { backgroundColor: "#E5E7EB" },
  stepContent: { flex: 1, paddingLeft: 12, paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepTitle: { fontFamily: font.MonolithRegular, fontSize: 15, color: "#6B7280" },
  stepTitleDone: { color: TEXT, fontFamily: font.MonolithRegular, },
  stepBadge: { fontFamily: font.MonolithRegular, fontSize: 11, color: YELLOW, backgroundColor: "#FEF9E7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});
