import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Alert,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Circle,
} from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LoadingModal from '../../../utils/Loader';
import CustomButton from '../../../compoent/CustomButton';
import font from '../../../theme/font';
import CustomHeader from '../../../compoent/CustomHeader';
import imageIndex from '../../../assets/imageIndex';

/* ================= GOOGLE API ================= */

const GOOGLE_API_KEY = 'AIzaSyDgFGS91BvviXh_f-nmvtEggUHJcaGyUwA';
Geocoder.init(GOOGLE_API_KEY);

/* ================= LOCATION HELPER ================= */

const CurrentLocation = forwardRef((props, ref) => {
  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchLocation = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return { error: 'Permission denied' };

    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        async pos => {
          const { latitude, longitude } = pos.coords;
          try {
            const geo = await Geocoder.from(latitude, longitude);
            resolve({
              latitude,
              longitude,
              address: geo.results[0]?.formatted_address || '',
            });
          } catch {
            resolve({ latitude, longitude, address: '' });
          }
        },
        err => resolve({ error: err.message }),
        { enableHighAccuracy: true, timeout: 15000 },
      );
    });
  };

  useImperativeHandle(ref, () => ({ fetchLocation }));
  return null;
});

/* ================= MAIN SCREEN ================= */

const PickupLocationRapido = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const locationRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 22.7005687,
    longitude: 75.8628066,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ================= AUTO FETCH ================= */

  useEffect(() => {
    handleGetLocation();
  }, []);

  const handleGetLocation = async () => {
    setIsLoading(true);
    const data = await locationRef.current.fetchLocation();
    setIsLoading(false);

    // if (data?.error) {
    //   Alert.alert('Location Error', data.error);
    //   return;
    // }

    const newRegion = {
      latitude: data.latitude ||  "22.7005687",
      longitude: data.longitude ||"75.8628066",
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setCurrentLocation({
      latitude: data.latitude ||  "22.7005687",
      longitude: data.longitude  ||"75.8628066",
    });

    setRegion(newRegion);
    setAddress(data.address);

    mapRef.current?.animateToRegion(newRegion, 800);
  };

  /* ================= CONFIRM ================= */

  const confirmLocation = async () => {
    await AsyncStorage.setItem(
      'pickupLocation',
      JSON.stringify({ region, address }),
    );
    navigation.goBack();
  };

  /* ================= UI ================= */

  return (
    <View style={styles.container}>

      <CurrentLocation ref={locationRef} />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      />

       
      <View pointerEvents="none" style={styles.centerPin}>
        <Icon name="location-on" size={42} color="#FF3B30" />
      </View>
   

      {/* RECENTER BUTTON */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={handleGetLocation}
      >
        <Icon name="my-location" size={22} color="#007AFF" />
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.headerWrap}>
        <CustomHeader label="" imageIndex={imageIndex.Closed} />
      </View>

      {/* BOTTOM CARD */}
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Pickup Location</Text>
        <Text style={styles.address} numberOfLines={2}>
          {address || 'Fetching address...'}
        </Text>

        <CustomButton
          title="Confirm Pickup Location"
          onPress={confirmLocation}
        />
      </View>

      <LoadingModal visible={isLoading} />
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  map: {
    flex: 1,
  },

  headerWrap: {
    position: 'absolute',
    top: 55,
    width: '100%',
  },
  centerPin: {
   position: 'absolute',
  top: '50%',
  left: '50%',
  transform: [{ translateX: -60 }, { translateY: -60 }], // half of width & height
  height: 120,
  width: 120,
  borderRadius: 60,
  borderWidth: 2,
  borderColor: '#007AFF',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,122,255,0.08)',
  },

  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    elevation: 6,
  },

  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 15,
  },

  title: {
    fontSize: 18,
    fontFamily: font.MonolithRegular,
    marginBottom: 6,
  },

  address: {
    fontSize: 14,
    color: '#555',
    fontFamily: font.MonolithRegular,
    marginBottom: 12,
  },
});

export default PickupLocationRapido;
