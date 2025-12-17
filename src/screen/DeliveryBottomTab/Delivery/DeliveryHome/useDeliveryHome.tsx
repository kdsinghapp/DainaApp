import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url, WebSocket_Url } from '../../../../Api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { successToast } from '../../../../utils/customToast';
import io, { Socket } from 'socket.io-client';
import ScreenNameEnum from '../../../../routes/screenName.enum';
export const useDeliveryHome = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation()
  const [requests, setRequests] = useState([]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [locationModal, setlocationModal] = useState(false);
  const [currentlocation, setCurrentLocation] = useState(null);
  const [acceptModal, setAcceptModal] = useState(false);
  const [userInfromation, setuserInfromation] = useState([]);

  const locationRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
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
      // const position = await new Promise((resolve, reject) => {
      //   Geolocation.getCurrentPosition(
      //     (pos) => resolve(pos),
      //     (error) => reject(error),
      //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      //   );
      // });

      // const lat = position?.coords?.latitude;
      // const lon = position?.coords?.longitude;
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

  const connectSocket = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `${WebSocket_Url}/driver?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          socketRef.current = ws;
          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "offer_accepted") {
              setAcceptModal(true);
              setuserInfromation(data);
              navigation.navigate(ScreenNameEnum.DeliveryRequest, {
                deliveryInfo: data,
              });
            }
            if (data?.type == "parcelStatusUpdate") {
              console.log("📦 Parcel Status Update:", data?.status);
            }
          } catch (e) {
            console.warn('❌ Failed to parse message:', e);
          }
        };
        ws.onerror = (error) => {
          console.error('❌ WebSocket Error:', error);
          setIsConnected(false);
          reject(error);
        };

        ws.onclose = () => {
          console.log('⚠️ WebSocket Closed');
          setIsConnected(false);
        };

      } catch (error) {
        reject(error);
        console.log('⚠️ Error creating socket:', error);
      }
    });
  };


  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('❌ No token in storage');
          return;
        }
        await connectSocket(token);
      } catch (error) {
        console.error('🔌 Socket init failed:', error);
      }
    };

    init();

    return () => {
      console.log('🛑 Disconnect WebSocket');
      socketRef.current?.close(); // 👈 Proper cleanup
    };
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
    userInfromation,
    // API function
    fetchAvailableRequests,
    acceptModal, setAcceptModal
  };
};
