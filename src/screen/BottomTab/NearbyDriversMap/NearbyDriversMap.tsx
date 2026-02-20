import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Circle, Callout } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import imageIndex from "../../../assets/imageIndex";
import CustomButton from "../../../compoent/CustomButton";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { Text } from "react-native";
import font from "../../../theme/font";
import { color } from "../../../constant";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
const DEFAULT_LAT = 28.9008;
const DEFAULT_LON = 77.209;

interface Driver {
  driverId: number;
  lat: number;
  lon: number;
  name?: string;
  status?: string;
}

interface Order {
  orderId: number;
  lat: number;
  lon: number;
  address: string;
  status?: string;
}

const NearbyDriversMap: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  }>({
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
  });
  const [searchRadius, setSearchRadius] = useState<number>(1);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStats, setShowStats] = useState<boolean>(true);
  
  const route = useRoute();
  const { parcelId, pickupLocation } = route.params || {};

  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for user location
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    getUserLocation();
    fetchNearbyDrivers();
    fetchNearbyOrders();
  }, [searchRadius]);

  const getUserLocation = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            "Location Access Required",
            "Please enable location to find nearby drivers",
            [{ text: "OK" }]
          );
          return;
        }
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(newLocation);
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: newLocation.lat,
                longitude: newLocation.lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              },
              1000
            );
          }
        },
        (error) => {
          console.log("GEO ERROR:", error);
          Alert.alert("Location Error", "Unable to get your location. Using default.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const fetchNearbyDrivers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://aitechnotech.in/DAINA/nearby?lat=${userLocation.lat}&lon=${userLocation.lon}`,
        {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        }
      );
      const json = await response.json();
      if (json?.drivers && Array.isArray(json.drivers)) {
        setDrivers(json.drivers);
      } else {
        setDrivers([]);
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `https://aitechnotech.in/DAINA/nearby-orders?lat=${userLocation.lat}&lon=${userLocation.lon}&radius=${searchRadius}`,
        {
          method: "GET",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        }
      );
      const json = await response.json();
      if (json?.orders && Array.isArray(json.orders)) {
        setOrders(json.orders);
        if (json.orders.length === 0 && searchRadius < 3) {
          Alert.alert(
            "No Orders Nearby",
            `No orders found within ${searchRadius}km. Expand search to ${searchRadius + 1}km?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Expand",
                onPress: () => setSearchRadius(searchRadius + 1),
                style: "default",
              },
            ]
          );
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("FETCH ORDERS ERROR:", error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const increaseRadius = () => {
    if (searchRadius < 3) {
      setSearchRadius(searchRadius + 1);
    } else {
      Alert.alert("Maximum Reached", "Search radius is already at 3km maximum");
    }
  };

  const decreaseRadius = () => {
    if (searchRadius > 1) {
      setSearchRadius(searchRadius - 1);
    }
  };

  const centerOnUser = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  const navgatoon = useNavigation();

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* ================= MAP ================= */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.lat,
          longitude: userLocation.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* Search Radius Circle */}
        <Circle
          center={{
            latitude: userLocation.lat,
            longitude: userLocation.lon,
          }}
          radius={searchRadius * 1000}
          fillColor="rgba(0, 122, 255, 0.08)"
          strokeColor="rgba(0, 122, 255, 0.4)"
          strokeWidth={2}
        />

        {/* User Location Marker with Pulse */}
        <Marker
          coordinate={{
            latitude: userLocation.lat,
            longitude: userLocation.lon,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <Animated.View style={[styles.userMarkerContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner}>
                <View style={styles.userMarkerDot} />
              </View>
            </View>
          </Animated.View>
        </Marker>

        {/* Order Markers */}
        {orders.map((order) => (
          <Marker
            key={`order-${order.orderId}`}
            coordinate={{
              latitude: Number(order.lat),
              longitude: Number(order.lon),
            }}
            onPress={() => setSelectedOrder(order)}
          >
            <View style={styles.orderMarkerContainer}>
              <View style={styles.orderMarker}>
                <Text style={styles.orderIcon}>📦</Text>
              </View>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>#{order.orderId}</Text>
              </View>
            </View>
          </Marker>
        ))}

        {/* Driver Markers */}
        {drivers.map((driver) => (
          <Marker
            key={`driver-${driver.driverId}`}
            coordinate={{
              latitude: Number(driver.lat),
              longitude: Number(driver.lon),
            }}
          >
            <View style={styles.driverMarkerContainer}>
              <View style={styles.driverPulse} />
              <View style={styles.driverMarker}>
                <Image
                  source={imageIndex.cars}
                  style={styles.carIcon}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* ================= TOP STATS CARD ================= */}
      <Animated.View 
        style={[
          styles.statsCard,
          { opacity: fadeAnim, transform: [{ translateY: Animated.multiply(fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0]
          }), -50) }] }
        ]}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#34C759' }]}>
              <Text style={styles.statEmoji}>🚗</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{drivers.length}</Text>
              <Text style={styles.statLabel}>Drivers</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9500' }]}>
              <Text style={styles.statEmoji}>📦</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.statEmoji}>📍</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{searchRadius}km</Text>
              <Text style={styles.statLabel}>Radius</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ================= RADIUS CONTROL ================= */}
      <Animated.View 
        style={[
          styles.radiusControl,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.radiusLabel}>Search Range</Text>
        <View style={styles.radiusButtons}>
          <TouchableOpacity
            style={[styles.radiusButton, searchRadius <= 1 && styles.disabledButton]}
            onPress={decreaseRadius}
            disabled={searchRadius <= 1}
            activeOpacity={0.7}
          >
            <Text style={styles.radiusButtonText}>−</Text>
          </TouchableOpacity>
          
          <View style={styles.radiusDisplay}>
            <Text style={styles.radiusValue}>{searchRadius}</Text>
            <Text style={styles.radiusUnit}>km</Text>
          </View>

          <TouchableOpacity
            style={[styles.radiusButton, searchRadius >= 3 && styles.disabledButton]}
            onPress={increaseRadius}
            disabled={searchRadius >= 3}
            activeOpacity={0.7}
          >
            <Text style={styles.radiusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ================= CENTER BUTTON ================= */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerOnUser}
        activeOpacity={0.8}
      >
        <Text style={styles.centerButtonIcon}>🎯</Text>
      </TouchableOpacity>

      {/* ================= REFRESH BUTTON ================= */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => {
          fetchNearbyDrivers();
          fetchNearbyOrders();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.refreshButtonIcon}>🔄</Text>
      </TouchableOpacity>

      {/* ================= SELECTED ORDER DETAILS ================= */}
      {selectedOrder && (
        <Animated.View 
          style={[
            styles.orderDetailsCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.orderDetailsHeader}>
            <View style={styles.orderDetailsTitle}>
              <Text style={styles.orderDetailsIcon}>📦</Text>
              <Text style={styles.orderDetailsText}>Order #{selectedOrder.orderId}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeOrderButton}
              onPress={() => setSelectedOrder(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeOrderIcon}>✕</Text>1
            </TouchableOpacity>
          </View>
          <View style={styles.orderDetailsBody}>
            <Text style={styles.orderAddressLabel}>Delivery Address</Text>
            <Text style={styles.orderAddressText}>{selectedOrder.address}</Text>
          </View>
          <View style={styles.orderDetailsFooter}>
            <View style={styles.orderStatusBadge}>
              <Text style={styles.orderStatusText}>
                {selectedOrder.status || 'Pending'}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* ================= BOTTOM CARD ================= */}
      <Animated.View 
        style={[
          styles.bottomCard,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.bottomCardHeader}>
          <View style={styles.pickupInfo}>
            <View style={styles.pickupIconContainer}>
              <Text style={styles.pickupIcon}>📍</Text>
            </View>
            <View style={styles.pickupTextContainer}>
              <Text style={styles.pickupLabel}>Pickup Location</Text>
              <Text style={styles.pickupAddress} numberOfLines={2}>
                {pickupLocation || "Sapphire House, Indore"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <CustomButton
          title="Book Parcel Delivery"
          onPress={() => {
            if (!parcelId) {
              Alert.alert("Error", "Parcel ID is missing. Please try again.");
              return;
            }
            navgatoon.replace(ScreenNameEnum.RequestLoading, {
              parcelId: parcelId,
            });
          }}
        />
      </Animated.View>

      {/* ================= LOADING INDICATORS ================= */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Finding nearby drivers...</Text>
          </View>
        </View>
      )}

      {isLoadingOrders && (
        <View style={styles.ordersLoadingBadge}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.ordersLoadingText}>Loading orders...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NearbyDriversMap;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  map: {
    flex: 1,
  },

  // Stats Card
  statsCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statEmoji: {
    fontSize: 18,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
  },

  // Radius Control
  radiusControl: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  radiusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 12,
    textAlign: 'center',
  },
  radiusButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
  },
  radiusButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  radiusDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
  },
  radiusValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  radiusUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 4,
  },

  // User Marker
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  userMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },

  // Driver Marker
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  driverMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  carIcon: {
    width: 20,
    height: 20,
    tintColor: '#34C759',
  },

  // Order Marker
  orderMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF9500',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  orderIcon: {
    fontSize: 20,
  },
  orderBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Floating Buttons
  centerButton: {
    position: 'absolute',
    right: 20,
    bottom: 220,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  centerButtonIcon: {
    fontSize: 24,
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 160,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  refreshButtonIcon: {
    fontSize: 24,
  },

  // Order Details Card
  orderDetailsCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 240 : 220,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  orderDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F5F5F7',
  },
  orderDetailsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetailsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  orderDetailsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  closeOrderButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeOrderIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderDetailsBody: {
    padding: 16,
  },
  orderAddressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  orderAddressText: {
    fontSize: 15,
    color: '#1D1D1F',
    lineHeight: 22,
  },
  orderDetailsFooter: {
    padding: 16,
    paddingTop: 0,
  },
  orderStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Bottom Card
  bottomCard: {
    // position: 'absolute',
    // bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomCardHeader: {
    marginBottom: 16,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    fontSize: 22,
  },
  pickupTextContainer: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  pickupAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },

  // Loading States
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  ordersLoadingBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 230 : 210,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ordersLoadingText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
});