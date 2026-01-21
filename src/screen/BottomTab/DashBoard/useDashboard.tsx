import { useEffect, useRef, useState } from 'react';
 import {   useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { GetProfileApi } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
 

const useDashboard = () => {
 const navigation = useNavigation();
   const [address, setAddress] = useState("");
    const [locationModal, setlocationModal] = useState(false);
  const [location, setLocation] = useState(null);
  const [currentlocation, setcurrentlocation] = useState(null);
    const [isLoading, setLoading] = useState(false);
const dispatch = useDispatch();
 const locationRef:any = useRef();

  useEffect(()=>{
    handleGetLocation()
  },[])
  useEffect(() => {
    getProfileApi();
  }, []);

const getProfileApi = async () => {
  try {
    const response = await GetProfileApi(setLoading);
     if (response) {
      dispatch(loginSuccess({ userData: response}));
       setLoading(false)
    } 
  } catch (error) {
    setLoading(false)

   }
};
// Inside your component
const [pickupLocation, setPickupLocation] = useState(null);
const [pickupLat, setPickupLat] = useState(null);
const [currentLocation, setCurrentLocation] = useState('');
 


const handleGetLocation = async () => {
  try {
    const data = await locationRef?.current?.fetchLocation();
    if (data.error) {
      Alert.alert('Error', data.error);
    } else {
      // Store in AsyncStorage
      await AsyncStorage.setItem('pickupLocation', JSON.stringify(data));
setcurrentlocation(data?.address)
      // Update state
      setCurrentLocation(data.address);
      setPickupLocation(data);
      setPickupLat({
        latitude: data.region.latitude,
        longitude: data.region.longitude,
      });

      console.log('Stored and set location:', data);
    }
  } catch (error) {
    console.error('Error getting location:', error);
  }
};


 
  return {
 
     navigation ,
    address, setAddress , 
    location, setLocation,
    locationModal, setlocationModal ,
    locationRef ,
    currentlocation,
    isLoading
  };
};

export default useDashboard;
