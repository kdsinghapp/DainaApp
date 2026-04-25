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
import strings from "../../../localization/Localization";

const VehicleSetupScreen = () => {
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<any>();
  const vehicleOptions = [
    { label: strings.Car, value: "Car" },
    { label: strings.Bike, value: "Bike" },
    { label: strings.Van, value: "Van" },
    { label: strings.Truck, value: "Truck" }
  ];

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

  const handleContinue = async () => {
    if (!vehicleType?.trim()) {
      errorToast(strings.SelectVehicleTypeError);
      return;
    }
    if (!vehicleNumber?.trim()) {
      errorToast(strings.EnterVehicleNumberError);
      return;
    }

    if (!vehicleRegistration) {
      errorToast(strings.UploadVehicleRegistrationError);
      return;
    }
    const params = {
      vehicleType,
      vehicleNumber,
      vehicleRegistration,
    };
    const response = await DeliveryVehicleDocument(params, setIsLoading);
    if (response?.status == "1") {
      navigation.replace(ScreenNameEnum.BankSetupScreen);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label={strings.VehicleSetup} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}>
        
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownText, !vehicleType && { color: "#999" }]}>
            {vehicleType ? (vehicleOptions.find(o => o.value === vehicleType)?.label || vehicleType) : strings.SelectVehicleType}
          </Text>
          <Image
            source={imageIndex.dounArroww}
            style={{ height: 18, width: 18 }}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={strings.EnterVehicleNumber}
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          placeholderTextColor="#999"
        />

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
              : strings.UploadVehicleRegistration}
          </Text>
        </TouchableOpacity>

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
                      setVehicleType(item.value);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value}
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
          <Text style={styles.buttonText}>{strings.SaveAndContinue}</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VehicleSetupScreen;