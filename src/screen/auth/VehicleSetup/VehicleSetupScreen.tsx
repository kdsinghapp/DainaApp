import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { pick, types } from "@react-native-documents/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import imageIndex from "../../../assets/imageIndex";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { DeliveryVehicleDocument } from "../../../Api/apiRequest";
import { errorToast } from "../../../utils/customToast";
import font from "../../../theme/font";

const VehicleSetupScreen = () => {
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState<any>(null);
   const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();
  const vehicleOptions = ["Car", "Bike", "Van", "Truck"];

   const handlePickDocument = async (type: "registration" | "papers") => {
    try {
      const [res] = await pick({ type: [types.images, types.pdf] });
      if (res) {
        if (type === "registration") setVehicleRegistration(res);
       }
    } catch (error: any) {
      if (error?.message?.includes("cancelled")) {
        console.log("User cancelled document selection");
      } else {
        console.log("Error picking document: ", error);
      }
    }
  };

  // 🚀 Handle Save & Continue
  const handleContinue = async () => {
    if (!vehicleType?.trim()) {
                  errorToast('Please select a vehicle type.');
       return;
    }
    if (!vehicleNumber?.trim()) {
            errorToast("Please enter the vehicle number.");

       return;
    }

    if (!vehicleRegistration) {
      errorToast("Please upload vehicle registration.");
       return;
    }
    const params = {
      vehicleType,
      vehicleNumber,
      vehicleRegistration,
     };
    const response = await DeliveryVehicleDocument(params, setIsLoading);
    if (response?.status == "1") {
      navigation.replace(ScreenNameEnum.DeliveryTabNavigator);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label="Vehicle Setup" />

      <ScrollView  
      showsVerticalScrollIndicator={false}
      style={styles.content}>
        {/* Vehicle Type Dropdown */}
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownText, !vehicleType && { color: "#999" }]}>
            {vehicleType || "Select vehicle type"}
          </Text>
          <Image
            source={imageIndex.dounArroww}
            style={{ height: 18, width: 18 }}
          />
        </TouchableOpacity>

        {/* Vehicle Number Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter vehicle number"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholderTextColor="#999"
        />

        {/* Upload Vehicle Registration */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => handlePickDocument("registration")}
        >
          <Image
            source={imageIndex.document}
            style={{ width: 22, height: 22, tintColor: "#FFCC00" }}
          />
          <Text style={styles.uploadText}>
            {vehicleRegistration
              ? vehicleRegistration.name
              : "Upload vehicle registration"}
          </Text>
        </TouchableOpacity>

    

        {/* Save Button */}
       
        {/* Dropdown Modal */}
        <Modal visible={showDropdown} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDropdown(false)}
          >
            <View style={styles.dropdownContainer}>
              <FlatList
                data={vehicleOptions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setVehicleType(item);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
       <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text style={styles.buttonText}>Save & Continue</Text>
          )}
        </TouchableOpacity>

    </SafeAreaView>
  );
};

export default VehicleSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    marginHorizontal: 15,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    height: 66,
  },
  dropdownText: {
    color: "#333",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    fontSize: 15,
    color: "#333",
  },
  uploadBox: {
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: "#FFCC00",
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  uploadText: {
    marginTop: 10,
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#FFCC00",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
     marginHorizontal:20,
    marginBottom:15
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily:font.MonolithRegular
   },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "80%",
    paddingVertical: 10,
    elevation: 6,
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#333",
  },
});
