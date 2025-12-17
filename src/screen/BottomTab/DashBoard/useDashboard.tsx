import { useEffect, useRef, useState } from 'react';
 import {   useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { GetProfileApi } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';
 

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



  const handleGetLocation = async () => {
    const data = await locationRef?.current?.fetchLocation();
 
    if (data.error) {
      Alert.alert('Error', data.error);
    } else {
        console.log("data",data)
        setcurrentlocation(data?.address)
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
