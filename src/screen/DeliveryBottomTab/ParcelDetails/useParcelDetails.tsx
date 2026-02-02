import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { base_url } from '../../../Api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { errorToast, successToast } from '../../../utils/customToast';
import { PostApi } from '../../../Api/apiRequest';

export const useParcelDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const rout: any = useRoute()
  const [amount, setAmount] = useState("");
  const [Phone, setPhoneNumber] = useState("");
  const [imgloading, setImgloading] = useState(true);

  const [message, setMessage] = useState("");
  const { item } = rout?.params || ""
  const navigation = useNavigation()
  const fullImageUrl = `https://aitechnotech.in/DAINA${item?.imageUrl}`;
  const makeOffer = async (amount: any, message: any) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.warn('No token found');
        setIsLoading(false);
        return { success: false, message: 'No token found' };
      }
      // ✅ Correct field names based on backend validation
      const formData = new FormData();
      formData.append('parcelId', item?.id);  // changed here ✅
      formData.append('amount', amount);
      formData.append('message', message);
      //  formData.append('phoneCall', Phone);
      const response = await axios.post(
        `${base_url}/delivery/make-offer`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        }
      );


      if (response?.data?.status === 1) {
        return { success: true, data: response.data };
      } else {
        console.warn(response?.data?.message || 'Failed to make offer');
        return {
          success: false,
          message: response?.data?.message || 'Failed to make offer',
        };
      }
    } catch (error) {
      console.error('Error making offer:', error?.response?.data || error.message);
      return {
        success: false,
        message: error?.response?.data?.message || 'Error making offer',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOffer = async () => {
    // Validation
    if (!amount.trim()) {
      errorToast("Please enter amount")
      return;
    }
    if (!message.trim()) {
      errorToast("Please enter message")


      return;
    }
    if (!item?.id) {
      errorToast("Invalid parcel information")

      return;
    }
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    const result: any = await makeOffer(item?.id, amountValue, message.trim());
    console.log("result", result)
    if (result?.data?.status == 1) {
      successToast(result?.data?.message)
      navigation.goBack()

    } else {
      navigation.goBack()
    }
  };

  const updateParcelStatus = async (orderId, newStatus, otp) => {
  // Implement your API call here
  const token = await AsyncStorage.getItem('token');
  const body = {
    otp: otp ?? '',
    // order_id: orderId,
    newStatus: newStatus
  };
  console.log(body, orderId)
  const param = {
    url:`/delivery/parcels/${orderId}/status`,
    data:body,
    token,
    isFormData:true
  }
  console.log(param)
  return await PostApi(param, setIsLoading);
};

  return {
    isLoading,
    setIsLoading,
    requests,
    setRequests,
    item,
    navigation,
    makeOffer,
    fullImageUrl,
    handleSendOffer,
    amount, setAmount,
    message, setMessage,
    imgloading, setImgloading,
    Phone, setPhoneNumber, updateParcelStatus
  };
};

