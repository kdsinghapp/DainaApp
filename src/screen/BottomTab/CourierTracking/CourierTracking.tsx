 
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
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { GOOGLE_MAPS_APIKEY, WebSocket_Url } from "../../../Api";
import { STATUS } from "../../../utils/Constant";

const { width, height } = Dimensions.get("window");
const PANEL_PEEK_HEIGHT = 280;
const PANEL_OPEN_Y = height * 0.3;
const PANEL_CLOSED_Y = height - PANEL_PEEK_HEIGHT;

const CourierTrackingScreen = () => {
  const nav = useNavigation();
  const rou: any = useRoute();
  const { item } = rou.params || {};
  const driver = item?.assignedDriver;
  const status = item?.deliveryStatus;
  // 1. Static driver coords only used when no item coords (fallback)
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
  // Pickup: API sends lat→Lon and lon→Lat (see apiRequest), so read swapped. Dropoff is correct.
  const pickup = {
    latitude: safeNum(item?.pickupLocationLon, DEFAULT_LAT),
    longitude: safeNum(item?.pickupLocationLat, DEFAULT_LNG),
  };
  const dropoff = {
    latitude: safeNum(item?.dropLocationLat, DEFAULT_LAT),
    longitude: safeNum(item?.dropLocationLon, DEFAULT_LNG),
  };

  const distanceBetween = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ) => {
    const dLat = a.latitude - b.latitude;
    const dLng = a.longitude - b.longitude;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };
  const MIN_ROUTE_DISTANCE_DEG = 0.0003;

  const [distance, setDistance] = useState(0);
  const [currentCoords, setCurrentCoords] = useState(() => ({
    latitude: safeNum(item?.pickupLocationLon, DEFAULT_LAT),
    longitude: safeNum(item?.pickupLocationLat, DEFAULT_LNG),
  }));
  const [driverLocation] = useState(
    () =>
      new AnimatedRegion({
        latitude: safeNum(item?.pickupLocationLon, DEFAULT_LAT),
        longitude: safeNum(item?.pickupLocationLat, DEFAULT_LNG),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }),
  );
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
    driverLocation.timing({ ...pickup, duration: 0, useNativeDriver: false }).start();
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
          driverLocation
            .timing({ ...newPoint, duration: 2000, useNativeDriver: false })
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

  return (
    <View style={styles.container}>
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
          {/* <View style={styles.courierMarker}> */}
            <Image source={imageIndex.caricon} style={styles.courierImage} />
          {/* </View> */}
        </Marker.Animated>

        {/* Route polyline: always use two distinct points so the line is drawn (fallback: full route when driver at same point as destination) */}
        <MapViewDirections
          key={`route-${status}-${routeOrigin.latitude.toFixed(5)}-${routeOrigin.longitude.toFixed(5)}-${routeDestForPolyline.latitude.toFixed(5)}-${routeDestForPolyline.longitude.toFixed(5)}`}
          origin={routeOrigin}
          destination={routeDestForPolyline}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={6}
          strokeColor={isRouteToPickup ? "#007AFF" : "#FFCC00"}
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
        </MapView>
      </View>

      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <CustomHeader label="" />
      </SafeAreaView>

      {/* Rapido-style bottom sheet */}
      <Animated.View style={[styles.draggablePanel, { top: pan }]}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handleBar} />
        </View>

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
         
          <View style={styles.driverSection}>
            <Image source={{ uri: driver?.image }} style={styles.avatar} />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName} numberOfLines={1}>
                {driver?.name || "Assigning driver..."}
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
                  onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}
                >
                  <Image source={imageIndex.messtrcker} style={styles.iconBtn} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>OTP</Text>
              <Text style={styles.otpValue}>
                {item?.deliveryStatus === STATUS.ASSIGNED ||
                item?.deliveryStatus === STATUS.GOING_TO_PICKUP
                  ? item?.pickupOtp ?? "—"
                  : item?.deliveryOtp ?? "—"}
              </Text>
            </View>
          </View>

          {/* Parcel details - compact card */}
          <View style={styles.parcelCard}>
            <Text style={styles.sectionTitle}>Parcel details</Text>
            <View style={styles.grid}>
              <StatBox label="Size" value={item?.packageSize ?? "—"} />
              <StatBox label="Type" value={item?.consignmentType ?? "—"} />
              <StatBox label="Service" value={item?.deliveryType ?? "—"} />
            </View>
          </View>

          {/* From / To - Rapido style */}
          <View style={styles.addressBox}>
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <View style={[styles.addressDot, { backgroundColor: "#22C55E" }]} />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>PICKUP</Text>
                <Text style={styles.addressText} numberOfLines={2}>{item?.pickupLocation ?? "—"}</Text>
              </View>
            </View>
            <View style={styles.vLineContainer} />
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <View style={[styles.addressDot, { backgroundColor: "#EF4444" }]} />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>DROP</Text>
                <Text style={styles.addressText} numberOfLines={2}>{item?.dropLocation ?? "—"}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
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
  etaStripText: { fontSize: 16, fontWeight: "700", color: "#B45309" },
  etaStripDot: { fontSize: 14, color: "#D1D5DB", marginHorizontal: 8 },
  etaStripDistance: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
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
  driverName: { fontSize: 17, fontWeight: "700", color: "#111827" },
  vehicleInfo: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  actionButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  btnCall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  btnChat: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: { width: 20, height: 20, resizeMode: "contain" },
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
  otpLabel: { fontSize: 9, color: "#92400E", fontWeight: "700", textTransform: "uppercase", marginBottom: 2 },
  otpValue: { fontSize: 16, fontWeight: "800", color: "#111827", letterSpacing: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
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
  gridLabel: { fontSize: 10, color: "#6B7280", marginBottom: 4 },
  gridValue: { fontSize: 12, fontWeight: "600", color: "#111827" },
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
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
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
