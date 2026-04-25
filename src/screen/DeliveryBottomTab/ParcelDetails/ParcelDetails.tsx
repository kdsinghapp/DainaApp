


import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import imageIndex from "../../../assets/imageIndex";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import CustomButton from "../../../compoent/CustomButton";
import { useParcelDetails } from "./useParcelDetails";
import LoadingModal from "../../../utils/Loader";
import font from "../../../theme/font";
import { SafeAreaView } from "react-native-safe-area-context";
import { image_url } from "../../../Api";
import { errorToast, successToast } from "../../../utils/customToast";

// Status Constants
const STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  GOING_TO_PICKUP: 'going_to_pickup',
  PICKED_UP: 'picked_up',
  ON_THE_WAY: 'on_the_way',
  ARRIVING: 'arriving',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const STATUS_LABELS = {
  [STATUS.PENDING]: 'Pending',
  [STATUS.ASSIGNED]: 'Assigned',
  [STATUS.GOING_TO_PICKUP]: 'Going to Pickup',
  [STATUS.PICKED_UP]: 'Picked Up',
  [STATUS.ON_THE_WAY]: 'On the Way',
  // [STATUS.ARRIVING]: 'Arriving',
  [STATUS.DELIVERED]: 'Delivered',
  // [STATUS.COMPLETED]: 'Completed',
  [STATUS.CANCELLED]: 'Cancelled'
};

const STATUS_COLORS = {
  [STATUS.PENDING]: '#FF9500',
  [STATUS.ASSIGNED]: '#007AFF',
  [STATUS.GOING_TO_PICKUP]: '#5856D6',
  [STATUS.PICKED_UP]: '#34C759',
  [STATUS.ON_THE_WAY]: '#5AC8FA',
  // [STATUS.ARRIVING]: '#FF2D55',
  [STATUS.DELIVERED]: '#32D74B',
  // [STATUS.COMPLETED]: '#64D2FF',
  [STATUS.CANCELLED]: '#FF3B30'
};

