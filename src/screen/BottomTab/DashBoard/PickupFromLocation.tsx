import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomDropdown from "../../../compoent/CustomDropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import font from "../../../theme/font";
import CustomButton from "../../../compoent/CustomButton";
import AddressModalInput from "../../../compoent/AutocompleteData";
import { errorToast, successToast } from "../../../utils/customToast";
import LoadingModal from "../../../utils/Loader";
import { AddParcelApi } from "../../../Api/apiRequest";
import { useNavigation } from "@react-navigation/native";
import imageIndex from "../../../assets/imageIndex";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ImagePickerModal from "../../../compoent/ImagePickerModal";
import ScreenNameEnum from "../../../routes/screenName.enum";
 
const PickupFromLocation = () => {
  const navgatoon = useNavigation()
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [shipmentType, setShipmentType] = useState("");
  const [consignmentType, setConsignmentType] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupLat, setpickupLat] = useState<{ latitude: number; longitude: number } | null>(null);
  const [droplat, sedroplat] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropLocation, setDropLocation] = useState("");
  const [pickupModal, setPickupModal] = useState(false);
  const [dropModal, setDropModal] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderMobile, setSenderMobile] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverMobile, setReceiverMobile] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [extraMessage, setExtraMessage] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<any>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pickImageFromGallery = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        setIsModalVisible(false);
      }
    });
  };
  // Validation states
  const [errors, setErrors] = useState({
    pickupLocation: "",
    dropLocation: "",
    shipmentType: "",
    senderName: "",
    senderMobile: "",
    senderAddress: "",
    pickupDate: "",
    pickupTime: "",
    consignmentType: "",
    deliveryType: "",
    price: "",
    receiverName: "",
    receiverMobile: "",
    receiverAddress: "",
  });

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

  // Validation functions
  const validateField = (fieldName: string, value: string) => {
    let error = "";

    switch (fieldName) {
      case "senderName":
      case "receiverName":
        if (!value.trim()) error = "This field is required";
        else if (value.trim().length < 2) error = "Name must be at least 2 characters";
        break;
      
      case "senderMobile":
      case "receiverMobile":
        if (!value.trim()) error = "Mobile number is required";
        // else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) error = "Enter a valid 10-digit mobile number";
        break;
      
      case "senderAddress":
      case "receiverAddress":
      case "pickupLocation":
      case "dropLocation":
        if (!value.trim()) error = "This field is required";
        break;
      
      case "price":
        if (!value.trim()) error = "Price is required";
        else if (isNaN(Number(value)) || Number(value) <= 0) error = "Enter a valid price";
        break;
      
      case "shipmentType":
      case "consignmentType":
      case "deliveryType":
        if (!value) error = "Please select an option";
        break;
      
      case "pickupDate":
        if (!value) error = "Pickup date is required";
        break;
      
      case "pickupTime":
        if (!value) error = "Pickup time is required";
        break;
      
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [fieldName]: error }));
    return error === "";
  };

  const validateForm = () => {
    const fieldsToValidate = {
      pickupLocation,
      dropLocation,
      shipmentType,
      senderName,
      senderMobile,
      senderAddress,
      pickupDate: pickupDate ? "hasValue" : "",
      pickupTime: pickupTime ? "hasValue" : "",
      consignmentType,
      deliveryType,
      price,
      receiverName,
      receiverMobile,
      
      receiverAddress,
    };

    let isValid = true;

    Object.entries(fieldsToValidate).forEach(([fieldName, value]) => {
      if (!validateField(fieldName, value)) {
        isValid = false;
      }
    });

    return isValid;
  };
   
