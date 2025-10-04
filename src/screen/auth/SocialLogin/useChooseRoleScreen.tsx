import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
  import { Alert } from 'react-native';
 import { LogiApi } from '../../../Api/apiRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const useChooseRoleScreen = () => {
   const dispatch = useDispatch();
const navigation = useNavigation();
const [isLoading, setisLoading] = useState(false)
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: '996226020296-6k1n00n6on0e99b6uaife4lqe17bj7sd.apps.googleusercontent.com',
  //     // webClientId: '43208932533-6ktmlm2uusaqdgv42pj9u94eq9q6q8h7.apps.googleusercontent.com', // ✅ Your Web Client ID
  //     offlineAccess: true,
  //     forceCodeForRefreshToken: true,
  //   });
  // }, []);
  const handleGoogleLogin = async () => {
    try {
      const playServicesAvailable = await GoogleSignin.hasPlayServices();
       const userInfo = await GoogleSignin.signIn();
      console.log("userInfo",userInfo)
      const {email, givenName, familyName, id} = userInfo.data.user;
      const {idToken} = userInfo.data;
      await AsyncStorage.multiSet([
        ['userUserName', email],
        ['userParentFirstName', givenName],
        ['userParentLastName', familyName],
        ['userParentEmail', email],
        ['role', 'admin'],
        ['token', idToken],
        ['userId', id.toString()],
      ]);
 if(idToken){
  loginFunctiom1(email,familyName)
   }
    } catch (error) {
      console.log("error",error)

      Alert.alert('Error', `Google sign-in failed: ${error.message}`);
    }
  };


  const loginFunctiom1 = async (email:any,familyName:any) => {
    try {
      const params = {
        email:email,
        full_name: familyName || "",
        navigation: navigation,
      };
        const response = await LogiApi(params, setisLoading, dispatch);
    } catch (error) {
      console.error("Login error:", error);
    }
  };


  return {
 
 
    isLoading,
 
    handleGoogleLogin,
    navigation
  };
};

export default useChooseRoleScreen;
