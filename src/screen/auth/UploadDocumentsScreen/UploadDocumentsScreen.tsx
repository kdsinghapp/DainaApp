import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { pickDocument } from "../../../utils/documentPickerHelper";
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

const UploadDocumentsScreen = () => {
  const [idDoc, setIdDoc] = useState<any>(null);
  const [licenseDoc, setLicenseDoc] = useState<any>(null);
  const [vehicleDoc, setVehicleDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation: any = useNavigation();
  const handlePickDocument = async (type: string) => {
    const result = await pickDocument();
    if (result) {
      if (type === "id") setIdDoc(result);
      if (type === "license") setLicenseDoc(result);
      if (type === "vehicle") setVehicleDoc(result);
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
          onPress={() => handlePickDocument("id")}
        >
          {idDoc ? (
            idDoc.type === "application/pdf" ? (
              <View style={{ alignItems: "center" }}>
                <Image source={imageIndex.document} style={styles.icon} />
                <Text style={[styles.placeholderText, { fontSize: 12 }]} numberOfLines={1}>
                  {idDoc.name}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: idDoc.uri }} style={styles.previewImage} />
            )
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
          onPress={() => handlePickDocument("license")}
        >
          {licenseDoc ? (
            licenseDoc.type === "application/pdf" ? (
              <View style={{ alignItems: "center" }}>
                <Image source={imageIndex.document} style={styles.icon} />
                <Text style={[styles.placeholderText, { fontSize: 12 }]} numberOfLines={1}>
                  {licenseDoc.name}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: licenseDoc.uri }}
                style={styles.previewImage}
              />
            )
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
          onPress={() => handlePickDocument("vehicle")}
        >
          {vehicleDoc ? (
            vehicleDoc.type === "application/pdf" ? (
              <View style={{ alignItems: "center" }}>
                <Image source={imageIndex.document} style={styles.icon} />
                <Text style={[styles.placeholderText, { fontSize: 12 }]} numberOfLines={1}>
                  {vehicleDoc.name}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: vehicleDoc.uri }}
                style={styles.previewImage}
              />
            )
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