const handleSubmit = async () => {
  if (validateForm()) {
    console.log("Form submitted successfully!");

    const formDataObj = {
      shipmentType,
      senderName,
      senderMobile,
      senderAddress,
      pickupDate,
      pickupTime,
      consignmentType,
      packageSize,
      deliveryType,
      price,
      receiverName,
      receiverMobile,
      receiverAddress,
      extraMessage,
      pickupLat,
      droplat  ,
      pickupLocation ,
      dropLocation ,
      image
    };
 
    const response = await AddParcelApi(formDataObj, setIsLoading);
 
    if (response && response.status == "1") {
      console.log("response",response)
       navgatoon.navigate(ScreenNameEnum.RequestLoading,{
        parcelId: response,
       })
      successToast("Pickup request submitted successfully!");
    }
  } else {
    console.log("Form has validation errors");

    const firstErrorField = Object.keys(errors).find(key => errors[key]);
    if (firstErrorField) {
      console.log(`First error in: ${firstErrorField}`);
      // scrollToErrorField(firstErrorField);
    }

    errorToast("Please fill all required fields correctly");
  }
};



  const handleInputChange = (fieldName: string, value: string) => {
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }

    // Update the corresponding state
    switch (fieldName) {
      case "senderName":
        setSenderName(value);
        break;
      case "senderMobile":
        setSenderMobile(value);
        break;
      case "senderAddress":
        setSenderAddress(value);
        break;
      case "receiverName":
        setReceiverName(value);
        break;
      case "receiverMobile":
        setReceiverMobile(value);
        break;
      case "receiverAddress":
        setReceiverAddress(value);
        break;
      case "price":
        setPrice(value);
        break;
      default:
        break;
    }
  };

  const handleDropdownSelect = (fieldName: string, value: string) => {
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }

    switch (fieldName) {
      case "shipmentType":
        setShipmentType(value);
        break;
      case "consignmentType":
        setConsignmentType(value);
        break;
      case "deliveryType":
        setDeliveryType(value);
        break;
      default:
        break;
    }
  };

  const handleLocationSelect = (type: 'pickup' | 'drop', item: any) => {
     const fieldName = type === 'pickup' ? 'pickupLocation' : 'dropLocation';
    
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: "" }));
    }

    if (type === 'pickup') {
      // setPickupLocation(item.address || item.name || "Pickup Location");
      setpickupLat({
        latitude: item.latitude,
        longitude: item.longitude,
      });
    } else {
      // setDropLocation(item.address || item.name || "Drop Location");
      sedroplat({
        latitude: item.latitude,
        longitude: item.longitude,
      });
    }
  };
  const takePhotoFromCamera = () => {
    launchCamera({ mediaType: "photo" }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
        setIsModalVisible(false);
      }
    });
  };
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: "white"
    }}>
      <StatusBarComponent />
      <CustomHeader label={"Create Parcel"} />
                                        <LoadingModal visible ={isLoading}/>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        {/* Pickup & Drop */}
        <Text style={styles.sectionTitle}>Pickup & Drop</Text>
        
        <TouchableOpacity 
          onPress={() => setPickupModal(true)}
          style={[styles.input, errors.pickupLocation ? styles.inputError : null]}
        >
          <Text style={{
            color: pickupLocation ? "black" : "#ADA4A5",
            fontSize: 15,
            fontFamily: font.MonolithRegular ,
            flex:1
          }}>
            {pickupLocation ? pickupLocation : "Add Pickup Location"}
          </Text>
           <Image style={{
            height:22,
            width:22,
            resizeMode:"contain"
          }} source={imageIndex.location1} />
        </TouchableOpacity>
        {errors.pickupLocation ? <Text style={styles.errorText}>{errors.pickupLocation}</Text> : null}

        <TouchableOpacity
          onPress={() => setDropModal(true)}
          style={[styles.input, errors.pickupLocation ? styles.inputError : null]}
        >
          <Text style={{
            color: dropLocation ? "black" : "#ADA4A5",
            fontSize: 15,
            fontFamily: font.MonolithRegular ,
                            flex:1

          }}>
            {dropLocation ? dropLocation : "Add Drop Location"}
          </Text>
          <Image style={{
            height:22,
            width:22,
            resizeMode:"contain"
          }} source={imageIndex.location1} />
        </TouchableOpacity>
        {errors.dropLocation ? <Text style={styles.errorText}>{errors.dropLocation}</Text> : null}

        {/* Shipment & Sender Details */}
        <Text style={styles.sectionTitle}>Shipment & Sender Details</Text>
        
        <CustomDropdown
          data={shipmentTypeData}
          placeholder="Shipment Type"
          onSelect={(value) => handleDropdownSelect("shipmentType", value)}
         />
        {errors.shipmentType ? <Text style={styles.errorText}>{errors.shipmentType}</Text> : null}

        <TextInput  
          placeholderTextColor={"#ADA4A5"}
          value={senderName}
          onChangeText={(value) => handleInputChange("senderName", value)}
          style={[styles.input, errors.senderName ? styles.inputError : null]} 
          placeholder="Sender Name" 
        />
        {errors.senderName ? <Text style={styles.errorText}>{errors.senderName}</Text> : null}

        <TextInput
          style={[styles.input, errors.senderMobile ? styles.inputError : null]}
          placeholder="Sender Mobile Number"
          keyboardType="phone-pad"
          placeholderTextColor="#ADA4A5"
          value={senderMobile}
          onChangeText={(value) => handleInputChange("senderMobile", value)}
          maxLength={10}
        />
        {errors.senderMobile ? <Text style={styles.errorText}>{errors.senderMobile}</Text> : null}

        <TextInput 
          placeholderTextColor={"#ADA4A5"}
          value={senderAddress}
          onChangeText={(value) => handleInputChange("senderAddress", value)}
          style={[styles.input, errors.senderAddress ? styles.inputError : null]} 
          placeholder="Sender Address" 
        />
        {errors.senderAddress ? <Text style={styles.errorText}>{errors.senderAddress}</Text> : null}

        <TouchableOpacity
          style={[styles.input, errors.pickupDate ? styles.inputError : null]}
          onPress={() => setShowDate(true)}
        >
          <Text style={styles.placeholderText}>
            {pickupDate ? pickupDate.toDateString() : "Pickup Date"}
          </Text>
        </TouchableOpacity>
        {errors.pickupDate ? <Text style={styles.errorText}>{errors.pickupDate}</Text> : null}

        {showDate && (
          <DateTimePicker
            value={pickupDate || new Date()}
            mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(e, date) => {
              setShowDate(false);
              if (date) {
                setPickupDate(date);
                if (errors.pickupDate) {
                  setErrors(prev => ({ ...prev, pickupDate: "" }));
                }
              }
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.input, errors.pickupTime ? styles.inputError : null]}
          onPress={() => setShowTime(true)}
        >
          <Text style={styles.placeholderText}>
            {pickupTime
              ? pickupTime.toLocaleTimeString()
              : "Pickup Time"}
          </Text>
        </TouchableOpacity>
        {errors.pickupTime ? <Text style={styles.errorText}>{errors.pickupTime}</Text> : null}

        {showTime && (
          <DateTimePicker
            value={pickupTime || new Date()}
            mode="time"
          display={Platform.OS === "ios" ? "inline" : "default"}
            onChange={(e, time) => {
              setShowTime(false);
              if (time) {
                setPickupTime(time);
                if (errors.pickupTime) {
                  setErrors(prev => ({ ...prev, pickupTime: "" }));
                }
              }
            }}
          />
        )}

        <CustomDropdown
          data={consignmentTypeData}
          placeholder="Consignment Type"
          onSelect={(value) => handleDropdownSelect("consignmentType", value)}
         />
        {errors.consignmentType ? <Text style={styles.errorText}>{errors.consignmentType}</Text> : null}

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
                {size}{" "}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Type */}
        <CustomDropdown
          data={deliveryTypeData}
          placeholder="Delivery Type"
          onSelect={(value) => handleDropdownSelect("deliveryType", value)}
         />
        {errors.deliveryType ? <Text style={styles.errorText}>{errors.deliveryType}</Text> : null}

        <TextInput 
          placeholderTextColor={"#ADA4A5"}
          value={price}
          onChangeText={(value) => handleInputChange("price", value)}
          style={[styles.input, errors.price ? styles.inputError : null]} 
          placeholder="Price" 
          keyboardType="numeric" 
        />
        {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}

        {/* Receiver Details */}
        <Text style={styles.sectionTitle}>Receiver Details</Text>
        
        <TextInput 
          style={[styles.input, errors.receiverName ? styles.inputError : null]}  
          placeholderTextColor={"#ADA4A5"}
          value={receiverName}
          onChangeText={(value) => handleInputChange("receiverName", value)}
          placeholder="Receiver Name" 
        />
        {errors.receiverName ? <Text style={styles.errorText}>{errors.receiverName}</Text> : null}

        <TextInput
          style={[styles.input, errors.receiverMobile ? styles.inputError : null]}
          placeholder="Receiver Mobile Number"
          keyboardType="phone-pad"
          placeholderTextColor={"#ADA4A5"}
          value={receiverMobile}
          onChangeText={(value) => handleInputChange("receiverMobile", value)}
          maxLength={10}
        />
        {errors.receiverMobile ? <Text style={styles.errorText}>{errors.receiverMobile}</Text> : null}

        <TextInput 
          style={[styles.input, errors.receiverAddress ? styles.inputError : null]} 
          placeholder="Receiver Address" 
          placeholderTextColor={"#ADA4A5"}
          value={receiverAddress}
          onChangeText={(value) => handleInputChange("receiverAddress", value)}
        />
        {errors.receiverAddress ? <Text style={styles.errorText}>{errors.receiverAddress}</Text> : null}

        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Extra Message"
          multiline 
          placeholderTextColor={"#ADA4A5"}
          value={extraMessage}
          onChangeText={setExtraMessage}
        />
        {image?.uri ? (
          <TouchableOpacity  

onPress={()=>{
  setIsModalVisible(true)
}}
          style={{
  borderWidth:1 ,
  padding:30 ,
  alignItems:"center" ,
  borderRadius:10,
  borderColor:"#EAEAEA" ,
  borderStyle:"dotted" ,marginTop:5,
  marginBottom:11

}}
          >
           <Image
              source={image ? { uri: image?.uri || image } : imageIndex.prfile}
               resizeMode="cover" 
               style={{
                height:150,
                width:150 ,
                borderRadius:10 ,
                resizeMode:"contain"
               }}
            />
            </TouchableOpacity>
        ):(
<TouchableOpacity  

onPress={()=>{
  setIsModalVisible(true)
}}
style={{
  borderWidth:1 ,
  padding:30 ,
  alignItems:"center" ,
  borderRadius:10,
  borderColor:"#EAEAEA" ,
  borderStyle:"dotted" ,marginTop:5,
  marginBottom:11

}}>

          <Text style={{
            fontSize:18,
            fontFamily:font.MonolithRegular ,
            color: "#ADA4A5"
          }}>Add Parcel Image +</Text>
          </TouchableOpacity>
        )}


        {/* Submit Button */}
        <View style={{
          marginBottom: 50,
          marginTop: 11
        }}>
          <CustomButton title={"Send Request"} onPress={handleSubmit} />
        </View>
      </ScrollView>

      <AddressModalInput
        value={pickupLocation}
        modalVisible={pickupModal}
        setModalVisible={() => setPickupModal(false)}
        onChange={setPickupLocation}
        onSelect={(item: any) => handleLocationSelect('pickup', item)}
        placeholder="Select Pickup Address"
      />
      <AddressModalInput
        value={dropLocation}
        modalVisible={dropModal}
        setModalVisible={() => setDropModal(false)}
        onChange={setDropLocation}
        onSelect={(item: any) => handleLocationSelect('drop', item)}
        placeholder="Select Drop Address"
      />
         <ImagePickerModal
                  modalVisible={isModalVisible}
                  setModalVisible={setIsModalVisible}
                  pickImageFromGallery={pickImageFromGallery}
                  takePhotoFromCamera={takePhotoFromCamera}
                />
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
    justifyContent: "space-between",
    color:"black" ,
    fontFamily:font.MonolithRegular,
    fontSize:15 ,
    flexDirection:"row",
    alignItems:"center",
    
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: font.MonolithRegular,
  },
});

export default PickupFromLocation;
