import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps"; // <-- Added Polyline
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

const CourierTrackingScreen = () => {
  const nav = useNavigation();
  const rou: any = useRoute();
  const { item } = rou.params || "";
  console.log("item", item);

  // Animation ref
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  // Call function
  const handleCall = () => {
    const phoneNumber = "tel:+911234567890"; // Courier number
    Linking.openURL(phoneNumber).catch((err) =>
      console.log("Error opening dialer:", err)
    );
  };

  // Example route coordinates (replace with API data)
  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.209 }, // start
    { latitude: 28.617, longitude: 77.215 }, // mid
    { latitude: 28.620, longitude: 77.220 }, // end
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label={"Track Courier"} />

      {/* Map Section */}
  <MapView
  style={styles.map}
  initialRegion={{
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }}
>
  {/* Start Marker */}
  <Marker
    coordinate={{ latitude: 28.6139, longitude: 77.209 }}
    title="Courier Start"
    description="Courier Start Location"
  >
    <Image
      source={imageIndex.Location} // your custom image
      style={{ width: 40, height: 40 }} // size of marker
      resizeMode="contain"
    />
  </Marker>

  {/* End Marker */}
  <Marker
    coordinate={{ latitude: 28.620, longitude: 77.220 }}
    title="Courier End"
    description="Courier Destination"
  >
    <Image
      source={imageIndex.deliver} // you can use a different image if needed
      style={{ width: 40, height: 40 }}
      resizeMode="contain"
    />
  </Marker>

  {/* Polyline */}
  <Polyline
    coordinates={routeCoordinates}
    strokeColor="#FFF7D9"
    strokeWidth={4}
  />
</MapView>


      {/* Bottom Info Section */}
      <View style={styles.bottomCard}>
        <Text style={[styles.packageTitle, { color: "black" }]}>
          Package Information
        </Text>

        {/* <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 15,
          }}
        >
          <Text style={[styles.packageTitle, { color: "#878787" }]}>
            Delivery Type
          </Text>
          <Text style={[styles.packageTitle, { color: "#878787" }]}>
            Package Weight
          </Text>
        </View> */}

        <View
          style={{
            borderColor: "#EDEFEE",
            borderWidth: 0.5,
            marginTop: 20,
          }}
        />

        <View style={styles.packageRow}>
          <View>
            <Text style={styles.deliveryType}>Express Delivery</Text>
          </View>
          <Text style={styles.packageWeight}>4 Kg</Text>
        </View>

        {/* Courier Info */}
        <View style={styles.courierCard}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/41.jpg",
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.courierName}>Marcus Aminoff</Text>
            <Text style={styles.courierRole}>Experienced Courier</Text>
          </View>

          <View style={styles.actions}>
            {/* CALL BUTTON with animation */}
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Animated.Image
                source={imageIndex.Calls}
                style={{
                  height: 41,
                  width: 41,
                  transform: [{ scale: scaleAnim }],
                }}
              />
            </TouchableOpacity>

            {/* CHAT BUTTON */}
            <TouchableOpacity
              onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}
              style={styles.actionButton}
            >
              <Image
                source={imageIndex.messtrcker}
                style={{
                  height: 41,
                  width: 41,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CourierTrackingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  bottomCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  packageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 12,
  },
  packageTitle: {
    fontSize: 14,
    color: "#555",
    fontFamily: font.MonolithRegular,
  },
  deliveryType: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    marginTop: 3,
  },
  packageWeight: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: "#333",
  },
  courierCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7D9",
    borderRadius: 15,
    padding: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  courierName: { fontSize: 16, fontFamily: font.MonolithRegular },
  courierRole: {
    fontSize: 13,
    color: "#FFCC00",
    fontFamily: font.MonolithRegular,
    marginTop: 11,
  },
  actions: { flexDirection: "row", gap: 10 },
  actionButton: { justifyContent: "center", alignItems: "center" },
});
