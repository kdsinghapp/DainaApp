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

const UploadDocumentsScreen = () => {
  const [idDoc, setIdDoc] = useState<any>(null);
  const [licenseDoc, setLicenseDoc] = useState<any>(null);
  const [vehicleDoc, setVehicleDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation:any = useNavigation();

  // ✅ File picker
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

  // ✅ Submit handler
  const handleContinue = async () => {
    if (!idDoc || !licenseDoc || !vehicleDoc) {
      errorToast("Please upload all required documents.");
      return;
    }

    const params = {
      idDocument: idDoc,
      drivingLicense: licenseDoc,
      vehiclePapers: vehicleDoc,
    };
    const response = await DeliveryUploadDocument(params, setIsLoading);
    if (response && response.status == "1") {
      navigation.replace(ScreenNameEnum.VehicleSetupScreen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label="Upload Documents" />
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
              <Text style={styles.placeholderText}>Upload ID Document</Text>
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
              <Text style={styles.placeholderText}>Upload Driving License</Text>
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
              <Text style={styles.placeholderText}>Upload Vehicle Papers</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <CustomButton title="Continue" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 38,
    paddingBottom: 20,
  },
  uploadBox: {
    width: "90%",
    height: 150,
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: "#FFCC00",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    // backgroundColor: "#FFFBEA",
  },
  icon: {
    height: 40,
    width: 40,
    tintColor: "#FFB800",
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonWrapper: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
});
