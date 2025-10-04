import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';
import { otp_Verify, resend_otp } from '../../../Api/apiRequest';
import { useDispatch } from 'react-redux';
import ScreenNameEnum from '../../../routes/screenName.enum';

export const useOtpVerification = (cellCount: number = 4) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { phone , type, id } = route.params || {};
const dispatch = useDispatch()
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const ref = useBlurOnFulfill({ value, cellCount });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

  const handleChangeText = (text: string) => {
    setValue(text);
    setErrorMessage(text.length < cellCount ? 'Please enter 4 digit otp' : '');
  };

  const handleResendOTP = async () => {
   
    setIsLoading(true);
    try {
      const params = { phone, navigation };
      await resend_otp(params, setIsLoading);
    } catch (error) {
      console.error('OTP verification error:', error);
      // setErrorMessage('Une erreur s\'est produite. Veuillez réessayer.');
    }
  };
  const handleVerifyOTP = async () => {
       navigation.navigate(ScreenNameEnum.ProfileSetup);
 
    
    // if (value.length !== cellCount) {
    //   setErrorMessage('Please enter 4 digit otp');
    //   return;
    // }

    // setIsLoading(true);
    // try {
    //   const params = { phone, otp: value, navigation, type, id };
    //   await otp_Verify(params, setIsLoading, dispatch);
    // } catch (error) {
    //   console.error('OTP verification error:', error);
    //   // setErrorMessage('Une erreur s\'est produite. Veuillez réessayer.');
    // }
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
    handleResendOTP
  };
};
