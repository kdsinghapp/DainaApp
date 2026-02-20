import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { base_url } from '../../../Api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { errorToast, successToast } from '../../../utils/customToast';
import ScreenNameEnum from '../../../routes/screenName.enum';

export const useOfferOR = () => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offerData, setOfferData] = useState([]);
  const rou: any = useRoute()
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null)
  const { Parcelid, id } = rou?.params || ""
  useEffect(() => {
    fetchOffers();
  }, []);
  const navgation = useNavigation()
  const fetchOffers = async () => {
    // setOfferData(Parcelid || []);
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${base_url}/offers/${id?.parcel.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json(); 
      console.log("result",)
      if (result.status == 1 || result.success === true) {
        setOfferData(result?.offers || []);
        setIsLoading(false)
      }
    } catch (err) {
      console.log('Error fetching offers:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const onAccept = async (id: any) => {
    try {

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn("No token found");
        return;
      }
        //  const apiUrl = `${base_url}/ooffers/${id}/accept`;
       const apiUrl = `https://aitechnotech.in/DAINA/api/offers/${id}/accept`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // include Bearer if API expects it
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // add body data if needed
      });

      const result = await response.json();

      if (response.ok) {
        successToast("Offer accepted successfully!"),
          navgation.replace(ScreenNameEnum.TabNavigator);

      } else {
        errorToast(result?.message)
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      alert("Something went wrong. Please try again.");
    }
  };



const CounterOffer = async (id: any, amount: number) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
   const apiUrl = `${base_url}/offers/counter-offer`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        counterAmount: amount, 
        offerId: id ,// 👈 yahan amount jaayega
       }),
    });

    const result = await response.json();

    if (result.ok) {
      successToast("counter accepted successfully!");
     }  
  } catch (error) {
    console.error("Error counter offer:", error);
  }
};



  return {
    // States
    isLoading,
    offerData,
    location,
    setLocation,
    // Functions
    fetchOffers,
    onAccept,
    navgation ,
    CounterOffer ,
    selectedOfferId, setSelectedOfferId
  };
};
