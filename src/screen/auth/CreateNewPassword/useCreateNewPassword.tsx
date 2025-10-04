import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updatePassword } from '../../../Api/apiRequest'; 
import { validateConfirmPassword, validatePassword } from '../../../utils/validation';

export const useCreateNewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route?.params || {};

  const handlePassText = (text: string) => {
    setPassword(text);

    const error = validatePassword(text);
    setPasswordError(error);

    const confirmError = validateConfirmPassword(text, confirmPassword);
    setConfirmPasswordError(confirmError);
  };

  const handleCPassText = (text: string) => {
    setConfirmPassword(text);

    const confirmError = validateConfirmPassword(password, text);
    setConfirmPasswordError(confirmError);
  };

  const handleSetPassword = async () => {
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);

    if (passErr || confirmErr) return;

    try {
      const params = {
        userId,
        navigation,
        confirmPassword,
      };

      await updatePassword(params, setIsLoading);
    } catch (error) {
      console.error('Set password error:', error);
    }
  };

  return {
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    isLoading,
    handlePassText,
    handleCPassText,
    handleSetPassword,
    navigation
  };
};
