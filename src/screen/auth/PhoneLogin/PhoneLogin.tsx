// PhoneLoginScreen.js (updated modal part)
import React, { useState, useEffect } from "react";
import { 
  View, Text, Image,TextInput, TouchableOpacity, StyleSheet, 
   KeyboardAvoidingView, Platform, Modal, FlatList 
} from "react-native";
import CustomButton from "../../../compoent/CustomButton";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

const countries = [
    { name: "India", code: "IN", callingCode: "91", flag: "🇮🇳" },
    { name: "United States", code: "US", callingCode: "1", flag: "🇺🇸" },
    { name: "United Kingdom", code: "GB", callingCode: "44", flag: "🇬🇧" },
    { name: "Canada", code: "CA", callingCode: "1", flag: "🇨🇦" },
    { name: "Australia", code: "AU", callingCode: "61", flag: "🇦🇺" },
    { name: "Germany", code: "DE", callingCode: "49", flag: "🇩🇪" },
    { name: "France", code: "FR", callingCode: "33", flag: "🇫🇷" },
    { name: "Italy", code: "IT", callingCode: "39", flag: "🇮🇹" },
    { name: "Spain", code: "ES", callingCode: "34", flag: "🇪🇸" },
    { name: "Japan", code: "JP", callingCode: "81", flag: "🇯🇵" },
    { name: "China", code: "CN", callingCode: "86", flag: "🇨🇳" },
    { name: "Brazil", code: "BR", callingCode: "55", flag: "🇧🇷" },
    { name: "Mexico", code: "MX", callingCode: "52", flag: "🇲🇽" },
    { name: "South Korea", code: "KR", callingCode: "82", flag: "🇰🇷" },
    { name: "South Africa", code: "ZA", callingCode: "27", flag: "🇿🇦" },
    { name: "Russia", code: "RU", callingCode: "7", flag: "🇷🇺" },
    { name: "Argentina", code: "AR", callingCode: "54", flag: "🇦🇷" },
    { name: "Egypt", code: "EG", callingCode: "20", flag: "🇪🇬" },
    { name: "Nigeria", code: "NG", callingCode: "234", flag: "🇳🇬" },
    { name: "Pakistan", code: "PK", callingCode: "92", flag: "🇵🇰" }
  ];
  

const PhoneLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [callingCode, setCallingCode] = useState("91");
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const navgtaion  = useNavigation()

  useEffect(() => {
    if (searchText === "") {
      setFilteredCountries(countries);
    } else {
      const filtered = countries.filter((c) =>
        c.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCountries(filtered);
    }
  }, [searchText]);

  const handleSelectCountry = (country:any) => {
    setCountryCode(country.code);
    setCallingCode(country.callingCode);
    setModalVisible(false);
    setSearchText(""); // reset search
  };

  const handleContinue = () => {
    // naOtpScreen 
    navgtaion.navigate(ScreenNameEnum.OtpScreen)
    console.log(`Phone: +${callingCode} ${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
        <StatusBarComponent/>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={{
            justifyContent:"center" ,
            alignItems:"center" ,
            marginBottom:50
        }}>
        <Image source={imageIndex.phonLogoapp} 
          style={{
                height:80,
                width:141 ,
             }} />
            </View>
        <Text style={styles.title}>What's your phone number?</Text>
        <Text style={styles.subtitle}>We'll send you a code to verify it</Text>

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.countryPicker}>
            <Text style={styles.callingCode}>{" "} {callingCode} {" "}</Text>
            <Image source={imageIndex.dounArroww} 
            
            
            style={{
                height:22,
                width:22 ,
             }} 
            />
            <View style={{
                borderWidth:0.5 ,
                height:22,
                borderColor:"#FFCC00" ,
                marginLeft:5
             
            }}/>
           </TouchableOpacity>

          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholderTextColor={"black"}

          />
        </View>

 <View style={{
    marginTop:20
 }}>
        <CustomButton title={"Continue"} onPress={handleContinue} />
        </View>
        <TouchableOpacity>
          <Text style={styles.emailText}>Prefer to sign in with email?</Text>
        </TouchableOpacity>

        {/* Custom Country Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Country</Text>

              {/* Search Input */}
              <TextInput
                placeholder="Search country"
                value={searchText}
                onChangeText={setSearchText}
                style={styles.searchInput} 
                placeholderTextColor={"black"}
              />

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalItem} 
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={styles.countryText}>
                      {item.flag} {item.name} (+{item.callingCode})
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <Text style={{   fontFamily:font.MonolithRegular ,color:"black" ,fontSize:15 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PhoneLogin;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 12, paddingTop:45  },
  logo: { fontSize: 32, fontWeight: "bold", alignSelf: "center", marginBottom: 40 },
  title: {marginBottom:5, fontSize: 22, color:"black", fontFamily:font.MonolithRegular, textAlign: "center" },
  subtitle: {     fontFamily:font.MonolithRegular,
    fontSize: 14, textAlign: "center", color: "#9DB2BF", marginBottom: 30 , marginTop:10 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1.2, borderColor: "#FFCC00", borderRadius: 40, paddingHorizontal: 10, marginBottom: 20 },
  countryPicker: { marginRight: 5  ,alignItems:"center", flexDirection:"row"},
  callingCode: { fontSize: 16 ,color:"black",
    fontFamily:font.MonolithRegular
   },
  input: {  fontFamily:font.MonolithRegular, flex: 1, height: 50, fontSize: 16 ,marginLeft:5 ,color:"black"  },
  button: { backgroundColor: "#f1c40f", borderRadius: 25, paddingVertical: 15, marginBottom: 20 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16, textAlign: "center" },
  emailText: { color: "black", textAlign: "center", fontSize: 16, marginTop:20 ,fontFamily:font.MonolithRegular  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "80%", borderRadius: 10, maxHeight: "70%", padding: 20 },
  modalTitle: {   fontFamily:font.MonolithRegular, color:"black",fontSize: 18, fontWeight: "600", marginBottom: 10 },
  modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalClose: { marginTop: 10, alignItems: "center" },
  searchInput: {   fontFamily:font.MonolithRegular,borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 },
  countryText: { fontSize: 16 ,color:"black",    fontFamily:font.MonolithRegular
  }
});
