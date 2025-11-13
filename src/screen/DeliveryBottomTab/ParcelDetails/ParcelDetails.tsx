import React, { useState }  from "react";
import { View, Text, StyleSheet, ImageBackground, TextInput, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import imageIndex from "../../../assets/imageIndex";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
 import CustomButton from "../../../compoent/CustomButton";
 import { useParcelDetails } from "./useParcelDetails";
import LoadingModal from "../../../utils/Loader";
import font from "../../../theme/font";
 
const ParcelDetails = () => {
 const {  
         isLoading,
    setIsLoading,
    requests,
    setRequests,
item,
navigation,
     makeOffer,
    fullImageUrl ,
    handleSendOffer ,
    amount, setAmount ,
    message, setMessage ,
    imgloading, setImgloading
    } = useParcelDetails()

  return (
    <View style={styles.container}>
      <StatusBarComponent />
        <LoadingModal visible ={isLoading}/>
      {item?.imageUrl ? (
        <ImageBackground
          source={{ uri: fullImageUrl }}
          style={styles.backgroundImage}
          resizeMode="cover"
         onLoadStart={() => setImgloading(true)}
        onLoadEnd={() => setImgloading(false)}
        >
          {imgloading && (
          <View style={{
              ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // optional dim effect
          }}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
          <CustomHeader label="Details" />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={imageIndex.Rectangle}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <CustomHeader label="Details" />
        </ImageBackground>
      )}

      <View style={styles.cardContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Pickup & Drop */}
          <View style={[styles.locationBox, { flexDirection: "row" }]}>
            <Image
              source={imageIndex?.Dots || { uri: "" }}
              style={{ width: 12, height: 88, marginRight: 10 }}
              resizeMode="contain"
            />
            <View style={{ flexDirection: "column" }}>
              <Text style={styles.locationTitle}>Pickup Location</Text>
              <Text style={styles.locationValue}>{item?.pickupLocation}</Text>

              <Text style={[styles.locationTitle, { marginTop: 10 }]}>
                Drop Location
              </Text>
              <Text style={styles.locationValue}>{item?.dropLocation}</Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.infoRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.input}>{item?.senderName}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Receiver Name</Text>
              <Text style={styles.input}>{item?.receiver?.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Postal Code</Text>
              <Text style={styles.input}>452001</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Receiver Phone Number</Text>
              <Text style={styles.input}>{item?.receiver?.mobileNumber}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Package Size</Text>
              <Text style={styles.input}>{item?.packageSize}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Consignment Type</Text>
              <Text style={styles.input}>{item?.consignmentType}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Shipment Type</Text>
              <Text style={styles.input}>{item?.shipmentType}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sender Name</Text>
              <Text style={styles.input}>{item?.senderName}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Home Address</Text>
            <Text style={styles.input}>{item?.senderAddress}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.inputContainer1}>
            <Text style={[styles.label, { marginLeft: 12 }]}>Amount</Text>
            <TextInput
              style={[styles.input, { marginLeft: 12 }]}
              keyboardType="numeric"
              placeholder="Enter Amount"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Message Input */}
          <View style={styles.inputContainer1}>
            <Text style={[styles.label, { marginLeft: 12 }]}>Message</Text>
            <TextInput
              style={[styles.input, { marginLeft: 12 }]}
              placeholder="Type Here"
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={{ marginBottom: 20 }}>
          <CustomButton
            title={isLoading ? "Sending..." : "Send"}
            onPress={handleSendOffer}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default ParcelDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    height: 250,
    justifyContent: "flex-start",
    marginTop: 45
  },
  backBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    alignSelf: "flex-start",
  },
  cardContainer: {
    flex: 1,
    marginTop: -30,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationBox: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
  },
  locationTitle: {
    fontWeight: "600",
    color: "#000",
    fontSize: 16,
  },
  locationValue: {
    fontSize: 12,
    color: "#808080",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#3B4051",
    marginBottom: 6,
    fontWeight: "700"
  },
  input: {
    color: "#808080",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
    marginBottom: 2,
    fontFamily:font.MonolithRegular
  },
  sendBtn: {
    backgroundColor: "#FFD700",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  sendText: {
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  input1: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#eee",
    fontSize: 13,
    color: "#000",
  },
  inputContainer1: {
    flex: 1,
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    borderRadius: 18,
    height: 70
  },
});