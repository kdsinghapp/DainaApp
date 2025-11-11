import { useState, useEffect, useRef } from 'react';
  import { Parceldetails } from '../../../Api/apiRequest';
  
export const useOrders = () => {
    const [location, setLocation] = useState(null);
     const [isLoading, setIsLoading] = useState(false);
      const [orderData, setorderData] = useState([]);
 useEffect(()=>{
   getParceldetailsApi()
 },[])
 const getParceldetailsApi = async () => {
   try {
     const response = await Parceldetails(setIsLoading);
     console.log("response",response.parcels)
     setorderData(response.parcels)
      if (response) {
      } 
   } catch (error) {
  
    }
 };

  // ✅ Auto-fetch when hook initializes
 

  return {
    // States
    isLoading,
    setIsLoading,
 location, setLocation  ,
 orderData, setorderData
 
 
    // API function
   };
};
