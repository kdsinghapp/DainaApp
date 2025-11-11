import { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
 import { useDispatch } from 'react-redux';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { Resend_otp, Verifyotp } from '../../../Api/apiRequest';

export const useOtpVerification = (cellCount: number = 4) => {
  const navigation = useNavigation();
  const route :any= useRoute();
  const { phone ,code } = route.params || {};
   const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
   const dispatch = useDispatch();
 const [timer, setTimer] = useState(0);
  // Timer countdown logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);
  const  data ={
    mob: phone ,
    code : code
  }
  const [errorMessage, setErrorMessage] = useState('');
  const ref = useBlurOnFulfill({ value, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });
  const handleChangeText = (text: string) => {
    setValue(text);
    setErrorMessage(text.length < cellCount ? 'Please enter 4 digit otp' : '');
  };

  const handleResendOTP = async () => {
    if (timer > 0) return; // prevent multiple clicks during countdown
    setIsLoading(true);
    try {
      const params = { phone, code };
      await Resend_otp(params, setIsLoading);
      setTimer(30); // start 30 seconds timer
    } catch (error) {
      console.error('OTP resend error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
     if (value.length !== cellCount) {
      setErrorMessage('Please enter 4 digit otp');
      return;
    }

    setIsLoading(true);
    try {
            setIsLoading(false)
      const params = { phone, otp: value, navigation, code  };
       await Verifyotp(params, setIsLoading,dispatch);
    } catch (error) {
      setIsLoading(false)
     }
  };

  return {
    value,
    setValue,
    isLoading,
    errorMessage,
    ref,
    props,
    getCellOnLayoutHandler,
    handleChangeText,
    handleVerifyOTP,
    navigation,
    handleResendOTP ,
    data,
    timer
  };
};
