
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
  PanResponder,
  ScrollView,
  Platform,
} from "react-native";
import MapView, { Marker, AnimatedRegion, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { GOOGLE_MAPS_APIKEY, WebSocket_Url } from "../../../Api";
import { STATUS, STATUS_COLORS, STATUS_LABELS } from "../../../utils/Constant";
import { GetApi, RateDeliveryApi } from "../../../Api/apiRequest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { successToast } from "../../../utils/customToast";
import RatingModal from "../../../compoent/RatingModal";
import strings from "../../../localization/Localization";

const { width, height } = Dimensions.get("window");
const PANEL_PEEK_HEIGHT = 280;
const PANEL_OPEN_Y = height * 0.3;
const PANEL_CLOSED_Y = height - PANEL_PEEK_HEIGHT;

const CourierTrackingScreen = () => {
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const rou: any = useRoute();
  const { item } = rou.params || {};
  const [parcel, setParcel] = useState(item ?? null);
  const socketRef = useRef<WebSocket | null>(null);
  const getDetailRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const parcelIdRef = useRef<number | undefined>(parcel?.id ?? item?.id);
  const driverLocationRef = useRef<any>(null);
  const setCurrentCoordsRef = useRef<((c: { latitude: number; longitude: number }) => void) | null>(null);
  const fitMapToRouteRef = useRef<() => void>(() => { });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const ratingSubmittedRef = useRef(false);

  // console.log("parcel",parcel)
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
  parcelIdRef.current = parcel?.id ?? item?.id;
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
                successToast(data?.message ?? "updated");
                getDetailRef.current?.();
              }

              if (data?.type === "driver_location") {
                const pId = parcelIdRef.current;
                const match = pId != null && Number(data?.parcelId) === Number(pId);
                const lat = parseFloat(data?.lat);
                const lon = parseFloat(data?.lon);
                if (match && Number.isFinite(lat) && Number.isFinite(lon)) {
                  const newPoint = { latitude: lat, longitude: lon };
                  setCurrentCoordsRef.current?.(newPoint);
                  const region = driverLocationRef.current;
                  if (region) {
                    (region as any).timing({
                      ...newPoint,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                      duration: 2000,
                      useNativeDriver: false,
                    }).start();
                  }
                  setTimeout(() => fitMapToRouteRef.current?.(), 100);
                }
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
  const driver = parcel?.assignedDriver ?? item?.assignedDriver;
  const status = parcel?.deliveryStatus ?? item?.deliveryStatus;
  const staticDriverCoords = {
    latitude: 33.95,
    longitude: 117.4028,
  };
  const DEFAULT_LAT = 28.6139;
  const DEFAULT_LNG = 77.209;
  const safeNum = (v: any, fallback: number) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const source = parcel ?? item;
  // API sometimes has Lat/Lon swapped (Lat holds longitude, Lon holds latitude). Match TripMap logic.
  const pickup = {
    latitude: safeNum(
      source?.pickupLocationLon ?? source?.pickupLon ?? source?.pickup_location_lon ?? source?.pickupLocationLat ?? source?.pickupLat,
      DEFAULT_LAT,
    ),
    longitude: safeNum(
      source?.pickupLocationLat ?? source?.pickupLat ?? source?.pickup_location_lat ?? source?.pickupLocationLon ?? source?.pickupLon,
      DEFAULT_LNG,
    ),
  };
  const dropoff = {
    latitude: safeNum(source?.dropLocationLat ?? source?.dropLat ?? source?.drop_location_lat, DEFAULT_LAT),
    longitude: safeNum(source?.dropLocationLon ?? source?.dropLon ?? source?.drop_location_lon, DEFAULT_LNG),
  };
  const distanceBetween = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ) => {
    const dLat = a?.latitude - b.latitude;
    const dLng = a.longitude - b.longitude;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };
  const MIN_ROUTE_DISTANCE_DEG = 0.0003;
  const [distance, setDistance] = useState(0);
  const [currentCoords, setCurrentCoords] = useState(() => ({
    latitude: safeNum(item?.pickupLocationLon ?? item?.pickupLon ?? item?.pickupLocationLat ?? item?.pickupLat, DEFAULT_LAT),
    longitude: safeNum(item?.pickupLocationLat ?? item?.pickupLat ?? item?.pickupLocationLon ?? item?.pickupLon, DEFAULT_LNG),
  }));
  const [driverLocation] = useState(
    () =>
      new AnimatedRegion({
        latitude: safeNum(item?.pickupLocationLon ?? item?.pickupLon ?? item?.pickupLocationLat ?? item?.pickupLat, DEFAULT_LAT),
        longitude: safeNum(item?.pickupLocationLat ?? item?.pickupLat ?? item?.pickupLocationLon ?? item?.pickupLon, DEFAULT_LNG),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }),
  );
  driverLocationRef.current = driverLocation;
  setCurrentCoordsRef.current = setCurrentCoords;
  const [eta, setEta] = useState("Calculating...");
  // Route bounds for initial region and auto-zoom
  const centerLat = (pickup.latitude + dropoff.latitude) / 2;
  const centerLng = (pickup.longitude + dropoff.longitude) / 2;
  const latSpan = Math.max(0.02, Math.abs(pickup.latitude - dropoff.latitude) * 1.5);
  const lngSpan = Math.max(0.02, Math.abs(pickup.longitude - dropoff.longitude) * 1.5);
  const initialRegion = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: Math.max(0.05, latSpan),
    longitudeDelta: Math.max(0.05, lngSpan),
  };
  const EDGE_PADDING = {
    top: 80,
    right: 50,
    bottom: PANEL_PEEK_HEIGHT + 60,
    left: 50,
  };
  const fitMapToRoute = useCallback(() => {
    const origin = currentCoords ?? pickup;
    const points = [origin, pickup, dropoff].filter(
      (p): p is { latitude: number; longitude: number } =>
        p != null && typeof p.latitude === "number" && typeof p.longitude === "number",
    );
    if (points.length < 2) return;
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: EDGE_PADDING,
      animated: true,
    });
  }, [
    currentCoords?.latitude,
    currentCoords?.longitude,
    pickup.latitude,
    pickup.longitude,
    dropoff.latitude,
    dropoff.longitude,
  ]);
  fitMapToRouteRef.current = fitMapToRoute;

  const mapRef = useRef<MapView>(null);
  const pan = useRef(new Animated.Value(PANEL_CLOSED_Y)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newY = PANEL_CLOSED_Y + gestureState.dy;
        if (newY > PANEL_OPEN_Y) pan.setValue(newY);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy < -50) {
          Animated.spring(pan, {
            toValue: PANEL_OPEN_Y,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: PANEL_CLOSED_Y,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  // When item/pickup is available, sync driver position to pickup so route draws correctly
  useEffect(() => {
    setCurrentCoords(pickup);
    (driverLocation as any).timing({
      ...pickup,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
      duration: 0,
      useNativeDriver: false,
    }).start();
  }, [pickup.latitude, pickup.longitude]);

  // Auto-zoom once on mount so route + all markers fit
  useEffect(() => {
    const t = setTimeout(() => fitMapToRoute(), 500);
    return () => clearTimeout(t);
  }, [fitMapToRoute]);

  useEffect(() => {
    if (!item?.trackingId) return;
    const socket = new WebSocket(`${WebSocket_Url}/${item.trackingId}`);
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.latitude != null && data?.longitude != null) {
          const newPoint = {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
          };
          setCurrentCoords(newPoint);
          (driverLocation as any)
            .timing({
              ...newPoint,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
              duration: 2000,
              useNativeDriver: false,
            })
            .start();
        }
      } catch (err) {
        console.log("Socket Error:", err);
      }
    };
    return () => socket.close();
  }, [item?.trackingId]);

  // Route for polyline: driver → pickup (or driver → dropoff). If origin ≈ destination, show full route pickup → dropoff so polyline always draws.
  const routeDestination =
    status === STATUS.ASSIGNED || status === STATUS.GOING_TO_PICKUP ? pickup : dropoff;
  const routeOriginRaw = currentCoords ?? pickup;
  const tooClose =
    distanceBetween(routeOriginRaw, routeDestination) < MIN_ROUTE_DISTANCE_DEG;
  const routeOrigin = tooClose ? pickup : routeOriginRaw;
  const routeDestForPolyline = tooClose ? dropoff : routeDestination;
  const isRouteToPickup =
    (status === STATUS.ASSIGNED || status === STATUS.GOING_TO_PICKUP) && !tooClose;
  // Polyline always visible: need distinct points (min distance)
  const routePointsValid =
    distanceBetween(routeOrigin, routeDestForPolyline) >= MIN_ROUTE_DISTANCE_DEG;
  const polylineStrokeColor = isRouteToPickup ? "#007AFF" : "#FFCC00";

  const [statusKey, setStatusKey] = useState<string | null>(null);

  useEffect(() => {
    const key = parcel?.deliveryStatus ?? item?.deliveryStatus ?? null;
    setStatusKey(key);
  }, [parcel?.deliveryStatus, item?.deliveryStatus]);
  useFocusEffect(
    useCallback(() => {
      getDetail(); // 👈 screen focus hote hi call hoga

      return () => {
        // optional cleanup (agar chahiye)
      };
    }, [parcel])
  );

  const isDelivered = (parcel?.deliveryStatus ?? item?.deliveryStatus) === "delivered" || (parcel?.deliveryStatus ?? item?.deliveryStatus) === STATUS.DELIVERED;
  useEffect(() => {
    if (isDelivered && !ratingSubmittedRef.current) {
      setShowRatingModal(true);
    }
  }, [isDelivered]);

  const handleRatingSubmit = useCallback(
    async (rating: number, comment: string) => {
      if (rating < 1) return;
      const parcelId = parcel?.id ?? item?.id;
      if (!parcelId) return;

      setRatingSubmitting(true);
      try {
        const res = await RateDeliveryApi({
          parcelId: Number(parcelId),
          rating: rating,
          review: comment
        });

        if (res?.status == 1 || res?.status == "1") {
          ratingSubmittedRef.current = true;
          setShowRatingModal(false);
          nav.goBack();
        }
      } catch (error) {
        console.error("Rating submission error:", error);
      } finally {
        setRatingSubmitting(false);
      }
    },
    [nav, parcel?.id, item?.id]
  );

  const closeRatingModal = useCallback(() => {
    setShowRatingModal(false);
    nav.goBack();
  }, [nav]);

  const statusNormKey = (statusKey ?? status ?? "").toLowerCase().trim();
  const statusLabel = STATUS_LABELS[statusNormKey] || "Unknown";
  const statusColor = STATUS_COLORS[statusNormKey] || "black";

  return (
    <View style={styles.container}>
      <RatingModal
        visible={showRatingModal}
        onClose={closeRatingModal}
        onSubmit={handleRatingSubmit}
        isSubmitting={ratingSubmitting}
      />
      <StatusBarComponent />

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          mapPadding={{ top: 60, right: 20, bottom: PANEL_PEEK_HEIGHT + 40, left: 20 }}
        >
          <Marker coordinate={pickup} title="Pickup">
            <View style={[styles.dotMarker, { backgroundColor: "#4CAF50" }]} />
          </Marker>
          <Marker coordinate={dropoff} title="Drop-off"

          >

            <View style={[styles.dotMarker, { backgroundColor: "#f55448ff" }]} />
          </Marker>

          <Marker.Animated
            key="driver-marker"
            coordinate={driverLocation as any}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <Image source={imageIndex.caricon} style={styles.courierImage} />
          </Marker.Animated>

          {/* Polyline fallback: shows immediately so route is always visible */}
          {routePointsValid && (
            <Polyline
              coordinates={[routeOrigin, routeDestForPolyline]}
              strokeColor={polylineStrokeColor}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* MapViewDirections: road-following route (overlays polyline when loaded) */}
          {routePointsValid && (
            <MapViewDirections
              key={`route-${status}-${routeOrigin.latitude.toFixed(5)}-${routeOrigin.longitude.toFixed(5)}-${routeDestForPolyline.latitude.toFixed(5)}-${routeDestForPolyline.longitude.toFixed(5)}`}
              origin={routeOrigin}
              destination={routeDestForPolyline}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor={polylineStrokeColor}
              lineCap="round"
              lineJoin="round"
              precision="high"
              onReady={(res) => {
                setDistance(res?.distance ?? 0);
                setEta(`${Math.ceil(res?.duration ?? 0)} mins`);
                fitMapToRoute();
              }}
              onError={(err) => {
                console.warn("MapViewDirections error:", err);
                setEta("—");
              }}
            />
          )}
        </MapView>
      </View>

      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <CustomHeader label="" />
      </SafeAreaView>

      {/* Rapido-style bottom sheet */}
      <View style={[styles.draggablePanel,]}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Rapido-style ETA strip: X mins • Y km */}
          {/* {routePointsValid && (
            <View style={styles.etaStrip}>
              <Text style={styles.etaStripText}>{eta}</Text>
              <Text style={styles.etaStripDot}>•</Text>
              <Text style={styles.etaStripDistance}>{(distance != null ? distance.toFixed(1) : "—")} km</Text>
            </View>
          )} */}
          {/* <View style={styles.driverSection}>
            {driver?.image ? (
              <Image source={{ uri: driver?.image }} style={styles.avatar} />
            ) : (
              <Image source={imageIndex.dpuser} style={styles.avatar} />
            )}

            <View style={[styles.driverInfo,]}>
              <Text style={[styles.driverName, {
                flex: 1
              }]} numberOfLines={1}>
                {driver?.name || "Assigning driver..."}
              </Text>
              <Text style={[styles.driverName, {
                flex: 1
              }]}
                numberOfLines={1}
              >
                {item?.trackingId || ""}
              </Text>

              <Text
                style={[

                  {
                    textTransform: "capitalize",
                    fontSize: 15,
                    fontFamily: font.TrialMedium,
                    color: statusColor

                  },
                ]}
              >
                {statusLabel}
              </Text>
              {driver?.vehicle?.vehicleType || driver?.vehicle?.vehicleNumber &&

                <Text style={styles.vehicleInfo} numberOfLines={1}>
                  {driver?.vehicle?.vehicleType}   {driver?.vehicle?.vehicleNumber || ""}
                </Text>
              }

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.btnCall}
                  onPress={() => Linking.openURL(`tel:${driver?.phone}`)}
                >
                  <Image source={imageIndex.Calls} style={styles.iconBtn} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnChat}
                  onPress={() => {
                    nav.navigate(ScreenNameEnum.ChatScreen, {
                      item: parcel,
                    })
                  }}
                >
                  <Image source={imageIndex.messtrcker} style={styles.iconBtn} />
                </TouchableOpacity>
              </View>
            </View>
            {isDelivered ? (
              <TouchableOpacity
                style={styles.rateDeliveryButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Text style={styles.rateDeliveryButtonText}>Rate delivery</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>OTP</Text>
                <Text style={styles.otpValue}>
                  {(parcel?.deliveryStatus ?? item?.deliveryStatus) === STATUS.ASSIGNED ||
                    (parcel?.deliveryStatus ?? item?.deliveryStatus) === STATUS.GOING_TO_PICKUP
                    ? (parcel?.pickupOtp ?? item?.pickupOtp ?? "—")
                    : (parcel?.deliveryOtp ?? item?.deliveryOtp ?? "—")}
                </Text>
              </View>
            )}

          </View> */}
          <View style={styles.driverSection}>
            {/* Driver Image */}
            <Image
              source={
                driver?.image
                  ? { uri: driver.image }
                  : imageIndex.dpuser
              }
              style={styles.avatar}
            />

            <View style={styles.driverInfo}>

              {/* Driver Name */}
              <Text style={styles.driverName} numberOfLines={1}>
                {driver?.name || "Assigning driver..."}
              </Text>

              {/* Tracking ID */}
              <Text style={styles.driverName} numberOfLines={1}>
                {item?.trackingId || ""}
              </Text>

              {/* Status */}
              <Text
                style={{
                  textTransform: "capitalize",
                  fontSize: 15,
                  fontFamily: font.TrialMedium,
                  color: statusColor,
                }}
              >
                {statusLabel}
              </Text>

              {/* Vehicle Info (FIXED CONDITION) */}
              {(driver?.vehicle?.vehicleType || driver?.vehicle?.vehicleNumber) && (
                <Text style={styles.vehicleInfo} numberOfLines={1}>
                  {driver?.vehicle?.vehicleType || ""}
                  {" "}
                  {driver?.vehicle?.vehicleNumber || ""}
                </Text>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>

                {/* Call Button */}
                <TouchableOpacity
                  style={styles.btnCall}
                  onPress={() => {
                    if (driver?.phone) {
                      Linking.openURL(`tel:${driver.phone}`);
                    }
                  }}
                >
                  <Image source={imageIndex.Calls} style={styles.iconBtn} />
                </TouchableOpacity>

                {/* Chat Button */}
                <TouchableOpacity
                  style={styles.btnChat}
                  onPress={() => {
                    if (parcel) {
                      nav.navigate(ScreenNameEnum.ChatScreen, {
                        item: parcel,
                      });
                    }
                  }}
                >
                  <Image source={imageIndex.messtrcker} style={styles.iconBtn} />
                </TouchableOpacity>

              </View>
            </View>

            {/* Right Side Section */}
            {isDelivered ? (
              <TouchableOpacity
                style={styles.rateDeliveryButton}
                onPress={() => setShowRatingModal(true)}
              >
                <Text style={styles.rateDeliveryButtonText}>
                  {strings.RateDelivery}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>{strings?.OTP}</Text>

                <Text style={styles.otpValue}>
                  {(() => {
                    const status =
                      parcel?.deliveryStatus ?? item?.deliveryStatus;

                    if (
                      status === STATUS.ASSIGNED ||
                      status === STATUS.GOING_TO_PICKUP
                    ) {
                      return parcel?.pickupOtp ?? item?.pickupOtp ?? "—";
                    }

                    return parcel?.deliveryOtp ?? item?.deliveryOtp ?? "—";
                  })()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.parcelCard}>
            <Text style={styles.sectionTitle}>{strings?.ParcelDetails}</Text>
            <View style={styles.grid}>
              <StatBox label={strings?.Size} value={item?.packageSize ?? ""} />
              <StatBox label={strings?.Type} value={item?.consignmentType ?? ""} />
              <StatBox label={strings?.Service} value={item?.deliveryType ?? ""} />
            </View>
          </View>

          {/* From / To - Rapido style */}
          <View style={styles.addressBox}>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <View style={[styles.addressDot, { backgroundColor: "#22C55E" }]} />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>{strings?.Pickup}</Text>
                <Text style={styles.addressText} numberOfLines={2}>{item?.pickupLocation ?? ""}</Text>
              </View>
            </View>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <View style={[styles.addressDot, { backgroundColor: "#EF4444" }]} />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>{strings?.Drop}</Text>
                <Text style={styles.addressText} numberOfLines={2}>{item?.dropLocation ?? ""}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const StatBox = ({ label, value }: any) => (
  <View style={styles.gridItem}>
    <Text style={styles.gridLabel}>{label}</Text>
    <Text style={styles.gridValue}>{value}</Text>
  </View>
);

export default CourierTrackingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  mapWrap: { flex: 1, width: "100%", minHeight: height * 0.5 },
  map: { ...StyleSheet.absoluteFillObject },
  headerOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5 },
  dotMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: "#FFF",
    ...Platform.select({ android: { elevation: 4 }, ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 } }),
  },
  courierMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F59E0B",
    ...Platform.select({ android: { elevation: 6 }, ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 } }),
  },
  courierImage: { width: 26, height: 26, resizeMode: "contain" },
  draggablePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === "ios" ? 0 : 0,
    ...Platform.select({
      android: { elevation: 24 },
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 16 },
    }),
  },
  dragArea: { width: "100%", paddingVertical: 10, alignItems: "center" },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  scrollContent: { flex: 1 },
  scrollContentContainer: { paddingHorizontal: 20, paddingBottom: 32 },
  etaStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  etaStripText: { fontSize: 16, fontFamily: font.MonolithRegular, color: "#B45309" },
  etaStripDot: { fontSize: 14, fontFamily: font.MonolithRegular, color: "#D1D5DB", marginHorizontal: 8 },
  etaStripDistance: { fontSize: 14, fontFamily: font.MonolithRegular, color: "#6B7280" },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: "#E5E7EB",
  },
  driverInfo: { flex: 1, minWidth: 0 },
  driverName: { fontSize: 17, fontFamily: font.MonolithRegular, color: "#111827" },
  vehicleInfo: { fontSize: 13, color: "#6B7280", fontFamily: font.MonolithRegular, marginTop: 2 },
  actionButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  btnCall: {

  },
  btnChat: {

  },
  iconBtn: { width: 45, height: 45, resizeMode: "contain" },
  otpContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFCC00",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBEB",
    minWidth: 72,
  },
  otpLabel: { fontSize: 9, color: "#92400E", fontFamily: font.MonolithRegular, textTransform: "uppercase", marginBottom: 2 },
  otpValue: { fontSize: 16, fontFamily: font.MonolithRegular, color: "#111827", letterSpacing: 2 },
  rateDeliveryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFCC00",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFBEB",
    minWidth: 72,
  },
  rateDeliveryButtonText: { fontSize: 12, fontFamily: font.MonolithRegular, color: "#92400E" },
  sectionTitle: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
    fontFamily: font.MonolithRegular,

  },
  grid: { flexDirection: "row", gap: 10 },
  gridItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  gridLabel: { fontSize: 10, color: "#6B7280", fontFamily: font.MonolithRegular, marginBottom: 4 },
  gridValue: { fontSize: 12, fontFamily: font.MonolithRegular, color: "#111827" },
  parcelCard: { marginTop: 18 },
  addressBox: {
    marginTop: 18,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIconWrap: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
    paddingTop: 2,
  },
  addressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addressTextContainer: { flex: 1 },
  addressLabel: {
    fontSize: 10,
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: font.MonolithRegular

  },
  addressText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    fontFamily: font.MonolithRegular,
  },
  vLineContainer: {
    marginLeft: 5,
    height: 16,
    width: 2,
    borderLeftWidth: 2,
    borderLeftColor: "#D1D5DB",
    borderStyle: "dashed",
  },
});
