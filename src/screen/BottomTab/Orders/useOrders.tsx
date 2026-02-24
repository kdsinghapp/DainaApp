import { useState, useEffect, useRef } from 'react';
import { Parceldetails } from '../../../Api/apiRequest';

export const useOrders = () => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setorderData] = useState([]);
  useEffect(() => {
    getParceldetailsApi()
  }, [])
  const getParceldetailsApi = async () => {
    try {
      const response = await Parceldetails(setIsLoading);
       setorderData(response.parcels)
      if (response) {
      }
    } catch (error) {
    }
  };
  return {
    // States
    isLoading,
    setIsLoading,
    location, setLocation,
    orderData, setorderData,
    getParceldetailsApi


    // API function
  };
};
