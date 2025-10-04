import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Animated,
  Easing,
} from "react-native";
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings, 
} from "react-native-permissions";
import imageIndex from "../assets/imageIndex";
import font from "../theme/font";

const LocationPermissionModal = ({ visible, onClose, onLocationGranted }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // initial scale = 1

  useEffect(() => {
    // Create a looping bounce/pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const requestLocationPermission = async () => {
    try {
      let result;
      if (Platform.OS === "android") {
        result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      } else {
        result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      }

      if (result === RESULTS.GRANTED) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("User Location: ", position);
            onLocationGranted(position);
            onClose();
          },
          (error) => {
            console.log("Error getting location:", error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else if (result === RESULTS.DENIED) {
        console.log("Permission denied by user");
      } else if (result === RESULTS.BLOCKED) {
        openSettings();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconWrapper}>
            <Animated.Image
              source={imageIndex.Location}
              style={{
                height: 138,
                width: 138,
                transform: [{ scale: scaleAnim }], // apply animation
              }}
            />
          </View>

          <Text style={styles.title}>Enable your location</Text>
          <Text style={styles.subtitle}>
            Choose your location to find the requests around you
          </Text>

          <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
            <Text style={styles.buttonText}>Use my location</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default LocationPermissionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    width: "80%",
  },
  iconWrapper: {
    padding: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: font.MonolithRegular,
    marginBottom: 10,
    textAlign: "center",
    color: "black",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    fontFamily:font.MonolithRegular
  },
  button: {
    backgroundColor: "#FFCC00",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 15,
    width: "100%",
    justifyContent: "center",
    height: 54,
  },
  buttonText: {
    color: "#000",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
    
  },
  skipText: {
    color: "#B8B8B8",
    fontFamily: font.MonolithRegular,
    fontSize: 16,
    fontFamily:font.MonolithRegular
  },
});
