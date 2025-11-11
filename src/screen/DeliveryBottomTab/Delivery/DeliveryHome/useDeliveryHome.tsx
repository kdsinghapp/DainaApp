import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url } from '../../../../Api';

export const useDeliveryHome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [locationModal, setlocationModal] = useState(false);
  const [currentlocation, setCurrentLocation] = useState(null);
  const locationRef = useRef(null);

   const fetchAvailableRequests = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
         setIsLoading(false);
        return;
      }
      const response = await axios.get(
        `${base_url}/delivery/available-requests`,
         {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
       if (response?.data?.status == 1) {
     const validRequests = response?.data?.requests?.filter(
    (item:any) => item?.trackingId !== null && item?.trackingId !== ""
  );
  setRequests(validRequests || []);
} else {
        setRequests([]);
       }
    } catch (error) {
      console.error('Error fetching available requests:', error?.response?.data || error?.message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Auto-fetch when hook initializes
  useEffect(() => {
    fetchAvailableRequests();
  }, []);

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
