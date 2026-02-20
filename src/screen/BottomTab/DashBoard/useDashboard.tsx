import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { GetProfileApi, Parceldetails } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebSocket_Url } from '../../../Api';

const useDashboard = () => {
  const navigation = useNavigation();
  const [address, setAddress] = useState("");
  const [locationModal, setlocationModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentlocation, setcurrentlocation] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [orderData, setorderData] = useState([]);
  useEffect(() => {
    getParceldetailsApi()
  }, [])
  const dispatch = useDispatch();
  const locationRef: any = useRef(null);

  useEffect(() => {
    handleGetLocation()
  }, [])
  useEffect(() => {
    getProfileApi();
  }, []);

  const getProfileApi = async () => {
    try {
      const response = await GetProfileApi(setLoading);
      if (response) {
        dispatch(loginSuccess({ userData: response }));
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)

    }
  };
  // Inside your component
  const [pickupLocation, setPickupLocation] = useState(null);
   const [currentLocation, setCurrentLocation] = useState('');
  const handleGetLocation = async () => {
    try {
      const data = await locationRef?.current?.fetchLocation();
      if (data.error) {
        // Alert.alert('Error', data.error);
      } else {
        // Store in AsyncStorage
        await AsyncStorage.setItem('pickupLocation', JSON.stringify(data));
        setcurrentlocation(data?.address)
        // Update state
        setCurrentLocation(data.address);
        setPickupLocation(data);
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
  const getParceldetailsApi = async () => {
    try {
      const response = await Parceldetails(setLoading);
       const goingToPickupData = response.parcels.filter(
        item => item.deliveryStatus === "going_to_pickup"
      );

 
       setorderData(goingToPickupData)
      // if (response) {
      // }
    } catch (error) {

    }
  };

 
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  
  const connectSocket = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `${WebSocket_Url}/user?token=${token}`;
        const ws = new WebSocket(wsUrl);
        let resolved = false;

        ws.onopen = () => {
          console.log('✅ WebSocket connected:', wsUrl);
          resolved = true;
          setIsConnected(true);
          socketRef.current = ws;
          resolve();
        };

        ws.onmessage = async (event: { data: string | Blob | ArrayBuffer }) => {
          let raw: string;
          const d = event.data;
          if (typeof d === 'string') {
            raw = d;
          } else if (d && typeof (d as Blob).text === 'function') {
            raw = await (d as Blob).text();
          } else if (d instanceof ArrayBuffer) {
            raw = new TextDecoder().decode(d);
          } else {
            raw = String(d);
          }
          console.log('📩 WebSocket raw:', raw);

          try {
            const data = JSON.parse(raw);
            console.log('📦 socket data:', data);
            if (data?.type === 'offer_accepted') {
              // setAcceptModal(true);
              // setuserInfromation(data);
              // navigation.navigate(ScreenNameEnum.DeliveryRequest, { deliveryInfo: data });
            }
            if (data?.type === 'parcelStatusUpdate') {
              console.log('📦 Parcel Status Update:', data?.status);
            }
          } catch (e) {
            console.warn('❌ Not JSON or parse failed:', e);
            console.log('📩 Raw message:', raw);
          }
        };

        ws.onerror = (event) => {
          const msg =
            event && typeof event === 'object' && 'message' in event
              ? String((event as { message?: string }).message)
              : 'WebSocket error';
          console.error('❌ WebSocket Error:', msg);
          setIsConnected(false);
          if (!resolved) reject(new Error(msg));
        };

        ws.onclose = (event) => {
          console.log('⚠️ WebSocket Closed', event.code, event.reason);
          setIsConnected(false);
          socketRef.current = null;
          if (!resolved) reject(new Error(event.reason || 'Connection closed'));
        };
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
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
    navigation,
    address,
    setAddress,
    location,
    setLocation,
    locationModal,
    setlocationModal,
    locationRef,
    currentlocation,
    isLoading,
    orderData,
    isConnected,
  };
};

export default useDashboard;
