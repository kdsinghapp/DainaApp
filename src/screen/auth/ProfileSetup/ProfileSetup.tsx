import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchImageLibrary } from "react-native-image-picker";
import { openCamera } from "../../../utils/cameraHelper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";

import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import CustomInput from "../../../compoent/CustomInput";
import CustomButton from "../../../compoent/CustomButton";
import ImagePickerModal from "../../../compoent/ImagePickerModal";
import imageIndex from "../../../assets/imageIndex";
import { GetProfileApi, UpdateProfile } from "../../../Api/apiRequest";
import { loginSuccess } from "../../../redux/feature/authSlice";
import LoadingModal from "../../../utils/Loader";
 import { errorToast } from "../../../utils/customToast";
import ScreenNameEnum from "../../../routes/screenName.enum";

const ProfileSetup = () => {
  const navigation = useNavigation();
  const userData: any = useSelector((state: any) => state.auth.userData);
const  route :any = useRoute()
const {type} = route ||""
  const [fullName, setFullName] = useState(userData?.firstName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [address, setAddress] = useState(userData?.address || "");
  const [image, setImage] = useState<any>(userData?.image || null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const dispatch = useDispatch();
useEffect((()=>{
  getProfileApi()
  setFullName(userData?.firstName || "")
    setEmail(userData?.email || "")
    setAddress(userData?.address || "")
setImage(userData?.image||"")
 }),[userData?.firstName])

const getProfileApi = async () => {
  try {
    const response = await GetProfileApi(setIsLoading);
     if (response) {
      dispatch(loginSuccess({ userData: response}));
     } 
  } catch (error) {
 
   }
};
  const pickImageFromGallery = () => {
    launchImageLibrary({ mediaType: "photo", quality: 0.4
      
     }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        setIsModalVisible(false);
      }
    });
  };

  const takePhotoFromCamera = () => {
    openCamera((result) => {
      if ('cancelled' in result) return;
      if ('error' in result) {
        errorToast(result.error);
        return;
      }
      setImage(result.asset);
      setIsModalVisible(false);
    });
  };

const handleSave = async () => {
  try {
    // ✅ Validation checks
    if (!fullName?.trim()) {
      errorToast("Please enter your full name.");
       return;
    }
  if (!email || !email.trim()) {
  errorToast("Please enter your email address.");
  return;
}
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
  errorToast("Please enter a valid email address.");
  return;
}


    if (!address?.trim()) {
      errorToast("Please enter your address.");
       return;
    }

    if (!image) {
      errorToast("Please upload your profile image.");
       return;
    }

    // ✅ Prepare params for API
    const params = {
      username: fullName,
      email: email,
      address: address,
      imagePrfoile: image, // full object with uri, type, name
    };

    const response = await UpdateProfile(params, setIsLoading);
    if (response) {
      await getProfileApi();
navigation.goBack()
      // if (userData?.type === "Delivery") {
      //   navigation.navigate(ScreenNameEnum.UploadDocumentsScreen);
      // } else {
      //   navigation.navigate(ScreenNameEnum.TabNavigator);
      // }
    }
  } catch (error) {
    console.error("Error while saving profile:", error);
   } finally {
    setIsLoading(false);
  }
};
const  onSkipe =()=>{
        if (userData?.type === "Delivery") {
        navigation.navigate(ScreenNameEnum.DeliveryTabNavigator);
      } else {
        navigation.navigate(ScreenNameEnum.TabNavigator);
      }
}
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBarComponent />
      <CustomHeader label="Profile" />
                                              <LoadingModal visible ={isLoading}/>


      <KeyboardAvoidingView
      style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // adjust offset if needed

       >
        <ScrollView contentContainerStyle={styles.container}
        
        >
          <View style={styles.profileContainer}>
            <Image
              source={image ? { uri: image.uri || image } : imageIndex.prfile}
              style={styles.profileImage}
              resizeMode="cover"
            />

            {/* Edit Icon */}
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => setIsModalVisible(true)}
            >
              <Image
                source={imageIndex.eoditphots}
                style={styles.editIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                leftIcon={<Image source={imageIndex.profiel} style={styles.icon} />}
              />
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                leftIcon={<Image source={imageIndex.mess} style={styles.icon} />}
              />
              <CustomInput
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
                leftIcon={<Image source={imageIndex.location1} style={styles.icon} />}
              />
            </View>
          </View>

          {/* Image Picker Modal */}
          <ImagePickerModal
            modalVisible={isModalVisible}
            setModalVisible={setIsModalVisible}
            pickImageFromGallery={pickImageFromGallery}
            handleTakePhoto={takePhotoFromCamera}
          />
        </ScrollView>
      </KeyboardAvoidingView>
{type ==="otp" && (
    <View style={styles.buttonContainer}>
        <CustomButton title="sKIP" onPress={onSkipe} loading={isLoading} />
      </View>
)}
    
      <View style={styles.buttonContainer}>
        <CustomButton title="Update" onPress={handleSave} loading={isLoading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
    position: "relative", // needed for absolute edit icon
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: "relative",
    bottom: 20,
    right: 0,
     padding: 5,
     left:16
  
  },
  editIcon: {
    width: 33,
    height: 33,
  },
  inputContainer: {
    marginTop: 20,
    width: "90%",
  },
  icon: {
    width: 18,
    height: 18,
  },
  buttonContainer: {
    marginBottom: 30,
    marginHorizontal: 15,
  },
});

export default ProfileSetup;
