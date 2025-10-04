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
import MapView, { Marker } from "react-native-maps";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

const CourierTrackingScreen = () => {
  const nav = useNavigation();

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
    const phoneNumber = "tel:+911234567890"; // <- yaha apna courier ka number daalna
    Linking.openURL(phoneNumber).catch((err) =>
      console.log("Error opening dialer:", err)
    );
  };

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
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude: 28.6139, longitude: 77.209 }}
          title="Courier"
          description="Courier Location"
        />
      </MapView>

      {/* Bottom Info Section */}
      <View style={styles.bottomCard}>
        <Text style={[styles.packageTitle, { color: "black" }]}>
          Package Information
        </Text>

        <View
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
        </View>

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
    elevation: 5,
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
