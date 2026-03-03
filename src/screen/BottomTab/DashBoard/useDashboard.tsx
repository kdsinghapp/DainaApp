import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { GetProfileApi } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDashboardContext } from '../../../context/DashboardContext';

export type { CounterOfferAcceptedPayload } from '../../../context/DashboardContext';

const useDashboard = () => {
  const navigation = useNavigation();
  const ctx = useDashboardContext();
  const [address, setAddress] = useState("");
  const [locationModal, setlocationModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentlocation, setcurrentlocation] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const locationRef: any = useRef(null);

  const orderData = ctx?.orderData ?? [];
  const counterOfferAcceptedModal = ctx?.counterOfferAcceptedModal ?? { visible: false, data: null };
  const setCounterOfferAcceptedModal = ctx?.setCounterOfferAcceptedModal ?? (() => {});
  const getParceldetailsApi = ctx?.getParceldetailsApi ?? (async () => {});
  const registerOrderUpdateCallback = ctx?.registerOrderUpdateCallback ?? (() => {});
  const initialFetchDone = useRef(false);

  useEffect(() => {
    handleGetLocation();
  }, []);

  useEffect(() => {
    getProfileApi();
  }, []);

  useEffect(() => {
    if (ctx && !initialFetchDone.current) {
      initialFetchDone.current = true;
      getParceldetailsApi(setLoading);
    }
  }, [ctx]);

  useEffect(() => {
    if (ctx) {
      registerOrderUpdateCallback(() => getParceldetailsApi(setLoading));
    }
  }, [ctx]);

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
  const fetchParcels = () => getParceldetailsApi(setLoading);

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
    counterOfferAcceptedModal,
    setCounterOfferAcceptedModal,
    getParceldetailsApi: fetchParcels,
  };
};

export default useDashboard;
