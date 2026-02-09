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
  const socketLiveRef = useRef<WebSocket | null>(null);

  // Store lat/long for API; only updates when user moves ≥20m (see watchPosition)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    coordsRef.current = coords;
  }, [coords]);

  const fetchAvailableRequests = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      let lat = coordsRef.current?.lat;
      let lon = coordsRef.current?.lon;

      // If no stored coords yet, get current position once
      if (lat == null || lon == null) {
        const position = await new Promise<{ coords: { latitude: number; longitude: number } }>((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 10000,
          });
        });
        lat = position?.coords?.latitude;
        lon = position?.coords?.longitude;
        if (lat != null && lon != null) {
          setCoords({ lat, lon });
        }
      }

      if (lat == null || lon == null) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(
        `${base_url}/delivery/available-requests?lat=${lat}&lon=${lon}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
      console.log("response?.data", response?.data)

      if (response?.data?.status == 1) {
        console.log("response?.data", response?.data)
        successToast(response?.data.message)
        // const validRequests = response?.data?.requests?.filter(
        //   (item) => item?.trackingId !== null && item?.trackingId !== "",
        // );
        const validRequests = response?.data?.requests
          ?.filter((item) => item?.trackingId !== null && item?.trackingId !== "")
          ?.map((item) => ({
            ...item,
            deliveryStatus: item?.status
          }));
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
  }, []);
  const sendLiveLocation = useCallback((lat: number, lon: number) => {
    const ws = socketLiveRef.current;
    console.log('first', ws)
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ type: 'online', lat, lon });
      console.log("📤 Sending Location to Socket:", payload);
      ws.send(payload);
    } else {
      console.log("⚠️ Socket not open. State:", ws?.readyState);
    }
  }, []);
  // const sendLiveLocation = useCallback((lat: number, lon: number) => {
  //   const ws = socketLiveRef.current;
  //   if (ws?.readyState === WebSocket.OPEN) {
  //     ws.send(JSON.stringify({ type: 'online', lat, lon }));
  //   }
  // }, []);

  // Watch position: update stored lat/long only when user moves ≥20 meters
  useEffect(() => {
    let watchId: number | null = null;

    const onPosition = (position: { coords: { latitude: number; longitude: number } }) => {
      const lat = position?.coords?.latitude;
      const lon = position?.coords?.longitude;
      if (lat != null && lon != null) {
        setCoords({ lat, lon });
        // fetchAvailableRequests();
        sendLiveLocation(lat, lon);
      }
    };

    const onError = (error: unknown) => {
      console.warn('Location error:', error);
    };

    Geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos?.coords?.latitude;
        const lon = pos?.coords?.longitude;
        if (lat != null && lon != null) {
          setCoords({ lat, lon });
          // fetchAvailableRequests();
          sendLiveLocation(lat, lon);
        }
        watchId = Geolocation.watchPosition(onPosition, onError, {
          enableHighAccuracy: true,
          distanceFilter: 20,
        });
      },
      onError,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );

    return () => {
      if (watchId != null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [fetchAvailableRequests, sendLiveLocation]);

  // Auto-fetch when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAvailableRequests();
    }, [fetchAvailableRequests])
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
          console.log(event.data, 'event.data')
          try {
            const data = JSON.parse(event.data);
            if (data?.type === "offer_accepted") {
              setAcceptModal(true);
              setuserInfromation(data);
              navigation.navigate(ScreenNameEnum.TripMap, {
                item: data?.parcel,
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

  const connectLiveLocationSocket = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `${WebSocket_Url}/driver-live?token=${token}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('✅ Live location WebSocket connected', coordsRef.current);
          socketLiveRef.current = ws;
          const { lat, lon } = coordsRef.current ?? {};
          if (lat != null && lon != null) {
            console.log(JSON.stringify({ type: 'online', lat, lon }))
            // ws.send(JSON.stringify({ type: 'online', lat: lat, lon: lon }))
          }
          resolve();
        };
        ws.onmessage = (event) => {
          try {
            console.log(event.data, 'this response from backend')
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
          console.error('❌ Live location WebSocket Error:', error);
          reject(error);
        };

        ws.onclose = () => {
          console.log('⚠️ Live location WebSocket Closed');
          socketLiveRef.current = null;
        };

      } catch (error) {
        reject(error);
        console.log('⚠️ Error creating live location socket:', error);
      }
    });
  };


  useEffect(() => {
    const init = async () => {
      try {
        handleGetLocation()
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('❌ No token in storage');
          return;
        }
        await connectSocket(token);
        await connectLiveLocationSocket(token);
      } catch (error) {
        console.error('🔌 Socket init failed:', error);
      }
    };

    init();

    return () => {
      console.log('🛑 Disconnect WebSocket');
      socketRef.current?.close();
      socketLiveRef.current?.close();
    };
  }, []);
  useEffect(() => {
    if (coords && socketLiveRef.current?.readyState === WebSocket.OPEN) {
      sendLiveLocation(coords.lat, coords.lon);
    }
  }, [coords, isConnected, sendLiveLocation]);

  const handleGetLocation = async () => {
    try {
      const data = await locationRef?.current?.fetchLocation();
      if (data.error) {
        // Alert.alert('Error', data.error);
      } else {
        // Store in AsyncStorage
        await AsyncStorage.setItem('pickupLocation', JSON.stringify(data));
        setCurrentLocation(data?.address)
        // Update state
        setCurrentLocation(data.address);
        // setPickupLocation(data);
        // setPickupLat({
        //   latitude: data.region.latitude,
        //   longitude: data.region.longitude,
        // });

        console.log('Stored and set location:', data);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };
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
    coords,
    userInfromation,
    // API function
    fetchAvailableRequests,
    acceptModal, setAcceptModal
  };
};
