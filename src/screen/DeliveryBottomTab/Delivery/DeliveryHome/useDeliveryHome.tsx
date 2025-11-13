import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url } from '../../../../Api';
import { useNavigation ,useFocusEffect} from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { successToast } from '../../../../utils/customToast';

export const useDeliveryHome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [locationModal, setlocationModal] = useState(false);
  const [currentlocation, setCurrentLocation] = useState(null);
  const locationRef = useRef(null);
const navgation = useNavigation()
const fetchAvailableRequests = async () => {
  try {
    setIsLoading(true);

    // Get token
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Get current location
    const position = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });

    const lat = position?.coords?.latitude;
    const lon = position?.coords?.longitude;
      const response = await axios.get(
      `${base_url}/delivery/available-requests?lat=${"22.7007"}&lon=${"75.8690"}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    );

    if (response?.data?.status == 1) {
successToast(response?.data.message)
       const validRequests = response?.data?.requests?.filter(
        (item) => item?.trackingId !== null && item?.trackingId !== "",
      );
      setRequests(validRequests || []);
    } else {
      setRequests([]);
    }
  } catch (error) {
    console.error(
      'Error fetching available requests:',
      error?.response?.data || error?.message,
    );
    setRequests([]);
  } finally {
    setIsLoading(false);
  }
};


  // ✅ Auto-fetch when hook initializes
  useFocusEffect(
    useCallback(() => {
      fetchAvailableRequests();
    }, [])
  );


  return {
    // States
    isLoading,
    setIsLoading,
    requests,
    setRequests,
    address,
    setAddress,
    location,
    setLocation,
    locationModal,
    setlocationModal,
    currentlocation,
    setCurrentLocation,
    locationRef,

    // API function
    fetchAvailableRequests,
  };
};
