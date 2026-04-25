import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
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
    try {
      const [res] = await pick({ type: [types.allFiles] });

      if (res) {
        const fileObj = {
          uri: res.uri,
          name: res.name,
          type: res.type || "application/octet-stream",
        };

        if (type === "id") setIdDoc(fileObj);
        if (type === "license") setLicenseDoc(fileObj);
        if (type === "vehicle") setVehicleDoc(fileObj);
      }
    } catch (err: any) {
      if (err?.message?.includes("cancelled")) {
        console.log("User cancelled upload");
      } else {
        console.log("Error picking document:", err);
      }
    }
  };

  const handleContinue = async () => {
    if (!idDoc || !licenseDoc || !vehicleDoc) {
      errorToast(strings.UploadDocumentsError);
      return;
    }

    // if (!licenseNumber.trim()) {
    //   errorToast(strings.EnterLicenseNumberError);
    //   return;
    // }

    // if (!phoneNumber.trim()) {
    //   errorToast(strings.EnterPhoneNumberError);
    //   return;
    // }

    // if (!bankName.trim()) {
    //   errorToast(strings.EnterBankNameError);
    //   return;
    // }

    // if (!accountNumber.trim()) {
    //   errorToast(strings.EnterAccountNumberError);
    //   return;
    // }

    // if (!ifscCode.trim()) {
    //   errorToast(strings.EnterIFSCCodeError);
    //   return;
    // }

    const params = {
      idDocument: idDoc,
      drivingLicense: licenseDoc,
      vehiclePapers: vehicleDoc,

    };
    const response = await DeliveryUploadDocument(params, setIsLoading);
    console.log("response status ", response);
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

        <View style={{ width: '90%', marginBottom: 20 }}>
          <CustomInput
            placeholder={strings.DrivingLicenseNumber}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <CustomInput
            placeholder={strings.PhoneNumber}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <CustomInput
            placeholder={strings.BankName}
            value={bankName}
            onChangeText={setBankName}
          />
          <CustomInput
            placeholder={strings.AccountNumber}
            value={accountNumber}
            onChangeText={setAccountNumber}
            keyboardType="numeric"
          />
          <CustomInput
            placeholder={strings.IFSCCode}
            value={ifscCode}
            onChangeText={setIfscCode}
          />
        </View>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <CustomButton title={strings.Continue} onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;
