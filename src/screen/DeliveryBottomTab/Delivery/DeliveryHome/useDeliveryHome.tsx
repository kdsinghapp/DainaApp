import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url, WebSocket_Url } from '../../../../Api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { successToast, errorToast } from '../../../../utils/customToast';
import ScreenNameEnum from '../../../../routes/screenName.enum';
import { STATUS } from '../../../../utils/Constant';
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
  const [newOrderNotification, setNewOrderNotification] = useState<{
    visible: boolean;
    data: unknown;
  } | null>(null);
  const [acceptCounterOfferLoading, setAcceptCounterOfferLoading] = useState(false);

  const locationRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const socketLiveRef = useRef<WebSocket | null>(null);
  const cancelledRef = useRef(false);

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
      console.log("ss", response)

      if (response?.data?.status == 1) {
        // const validRequests = response?.data?.requests?.filter(
        //   (item) => item?.trackingId !== null && item?.trackingId !== "",
        // );
        const validRequests = response?.data?.requests
          ?.filter((item) => item?.trackingId !== null && item?.trackingId !== "")
          ?.map((item) => ({
            ...item,
            deliveryStatus: item?.status
          }));
        setIsLoading(false);
        setRequests(validRequests || []);
      } else {
        setRequests([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(
        'Error fetching available requests:',
        error?.response?.data || error?.message,
      );
      setIsLoading(false);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const sendLiveLocation = useCallback((lat: number, lon: number) => {
    const ws = socketLiveRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ type: 'online', lat, lon });
      console.log("📤 Sending Location to Socket:", payload);
      ws.send(payload);
    } else {
      console.log("⚠️ Socket not open. State:", ws?.readyState);
    }
  }, []);

  const nearbyparcels = useCallback((lat: number, lon: number) => {
    const ws = socketLiveRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("⚠️ Nearby parcels socket not open. State:", ws?.readyState);
      return;
    }
    const payload = { type: 'location', lat, lon };
    const payloadStr = JSON.stringify(payload);
    console.log("📤 Nearby parcels → sending:", payloadStr);
    ws.send(payloadStr);
  }, []);

  // Watch position: update stored lat/long only when user moves ≥20 meters
  useEffect(() => {
    let watchId: number | null = null;

    const onPosition = (position: { coords: { latitude: number; longitude: number } }) => {
      const lat = position?.coords?.latitude;
      const lon = position?.coords?.longitude;
      if (lat != null && lon != null) {
        setCoords({ lat, lon });
        sendLiveLocation(lat, lon);
        nearbyparcels(lat, lon);
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
          nearbyparcels(lat, lon)
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
  }, [sendLiveLocation, nearbyparcels]);

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
          if (cancelledRef.current) {
            ws.close();
            return;
          }
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          socketRef.current = ws;
          resolve();
        };

        ws.onmessage = async (event: { data: string | Blob | ArrayBuffer }) => {
          if (cancelledRef.current) return;
          let raw: string;
          const d = event.data;
          if (typeof d === 'string') raw = d;
          else if (d && typeof (d as Blob).text === 'function') raw = await (d as Blob).text();
          else if (d instanceof ArrayBuffer) raw = new TextDecoder().decode(d);
          else raw = String(d);
          try {
            const data = JSON.parse(raw);

            if (data?.type === 'new_offer') {
              if (cancelledRef.current) return;
              const parcel = data?.parcel ?? data;
              const parcelObj = parcel && typeof parcel === 'object' ? { ...parcel } : {};
              const { type: _t, ...rest } = parcelObj as { type?: string;[k: string]: unknown };
              const item: Record<string, unknown> & { deliveryStatus: string } = {
                ...rest,
                id: rest.id ?? rest.parcelId ?? parcelObj?.id ?? parcelObj?.parcelId,
                parcelId: rest.parcelId ?? rest.id ?? parcelObj?.parcelId ?? parcelObj?.id,
                deliveryStatus: STATUS.PENDING,
              };
              setRequests((prev: unknown[]) => {
                const arr = Array.isArray(prev) ? [...prev] : [];
                const exists = arr.some((r: unknown) => {
                  const x = r as { id?: string; parcelId?: string };
                  return String(x?.id ?? x?.parcelId) === String(item?.id ?? item?.parcelId);
                });
                const trackingId = item?.trackingId;
                if (!exists && trackingId != null && String(trackingId) !== '') {
                  arr.unshift({ ...item, status: STATUS.PENDING });
                }
                return arr as never[];
              });
              if (!cancelledRef.current) setNewOrderNotification({ visible: true, data });
              return;
            }

            if (data?.type === 'counter_offer') {
              if (!cancelledRef.current) setNewOrderNotification({ visible: true, data });
              return;
            }

            if (data?.type === "offer_accepted") {
              if (cancelledRef.current) return;
              setAcceptModal(true);
              setuserInfromation(data);
              navigation.navigate(ScreenNameEnum.TripMap, {
                item: { ...data?.parcel, deliveryStatus: STATUS.ASSIGNED },
                event: data,
              });
            }
            if (data?.type == "parcelStatusUpdate") {
              console.log("📦 Parcel Status Update:", data?.status);
            }
          } catch (e) {
            console.warn('❌ Failed to parse message:', e);
          }
        };
        ws.onerror = (event) => {
          const msg = (event && typeof event === 'object' && 'message' in event) ? String((event as { message?: string }).message) : 'WebSocket error';
          console.error('❌ WebSocket Error:', msg);
          if (!cancelledRef.current) setIsConnected(false);
          reject(new Error(msg));
        };

        ws.onclose = () => {
          console.log('⚠️ WebSocket Closed');
          if (!cancelledRef.current) {
            setIsConnected(false);
            socketRef.current = null;
          }
        };

      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        console.log('⚠️ Error creating socket:', error);
      }
    });
  };


  // Helper: send location on nearby-parcels socket (called after connect + when coords change)
  const sendNearbyLocationOnce = useCallback((ws: WebSocket, lat: number, lon: number) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const payload = JSON.stringify({ type: 'location', lat, lon });
    console.log('📤 [onopen] Sending initial location to nearby-parcels:', payload);
    ws.send(payload);
  }, []);

  // Single socket: nearby-parcels – live location (type: 'online') + nearby parcels (type: 'location')
  const connectLiveLocationSocket = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `${WebSocket_Url}/nearby-parcels?token=${encodeURIComponent(token)}`;


        console.log("wsUrl ----   nerby parsel ", wsUrl)
        const ws = new WebSocket(wsUrl);
        console.log("wsUrl ----   ws  parsel ", ws)

        ws.onopen = () => {
          if (cancelledRef.current) {
            ws.close();
            return;
          }
          console.log('✅ Nearby parcels / live WebSocket connected');
          socketLiveRef.current = ws;
          const { lat, lon } = coordsRef.current ?? {};
          if (lat != null && lon != null) {
            sendNearbyLocationOnce(ws, lat, lon);
          } else {
            Geolocation.getCurrentPosition(
              (pos) => {
                if (cancelledRef.current) return;
                const la = pos?.coords?.latitude;
                const lo = pos?.coords?.longitude;
                if (la != null && lo != null && socketLiveRef.current === ws) {
                  setCoords({ lat: la, lon: lo });
                  sendNearbyLocationOnce(ws, la, lo);
                }
              },
              (err) => console.warn('Failed to get position for initial nearby send:', err),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
            );
          }
          resolve();
        };
        ws.onmessage = async (event: { data: string | Blob | ArrayBuffer }) => {
          if (cancelledRef.current) return;
          let raw: string;
          const d = event?.data;
          if (typeof d === 'string') raw = d;
          else if (d && typeof (d as Blob).text === 'function') raw = await (d as Blob).text();
          else if (d instanceof ArrayBuffer) raw = new TextDecoder().decode(d);
          else raw = String(d ?? '');
          try {
            const data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return;
            console.log("----- nearby_parcel -0- data", data)
            if (data?.type === 'nearby_parcel') {
              if (cancelledRef.current) return;
              const parcel = data?.parcel ?? data;
              const parcelObj = parcel && typeof parcel === 'object' ? { ...parcel } : {};
              const { type: _t, ...rest } = parcelObj as { type?: string;[k: string]: unknown };
              const item: Record<string, unknown> & { deliveryStatus: string } = {
                ...rest,
                id: rest.id ?? rest.parcelId ?? parcelObj?.id ?? parcelObj?.parcelId,
                parcelId: rest.parcelId ?? rest.id ?? parcelObj?.parcelId ?? parcelObj?.id,
                deliveryStatus: STATUS.PENDING,
              };
              setRequests((prev: unknown[]) => {
                const arr = Array.isArray(prev) ? [...prev] : [];
                const exists = arr.some((r: unknown) => {
                  const x = r as { id?: string; parcelId?: string };
                  return String(x?.id ?? x?.parcelId) === String(item?.id ?? item?.parcelId);
                });
                const trackingId = item?.trackingId;
                if (!exists && trackingId != null && String(trackingId) !== '') {
                  arr.unshift({ ...item, status: STATUS.PENDING });
                }
                return arr as never[];
              });
              setNewOrderNotification({ visible: true, data });
              return;
            }

            const list = data?.requests ?? data?.parcels ?? data?.data ?? data?.result;
            if (Array.isArray(list) && !cancelledRef.current) {
              const validRequests = list
                .filter((item: { trackingId?: string | null }) => item?.trackingId != null && item?.trackingId !== '')
                .map((item: Record<string, unknown> & { status?: string }) => ({
                  ...item,
                  deliveryStatus: item?.status,
                }));
              setRequests(validRequests as never[]);
              console.log('📋 Requests updated from socket, count:', validRequests.length);
            }
          } catch (e) {
            console.warn('❌ Failed to parse nearby message:', e);
          }
        };

        ws.onerror = (event) => {
          const msg =
            event && typeof event === 'object' && 'message' in event
              ? String((event as { message?: string }).message)
              : 'WebSocket error';
          console.error('❌ Live/nearby WebSocket Error:', msg);
          reject(new Error(msg));
        };

        ws.onclose = () => {
          console.log('⚠️ Live/nearby WebSocket Closed');
          if (!cancelledRef.current) socketLiveRef.current = null;
        };
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
        console.log('⚠️ Error creating live location socket:', error);
      }
    });
  };





  useEffect(() => {
    cancelledRef.current = false;

    const init = async () => {
      try {
        handleGetLocation();
        const token = await AsyncStorage.getItem('token');
        if (!token || cancelledRef.current) {
          console.log('❌ No token in storage');
          return;
        }
        await connectSocket(token);
        if (cancelledRef.current) return;
        try {
          await connectLiveLocationSocket(token);
        } catch (liveErr) {
          console.warn('🔌 Live/nearby socket failed (app continues):', liveErr);
        }
      } catch (error) {
        console.error('🔌 Socket init failed:', error);
      }
    };

    init();

    return () => {
      cancelledRef.current = true;
      console.log('🛑 Disconnect WebSockets');
      try {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
        if (socketLiveRef.current) {
          socketLiveRef.current.close();
          socketLiveRef.current = null;
        }
      } catch (_) { }
    };
  }, []);
  useEffect(() => {
    if (!coords) return;
    const ws = socketLiveRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      sendLiveLocation(coords.lat, coords.lon);
      nearbyparcels(coords.lat, coords.lon);
    }
  }, [coords, isConnected, sendLiveLocation, nearbyparcels]);

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

  const acceptCounterOffer = async (offerId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        errorToast('Token not found');
        return;
      }
      const response = await fetch(`${base_url}/delivery/offers/${offerId}/accept-counter`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && (result?.status === 1 || result?.success === true)) {
        successToast(result?.message ?? 'Counter offer accepted');
        setNewOrderNotification(null);
        fetchAvailableRequests();
      } else {
        errorToast(result?.message ?? 'Failed to accept counter offer');
      }
    } catch (error) {
      console.error('Accept counter offer error:', error);
      errorToast('Something went wrong');
    } finally {

    }
  };
  const RejectcounterOffer = async (offerId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        errorToast('Token not found');
        return;
      }
      const response = await fetch(`${base_url}/delivery/offers/${offerId}/reject-counter`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok && (result?.status === 1 || result?.success === true)) {
        successToast(result?.message ?? 'Reject  offer ');
        setNewOrderNotification(null);
        // fetchAvailableRequests();
      }
    } catch (error) {
      console.error('Reject counter offer error:', error);
      errorToast('Something went wrong');
    } finally {

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
    acceptModal,
    setAcceptModal,
    newOrderNotification,
    setNewOrderNotification,
    acceptCounterOffer,
    acceptCounterOfferLoading,
    RejectcounterOffer
  };
};
