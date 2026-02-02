import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // New Import
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../../compoent/CustomButton';
import font from '../../../theme/font';
import { GOOGLE_MAPS_APIKEY } from '../../../Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { width } from '../../../utils/Constant';

Geocoder.init(GOOGLE_MAPS_APIKEY);

const PickupLocationRapido = () => {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const searchRef = useRef<any>(null); // To clear search bar if needed
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [region, setRegion] = useState({
    latitude: 46.8625, // Mongolia Fallback
    longitude: 103.8467,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [address, setAddress] = useState('Locating...');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    setIsLocatingUser(true);
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const userRegion = { ...region, latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 };
        setRegion(userRegion);
        mapRef.current?.animateToRegion(userRegion, 1000);
        setIsLocatingUser(false);
      },
      (err) => setIsLocatingUser(false),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };
  const route = useRoute(); 

  const confirmLocation = async () => {
    const locationData = {
      latitude: region.latitude,
      longitude: region.longitude,
      address: address,
    };
console.log(locationData)
    // Trigger the callback from params
    if (route.params?.onLocationSelect) {
      route.params.onLocationSelect(locationData);
    }

    navigation.goBack();
  };

  const handleRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
    setIsFetchingAddress(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const json = await Geocoder.from(newRegion.latitude, newRegion.longitude);
        const addressComponent = json.results?.[0]?.formatted_address || 'Unknown Location';
        setAddress(addressComponent);
        // Sync search bar text with map movement
        searchRef.current?.setAddressText(addressComponent);
      } catch (error) {
        setAddress('Unknown Location');
      } finally {
        setIsFetchingAddress(false);
      }
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}  >
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
      />

      {/* SEARCH BAR OVERLAY */}
      <View style={styles.searchContainer}>
        {/* <GooglePlacesAutocomplete
          ref={searchRef}
          placeholder="Search Pickup Area"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              const { lat, lng } = details.geometry.location;
              const newRegion = { ...region, latitude: lat, longitude: lng };
              mapRef.current?.animateToRegion(newRegion, 1000);
            }
          }}
          query={{ key: GOOGLE_MAPS_APIKEY, language: 'en' }}
          styles={searchStyles}
          enablePoweredByContainer={false}
        /> */}
      </View>

      {/* FIXED PIN */}
      <View pointerEvents="none" style={styles.pinWrapper}>
        <View style={styles.pinContainer}>
          <View style={styles.pinCallout}>
            {isFetchingAddress ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.calloutText}>Set Pickup</Text>}
          </View>
          <Icon name="location-on" size={48} color="#FF3B30" />
        </View>
      </View>

      {/* <TouchableOpacity style={styles.recenterBtn} onPress={getCurrentLocation}>
        <Icon name="my-location" size={24} color="#000" />
      </TouchableOpacity> */}

      <View style={styles.bottomCard}>
        <View style={styles.indicator} />
        <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
        <CustomButton title="Confirm Location" 
        // onPress={() => navigation.goBack()} 
        onPress={confirmLocation} 
  disable={isFetchingAddress || address === 'Locating...'}
        />
          <SafeAreaView edges={['bottom']}/>
      </View>
    </SafeAreaView>
  );
};

const searchStyles = {
  container: { flex: 0, position: 'absolute', width: width - 40, top: 10, left: 20, zIndex: 10 },
  textInput: { height: 50, borderRadius: 12, elevation: 5, shadowOpacity: 0.1, fontSize: 14, color: '#000' },
  listView: { backgroundColor: 'white', borderRadius: 12, elevation: 5, marginTop: 5 },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: { position: 'absolute', width: '100%', top: 60, zIndex: 100 },
  pinWrapper: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  pinContainer: { alignItems: 'center', marginBottom: 48 },
  pinCallout: { backgroundColor: '#fff', padding: 8, borderRadius: 12, elevation: 6, marginBottom: 4 },
  calloutText: { fontSize: 11, fontWeight: 'bold' },
  recenterBtn: { position: 'absolute', right: 20, bottom: 220, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 5 },
  bottomCard: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 20 },
  addressText: { fontSize: 14, color: '#333', marginBottom: 15, fontFamily: font.MonolithRegular },
  indicator: { width: 40, height: 4, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 10 },
});

export default PickupLocationRapido;