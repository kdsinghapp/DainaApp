import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Platform, PermissionsAndroid, Modal, View, Text, StyleSheet, TouchableOpacity, Linking, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import font from './theme/font';

const CurrentLocation = forwardRef(({ onLocationFetched }, ref) => {
  const GOOGLE_API_KEY = "AIzaSyDgFGS91BvviXh_f-nmvtEggUHJcaGyUwA";

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkPermissionSilent();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkPermissionSilent = async () => {
    const permission = Platform.OS === 'android'
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

    const status = await check(permission);
    if (status === RESULTS.GRANTED) {
      setShowPermissionModal(false);
    }
  };

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (status === RESULTS.GRANTED) return true;

      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (result === RESULTS.GRANTED) {
        setShowPermissionModal(false);
        return true;
      }
      setShowPermissionModal(true);
      return false;
    } else {
      const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (status === RESULTS.GRANTED) return true;

      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result === RESULTS.GRANTED) {
        setShowPermissionModal(false);
        return true;
      }
      setShowPermissionModal(true);
      return false;
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK') {
        const formattedAddress = data.results[0].formatted_address;
        if (onLocationFetched) {
          onLocationFetched({
            latitude: lat,
            longitude: lng,
            address: formattedAddress,
          });
        }
        return { latitude: lat, longitude: lng, address: formattedAddress };
      } else {
        return { error: 'Address not found' };
      }
    } catch (error) {
      console.log("Geocode error:", error);
      return { error: 'Failed to fetch address' };
    }
  };

  const fetchLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      return { error: 'Permission denied' };
    }

    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await getAddressFromCoords(latitude, longitude);
          resolve(result);
        },
        (error) => {
          console.log("Location error:", error);
          resolve({ error: error.message });
        },
        { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
      );

    });
  };

  useImperativeHandle(ref, () => ({
    fetchLocation,
  }));

  return (
    <Modal
      visible={showPermissionModal}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="map-marker-radius" size={50} color="#FFCC00" />
          </View>
          <Text style={styles.title}>Location Permission Required</Text>
          <Text style={styles.message}>
            This app requires location access to provide accurate delivery services and show nearby orders. Please enable location in settings.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.settingsButton]}
              onPress={() => Linking.openSettings()}
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={async () => {
                const granted = await requestPermission();
                if (granted) {
                  setShowPermissionModal(false);
                  fetchLocation();
                }
              }}
            >
              <Text style={[styles.buttonText, { color: '#000' }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFBEA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: font.MonolithRegular
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    backgroundColor: '#000',
  },
  retryButton: {
    backgroundColor: '#FFCC00',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: font.MonolithRegular
  },
});

export default CurrentLocation;
