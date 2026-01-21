import React, { useState } from "react";
import {
  View,
  Text,
   TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
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
 import { styles } from "./style";

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
 