const ParcelDetails = () => {
  const {
    isLoading,
    setIsLoading,
    requests,
    Phone, setPhoneNumber,
    setRequests,
    item,
    navigation,
    makeOffer,
    fullImageUrl,
    handleSendOffer,
    amount, setAmount,
    message, setMessage,
    imgloading, setImgloading,
    updateParcelStatus
  } = useParcelDetails();
  const [actionLoading, setActioLoading] = useState(false);
  // Get button configuration based on status - CORRECTED COLOR ACCESS
  const getButtonConfig = () => {
    const currentStatus = item?.deliveryStatus || item?.deliveryStatus;

    switch (currentStatus) {
      case STATUS.PENDING:
        return {
          title: "Send Offer",
          onPress: handleSendOffer,
          color: "#FFD700", // Golden color for offer
          icon: "send-outline",
          showInputs: true
        };

      case STATUS.ASSIGNED:
        return {
          title: "Start Pickup",
          onPress: () => handleStatusUpdate(STATUS.GOING_TO_PICKUP),
          color: STATUS_COLORS[STATUS.GOING_TO_PICKUP], // Fixed
          icon: "send-outline",
          showInputs: false
        };

      case STATUS.GOING_TO_PICKUP:
        return {
          title: "Mark as Picked Up",
          onPress: () => handleStatusUpdate(STATUS.PICKED_UP),
          color: STATUS_COLORS[STATUS.PICKED_UP], // Fixed
          icon: "cube-outline",
          showInputs: false
        };

      case STATUS.PICKED_UP:
        return {
          title: "Start Delivery",
          onPress: () => handleStatusUpdate(STATUS.ON_THE_WAY),
          color: STATUS_COLORS[STATUS.ON_THE_WAY], // Fixed
          icon: "navigate-outline",
          showInputs: false
        };

      // case STATUS.ON_THE_WAY:
      //   return {
      //     title: "Mark as Arriving",
      //     onPress: () => handleStatusUpdate(STATUS.ARRIVING),
      //     color: STATUS_COLORS[STATUS.ARRIVING], // Fixed
      //     icon: "location-outline",
      //     showInputs: false
      //   };

      case STATUS.ON_THE_WAY:
        return {
          title: "Mark as Delivered",
          onPress: () => handleStatusUpdate(STATUS.DELIVERED),
          color: STATUS_COLORS[STATUS.DELIVERED], // Fixed
          icon: "checkmark-circle-outline",
          showInputs: false
        };

      // case STATUS.DELIVERED:
      //   return {
      //     title: "Complete Order",
      //     onPress: () => handleStatusUpdate(STATUS.COMPLETED),
      //     color: STATUS_COLORS[STATUS.COMPLETED], // Fixed
      //     icon: "flag-outline",
      //     showInputs: false
      //   };

      case STATUS.DELIVERED:
        return {
          title: "Order Completed",
          onPress: null,
          color: STATUS_COLORS[STATUS.COMPLETED], // Fixed
          icon: "checkmark-done-outline",
          showInputs: false,
          disabled: true
        };

      case STATUS.CANCELLED:
        return {
          title: "Order Cancelled",
          onPress: null,
          color: STATUS_COLORS[STATUS.CANCELLED], // Fixed
          icon: "close-circle-outline",
          showInputs: false,
          disabled: true
        };

      default:
        return {
          title: "Send",
          onPress: handleSendOffer,
          color: "#FFD700",
          icon: "send-outline",
          showInputs: true
        };
    }
  };
  useEffect(() => {

  }, [item?.parcelId])
  // Handle status update
  const handleStatusUpdate = async (newStatus: any) => {
    console.log("newStatus", newStatus)
    try {
      if (newStatus == STATUS.PICKED_UP && pickupOtp == '') {
        Alert.alert('Please enter pickup OTP shared by customer')
        return;
      }
      if (newStatus == STATUS.DELIVERED && deliveryOtp == '') {
        Alert.alert('Please enter delivery OTP shared by customer')
        return;
      }
      // Call API to update status

      const result = await updateParcelStatus(item?.parcelId, newStatus, newStatus == STATUS.DELIVERED ? deliveryOtp : pickupOtp);
      console.log(result)
      if (result.status == 1) {
        successToast("Success")
        // Alert.alert("Success", `Status updated to ${STATUS_LABELS[newStatus]}`);
        navigation.goBack();
        // You might want to refresh the data here
      } else {
        errorToast(result.message ?? "Failed to update status")
        // Alert.alert("Error", result.message ?? "Failed to update status");
        // Alert.alert("Success", "Update Status Successfully");
      }
    } catch (error) {
      console.error("Status update error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
    }
  };

  // Handle cancel order
  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleStatusUpdate(STATUS.CANCELLED)
        }
      ]
    );
  };
  const [pickupOtp, setPickupOtp] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const buttonConfig = getButtonConfig();
  const canCancel = item?.deliveryStatus &&
    [STATUS.ASSIGNED, STATUS.GOING_TO_PICKUP, STATUS.PICKED_UP, STATUS.ON_THE_WAY].includes(item.deliveryStatus);

  const scrollToOfferSection = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 320);
    });
    return () => showSub.remove();
  }, []);


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent,]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <StatusBarComponent />
          <LoadingModal visible={isLoading} />


          {item?.imageUrl || item?.data?.imageUrl ? (
            <ImageBackground
              source={{
                uri: item?.data?.imageUrl
                  ? `${image_url}${item?.data?.imageUrl}`
                  : fullImageUrl,
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
              onLoadStart={() => setImgloading(true)}
              onLoadEnd={() => setImgloading(false)}
            >
              {imgloading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
              <View>
                <SafeAreaView edges={['top']} />
                <CustomHeader label="Parcel Details" />
              </View>
            </ImageBackground>
          ) : (
            <ImageBackground
              source={imageIndex.Rectangle}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <View  >
                <SafeAreaView edges={['top']} />
                <CustomHeader label="Parcel Details" />
              </View>
            </ImageBackground>
          )}

          <View style={styles.cardContainer}>
            {/* Pickup & Drop */}
            <View style={styles.locationBox}>
              <View style={styles.dotLine}>
                <View style={styles.dot} />
                <View style={styles.verticalLine} />
                <View style={[styles.dot, styles.bottomDot]} />
              </View>
              <View style={styles.locationDetails}>
                <View style={styles.locationItem}>
                  <Text style={styles.locationTitle}>Pickup Location</Text>
                  <Text style={styles.locationValue}>{item?.pickupLocation || item?.data?.pickup?.location || item?.pickup?.location || ""}</Text>
                </View>
                <View style={styles.locationItem}>
                  <Text style={styles.locationTitle}>Drop Location</Text>
                  <Text style={styles.locationValue}>{item?.dropLocation || item?.data?.drop?.location || item?.drop?.location || ''}</Text>
                </View>
              </View>
            </View>

            {item?.deliveryStatus === STATUS?.PENDING && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Parcel Information</Text>


                <Text style={styles.sectionTitle}>Price {item?.proposedPrice || item?.data?.price}

                </Text>



                <View style={styles.infoRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Sender Name</Text>
                    <Text style={styles.value}>{item?.senderName || item?.data?.sender?.name || item?.sender?.name || ''}  </Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Receiver Name</Text>
                    <Text style={styles.value}>{item?.receiver?.name || item?.data?.receiver?.name || item?.receiver?.name || ''}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Receiver Phone</Text>
                    <Text style={styles.value}>{item?.receiver?.mobileNumber || item?.data?.receiver?.phone || item?.senderPhone ||
                      ''}

                    </Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Package Size</Text>
                    <Text style={styles.value}>{item?.packageSize || item?.data?.packageSize || ''}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Consignment Type</Text>
                    <Text style={styles.value}>{item?.consignmentType || item?.data?.consignmentType || ''}</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Shipment Type</Text>
                    <Text style={styles.value}>{item?.shipmentType || item?.data?.shipmentType || ''}</Text>
                  </View>
                </View>
                {/* {item?.proposedPrice || item?.data?.proposedPrice &&
                  (
                    <View style={styles.infoRow}>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Price</Text>
                        <Text style={styles.value}>{item?.proposedPrice || item?.data?.proposedPrice || ''}</Text>
                      </View>
                      <View style={styles.inputContainer}>
                        <Text style={styles.label}>Delivery Type</Text>
                        <Text style={styles.value}>{item?.deliveryType || item?.data?.deliveryType || ''}</Text>
                      </View>
                    </View>
                  )
                } */}


                {/* <View style={styles.inputContainer}>
                  <Text style={styles.label}>Sender Address</Text>
                  <Text style={styles.value}>{item?.senderAddress || 'N/A'}</Text>
                </View> */}
              </View>
            )}

            {/* Offer Inputs (Only for pending status) */}
            {buttonConfig.showInputs && item?.deliveryStatus === STATUS.PENDING && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Make Offer</Text>

                <View style={styles.inputContainer1}>
                  <Text style={styles.inputLabel}>Amount ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="Enter Amount"
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor={'#999'}
                    onFocus={scrollToOfferSection}
                  />
                </View>

                <View style={styles.inputContainer1}>
                  <Text style={styles.inputLabel}>Message</Text>
                  <TextInput
                    style={[styles.textInput, styles.messageInput]}
                    placeholder="Type your message here..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    placeholderTextColor={'#999'}
                    onFocus={scrollToOfferSection}
                  />
                </View>
              </View>
            )}


            {item?.deliveryStatus === STATUS.GOING_TO_PICKUP && (
              <OtpSection
                label="Enter Pickup OTP shared by customer"
                value={pickupOtp}
                onChange={setPickupOtp}
              />
            )}

            {item?.deliveryStatus === STATUS.ON_THE_WAY && (
              <OtpSection
                label="Enter delivery OTP shared by customer"
                value={deliveryOtp}
                onChange={setDeliveryOtp}
              />
            )}

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {/* Main Action Button */}
              <CustomButton
                title={actionLoading ? "Processing..." : buttonConfig.title}
                onPress={buttonConfig.onPress}
                disabled={actionLoading || buttonConfig.disabled}
                style={{
                  backgroundColor: buttonConfig.color,
                  opacity: (actionLoading || buttonConfig.disabled) ? 0.6 : 1,

                }}
                txtcolor={'white'}
                icon={
                  <Icon
                    name={buttonConfig.icon}
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                }
              />

              {/* Cancel Button (for certain statuses) */}
              {canCancel && !buttonConfig?.disabled && (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: STATUS_COLORS[STATUS.CANCELLED] }]}
                  onPress={handleCancelOrder}
                  disabled={actionLoading}
                >
                  <Icon
                    name="close-circle-outline"
                    size={20}
                    color={STATUS_COLORS[STATUS.CANCELLED]}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.cancelButtonText, { color: STATUS_COLORS[STATUS.CANCELLED] }]}>
                    Cancel Order
                  </Text>
                </TouchableOpacity>
              )}

              {/* Status Progress Indicator */}
              {/* {item?.deliveryStatus && ![STATUS.DELIVERED, STATUS.CANCELLED].includes(item.deliveryStatus) && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    Next Step: {STATUS_LABELS[getNextStatus(item.deliveryStatus)]}
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${getProgressPercentage(item.deliveryStatus)}%`,
                          backgroundColor: STATUS_COLORS[item.deliveryStatus]
                        }
                      ]} 
                    />
                  </View>
                </View>
              )} */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};


