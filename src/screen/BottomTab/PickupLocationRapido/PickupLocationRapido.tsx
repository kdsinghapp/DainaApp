import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '../../../compoent/CustomButton';
import font from '../../../theme/font';
import { color } from '../../../constant';
import { GOOGLE_MAPS_APIKEY } from '../../../Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import strings from '../../../localization/Localization';
import AddressModalInput from '../../../compoent/AutocompleteData';

Geocoder.init(GOOGLE_MAPS_APIKEY);

const PickupLocationRapido = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const mapRef = useRef<MapView>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const pinAnim = useRef(new Animated.Value(0)).current;

  const [region, setRegion] = useState<Region>({
    latitude: 46.8625, // Mongolia Fallback
    longitude: 103.8467,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [address, setAddress] = useState(strings.Locating);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const animatePin = useCallback(() => {
    Animated.sequence([
      Animated.timing(pinAnim, { toValue: -15, duration: 200, useNativeDriver: true }),
      Animated.timing(pinAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [pinAnim]);

  const fetchAddressForCoords = async (lat: number, lng: number) => {
    try {
      setIsFetchingAddress(true);
      const json = await Geocoder.from(lat, lng);
      const formatted = json.results?.[0]?.formatted_address || strings.UnknownLocation;
      setAddress(formatted);
    } catch {
      setAddress(strings.UnknownLocation);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setAddress(strings.PermissionDenied);
        return;
      }
    }

    setIsFetchingAddress(true);
    Geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const userRegion = { ...region, latitude, longitude };
        setRegion(userRegion);
        mapRef.current?.animateToRegion(userRegion, 1000);
        fetchAddressForCoords(latitude, longitude);
      },
      () => {
        setIsFetchingAddress(false);
        setAddress(strings.UnableGetLocation);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const confirmLocation = () => {
    const locationData = {
      latitude: region.latitude,
      longitude: region.longitude,
      address: address,
    };

    if (route?.params?.onLocationSelect) {
      route.params.onLocationSelect(locationData);
    }
    navigation.goBack();
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    animatePin();

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchAddressForCoords(newRegion.latitude, newRegion.longitude);
    }, 800);
  };

  const handleSearchSelect = (coords: { latitude: number, longitude: number }) => {
    const newRegion = { ...region, ...coords };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    fetchAddressForCoords(coords.latitude, coords.longitude);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
      />

      {/* SEARCH BAR OVERLAY */}
      <TouchableOpacity
        style={styles.searchBox}
        onPress={() => setSearchModalVisible(true)}
        activeOpacity={0.9}
      >
        <Icon name="search" size={22} color={color.primary} />
        <Text style={styles.searchPlaceholder} numberOfLines={1}>
          {address === strings.Locating ? strings.SearchPickupArea : address}
        </Text>
      </TouchableOpacity>

      {/* FIXED PIN */}
      <View pointerEvents="none" style={styles.pinWrapper}>
        <Animated.View style={[styles.pinContainer, { transform: [{ translateY: pinAnim }] }]}>
          <View style={styles.pinCallout}>
            {isFetchingAddress ? (
              <ActivityIndicator size="small" color={color.primary} />
            ) : (
              <Text style={styles.calloutText}>{strings.SetPickup}</Text>
            )}
          </View>
          <Icon name="location-on" size={54} color="#FF3B30" />
          <View style={styles.pinShadow} />
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.recenterBtn} onPress={getCurrentLocation} activeOpacity={0.8}>
        <Icon name="my-location" size={24} color="#1C1C1C" />
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <View style={styles.indicator} />
        <View style={styles.addressContainer}>
          <View style={styles.addressIconWrap}>
            <Icon name="place" size={20} color={color.primary} />
          </View>
          <Text style={styles.addressText} numberOfLines={2}>{address}</Text>
        </View>

        <CustomButton
          title={strings.ConfirmLocation}
          onPress={confirmLocation}
        // disable={isFetchingAddress || address === strings.Locating}
        />
      </View>

      <AddressModalInput
        modalVisible={searchModalVisible}
        setModalVisible={setSearchModalVisible}
        value={address}
        onChange={setAddress}
        onSelect={handleSearchSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  searchBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: font.MonolithRegular,
    color: '#1C1C1C',
  },
  pinWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 44, // Offset to point the tip exactly at center
  },
  pinCallout: {
    backgroundColor: '#1C1C1C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  calloutText: {
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    color: '#fff',
    fontWeight: '600',
  },
  pinShadow: {
    width: 8,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    marginTop: -4,
  },
  recenterBtn: {
    position: 'absolute',
    right: 20,
    bottom: 240,
    backgroundColor: '#fff',
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 16 },
      android: { elevation: 20 },
    }),
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  addressText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#1C1C1C',
    fontFamily: font.MonolithRegular,
  },
});

export default PickupLocationRapido;