import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import imageIndex from "../../../assets/imageIndex";
import CustomInput from "../../../compoent/CustomInput";
import CustomButton from "../../../compoent/CustomButton";
import ImagePickerModal from "../../../compoent/ImagePickerModal";
import LocationPermissionModal from "../../../compoent/LocationModal";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import font from "../../../theme/font";

const EditProfile = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<any>(imageIndex.prfile);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [location, setLocation] = useState(null);


  const pickImageFromGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0].uri);
        setIsModalVisible(false);
      }
    });
  };

  const takePhotoFromCamera = () => {
    launchCamera({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0].uri);
        setIsModalVisible(false);
      }
    });
  };
  const navigation = useNavigation()

  const handleSave = () => {
    navigation.navigate(ScreenNameEnum.TabNavigator)
    // if (!fullName || !phone || !email || !address) {
    //   Alert.alert("Error", "Please fill all the fields");
    //   return;
    // }
    // // Save logic here
    // Alert.alert("Success", "Profile updated successfully!");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBarComponent />
      <CustomHeader  label="Profile"/>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.profileContainer}>
           
            <Image
                source={imageIndex.prfile}
                style={{ height: 100, width: 100 }}
                resizeMode="contain"
              />
           <TouchableOpacity
              style={styles.editIcon}
              onPress={() => setIsModalVisible(true)}
            >
              <Image
                source={imageIndex.eoditphots}
                style={{ height: 33, width: 33 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View style={{ marginHorizontal: 15,  }}>
              <CustomInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
                leftIcon ={  <Image source={imageIndex.profiel} style={styles.image} />}
              />
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                leftIcon ={  <Image source={imageIndex.profiel} style={styles.image} />}
              />
              <CustomInput
                 placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                leftIcon ={  <Image source={imageIndex.Phone1} style={styles.image} />}
              />
          
               
           
            
            </View>
          </View>

       

          {/* Use the reusable ImagePickerModal component */}
          <ImagePickerModal
            modalVisible={isModalVisible}
            setModalVisible={setIsModalVisible}
            pickImageFromGallery={pickImageFromGallery}
            takePhotoFromCamera={takePhotoFromCamera}
          />
        </ScrollView>
        
      </KeyboardAvoidingView>
      <View             style={{ marginBottom: 30,  marginHorizontal:15 }}
      >
      <CustomButton
            title="Update"
            onPress={handleSave}
           />
                 

          </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
   },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  editIcon: {
    position: "relative",
    bottom: 30,
    right: 0,
    padding: 7,
    borderRadius: 15,

    left:15
   },
   image:{
    height:18,
    width:18,
   },
   inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FFF5F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginBottom: 15,
    height: 60,
    paddingVertical: 10,
    borderWidth:2,
    borderColor: "#F7F8F8"
},
input: {
    flex: 1,
    marginLeft: 10,
    color: "black",
    fontSize:16 ,
    fontFamily:font.MonolithRegular
},
});

export default EditProfile;