const OtpSection = ({ label, value, onChange }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.inputContainer1}>
        <Text style={styles.inputLabel}>{label}</Text>

        <TextInput
          style={styles.textInput}
          keyboardType="numeric"
          placeholder="Enter OTP"
          maxLength={6}
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );
};


export default ParcelDetails;

const { height: WINDOW_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: WINDOW_HEIGHT + 200,
  },
  scrollPaddingBottom: {
    paddingBottom: Platform.OS === "ios" ? 460 : 400,
  },
  backgroundImage: {
    height: 300,
    justifyContent: "flex-start",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: -15,
    zIndex: 1,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cardContainer: {
    flex: 1,
    marginTop: -10,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  locationBox: {
    backgroundColor: "#FFFFFF", // pure white better shadow deta hai
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,

    // Border (optional soft look)
    borderColor: "#F0F0F0",

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 5, // 2 se increase karo

    flexDirection: "row",
  },
  dotLine: {
    width: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
  },
  bottomDot: {
    backgroundColor: '#007AFF',
  },
  verticalLine: {
    width: 2,
    height: 68,
    backgroundColor: '#D0D0D0',
    marginVertical: 5,
  },
  locationDetails: {
    flex: 1,
  },
  locationItem: {
    marginBottom: 15,
  },
  locationTitle: {
    fontFamily: font.MonolithRegular
    ,
    color: "#000",
    fontSize: 16,
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 12,
    color: "#808080",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: font.MonolithRegular
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
    fontFamily: font.MonolithRegular

  },
  value: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: font.MonolithRegular
  },
  inputContainer1: {
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    padding: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#3B4051",
    marginBottom: 8,
    fontFamily: font.MonolithRegular

  },
  textInput: {
    color: "#000",
    fontSize: 14,
    fontFamily: font.MonolithRegular,
    padding: 0,
  },
  messageInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  actionContainer: {
    marginBottom: 30,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 10,
    backgroundColor: '#FFF5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular

  },
  progressContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});