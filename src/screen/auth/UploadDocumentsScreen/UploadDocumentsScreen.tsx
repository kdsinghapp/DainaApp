import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import imageIndex from "../../../assets/imageIndex";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import CustomButton from "../../../compoent/CustomButton";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DeliveryUploadDocument } from "../../../Api/apiRequest";
import LoadingModal from "../../../utils/Loader";
import { errorToast } from "../../../utils/customToast";
import { styles } from "./style";
import strings from "../../../localization/Localization";
import CustomInput from "../../../compoent/CustomInput";

const UploadDocumentsScreen = () => {
  const [idDoc, setIdDoc] = useState<any>(null);
  const [licenseDoc, setLicenseDoc] = useState<any>(null);
  const [vehicleDoc, setVehicleDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [licenseNumber, setLicenseNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const navigation: any = useNavigation();

  const pickDocument = async (type: string) => {
    const options: any = {
      mediaType: "photo",
      quality: 0.6, // Compressing image to 60% quality
      maxWidth: 1200, // Resizing to 1200px width
    };

    try {
      const result: any = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log("User cancelled image selection");
      } else if (result.errorCode) {
        console.log("ImagePicker Error: ", result.errorMessage);
        errorToast(strings.ErrorPickingImage);
      } else if (result.assets && result.assets.length > 0) {
        const res = result.assets[0];
        const fileObj = {
          uri: res.uri,
          name: res.fileName || `doc_${Date.now()}.jpg`,
          type: res.type || "image/jpeg",
        };

        if (type === "id") setIdDoc(fileObj);
        if (type === "license") setLicenseDoc(fileObj);
        if (type === "vehicle") setVehicleDoc(fileObj);
      }
    } catch (err) {
      console.log("Error picking document:", err);
      errorToast(strings.SomethingWentWrong);
    }
  };

  const handleContinue = async () => {
    if (!idDoc || !licenseDoc || !vehicleDoc) {
      errorToast(strings.UploadDocumentsError);
      return;
    }


    const params = {
      idDocument: idDoc,
      drivingLicense: licenseDoc,
      vehiclePapers: vehicleDoc,

    };
    const response = await DeliveryUploadDocument(params, setIsLoading);
    console.log("response status ", JSON.stringify(response));
    if (response && response.status == "1") {
      navigation.replace(ScreenNameEnum.VehicleSetupScreen);
    }
  };






  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label={strings.UploadDocuments} />
      <LoadingModal visible={isLoading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ID Document */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickDocument("id")}
        >
          {idDoc ? (
            <Image source={{ uri: idDoc.uri }} style={styles.previewImage} />
          ) : (
            <>
              <Image source={imageIndex.document} style={styles.icon} />
              <Text style={styles.placeholderText}>{strings.UploadIdDocument}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Driving License */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickDocument("license")}
        >
          {licenseDoc ? (
            <Image
              source={{ uri: licenseDoc.uri }}
              style={styles.previewImage}
            />
          ) : (
            <>
              <Image source={imageIndex.document} style={styles.icon} />
              <Text style={styles.placeholderText}>{strings.UploadDrivingLicense}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Vehicle Papers */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => pickDocument("vehicle")}
        >
          {vehicleDoc ? (
            <Image
              source={{ uri: vehicleDoc.uri }}
              style={styles.previewImage}
            />
          ) : (
            <>
              <Image source={imageIndex.document} style={styles.icon} />
              <Text style={styles.placeholderText}>{strings.UploadVehiclePapers}</Text>
            </>
          )}
        </TouchableOpacity>


      </ScrollView>

      <View style={styles.buttonWrapper}>
        <CustomButton title={strings.Continue} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;
