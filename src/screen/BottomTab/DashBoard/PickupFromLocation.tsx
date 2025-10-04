import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomDropdown from "../../../compoent/CustomDropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import font from "../../../theme/font";
import CustomButton from "../../../compoent/CustomButton";
 
const PickupFromLocation = () => {
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  // Dropdown data
  const shipmentTypeData = [
    { label: "Standard", value: "standard" },
    { label: "Express", value: "express" },
  ];
  const consignmentTypeData = [
    { label: "Document", value: "document" },
    { label: "Parcel", value: "parcel" },
  ];
  const deliveryTypeData = [
    { label: "Normal", value: "normal" },
    { label: "Fast", value: "fast" },
  ];

  const [packageSize, setPackageSize] = useState("500-1000");

  return (
    <SafeAreaView style={{
      flex:1,
      backgroundColor:"white"
    }}>
      <StatusBarComponent/>
      <CustomHeader label={"Back"}/>

    <ScrollView 
    showsVerticalScrollIndicator={false}
    style={styles.container}>
      {/* Pickup & Drop */}
      <Text style={styles.sectionTitle}>Pickup & Drop</Text>
      <TextInput 
                 placeholderTextColor={"#ADA4A5"}


      style={styles.input} placeholder="Add Pickup Location" />
      <TextInput  
                    placeholderTextColor={"#ADA4A5"}


      style={styles.input} placeholder="Add Drop Location" />

      {/* Shipment & Sender Details */}
      <Text style={styles.sectionTitle}>Shipment & Sender Details</Text>
      <CustomDropdown
        data={shipmentTypeData}
        placeholder="Shipment Type"
        onSelect={(val) => console.log(val)}
      />
      <TextInput  
                   placeholderTextColor={"#ADA4A5"}


      style={styles.input} placeholder="Sender Name" />
      <TextInput
        style={styles.input}
        placeholder="Sender Mobile Number"
        keyboardType="phone-pad"
        placeholderTextColor={"#ADA4A5"}

      />
      <TextInput 
        placeholderTextColor={"#ADA4A5"}

      style={styles.input} placeholder="Sender Address" />

      {/* Date & Time */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDate(true)}
      >
        <Text style={styles.placeholderText}>
          {pickupDate ? pickupDate.toDateString() : "Pickup Date"}
        </Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker
          value={pickupDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowDate(false);
            if (date) setPickupDate(date);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTime(true)}
      >
        <Text style={styles.placeholderText}>
          {pickupTime
            ? pickupTime.toLocaleTimeString()
            : "Pickup Time"}
        </Text>
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker
          value={pickupTime || new Date()}
          mode="time"
          display="default"
          onChange={(e, time) => {
            setShowTime(false);
            if (time) setPickupTime(time);
          }}
        />
      )}

      <CustomDropdown
        data={consignmentTypeData}
        placeholder="Consignment Type"
        onSelect={(val) => console.log(val)}
      />

      {/* Package Size */}
      <Text style={styles.sectionTitle}>Package Size</Text>
      <View style={styles.packageRow}>
        {["1 KG", "3KG-10KG", "10kG"].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.packageBox,
              packageSize === size && styles.selectedBox,
            ]}
            onPress={() => setPackageSize(size)}
          >
            <Text
              style={[
                styles.packageText,
                packageSize === size && styles.selectedText,
              ]}
            >
              {size} {" "}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delivery Type */}
      <CustomDropdown
        data={deliveryTypeData}
        placeholder="Delivery Type"
        onSelect={(val) => console.log(val)}
      />

      <TextInput 
                     placeholderTextColor={"#ADA4A5"}


      style={styles.input} placeholder="Price" keyboardType="numeric" />

      {/* Receiver Details */}
      <Text style={styles.sectionTitle}>Receiver Details</Text>
      <TextInput style={styles.input}  
      
      placeholderTextColor={"#ADA4A5"}

      placeholder="Receiver Name" />
      <TextInput
        style={styles.input}
        placeholder="Receiver Mobile Number"
        keyboardType="phone-pad"
        placeholderTextColor={"#ADA4A5"}

      />
      <TextInput style={styles.input} placeholder="Receiver Address" />
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Extra Message"
        multiline 
        placeholderTextColor={"#ADA4A5"}
      />

      {/* Submit Button */}
      <View style={{
        marginBottom:50,
        marginTop:11
      }}>
      <CustomButton title={"Submit"}  />
      </View>
       
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#fff",
     marginHorizontal:15
  },
  sectionTitle: {
    fontSize: 16,
     marginTop: 20,
    marginBottom: 10,
    color: "black",
    fontFamily:font.MonolithRegular
  },
  input: {
    height: 55,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    marginBottom: 15,
    justifyContent: "center",
    color:"#ADA4A5" ,
    fontFamily:font.MonolithRegular
  },
  placeholderText: {
    color: "#ADA4A5",
    fontSize: 15,
    fontFamily:font.MonolithRegular
  },
  packageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  packageBox: {
    width: "30%",
    paddingVertical: 40,
    borderWidth: 1.5,
    borderRadius: 20,
    borderColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginTop:11,
  },
  packageText: {
    fontSize: 14,
    color: "#333",
    fontFamily:font.MonolithRegular,

  },
  selectedBox: {
    borderColor: "#FFD600",
    backgroundColor: "#FFFBE6",
  },
  selectedText: {
    color: "#FFD600",
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: "#FFD600",
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
});

export default PickupFromLocation;
