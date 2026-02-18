import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { useNavigation, useRoute } from '@react-navigation/native';
import LoadingModal from '../../../utils/Loader';
import imageIndex from '../../../assets/imageIndex';
import CustomButton from '../../../compoent/CustomButton';
import { GetApi, PostApi } from '../../../Api/apiRequest';
import { GOOGLE_MAPS_APIKEY, image_url } from '../../../Api';
import { STATUS, STATUS_COLORS, STATUS_LABELS } from '../../../utils/Constant';
import Icon from '../../../compoent/Icon';
import { color } from '../../../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import font from '../../../theme/font';
import MapViewDirections from 'react-native-maps-directions';
import { successToast } from '../../../utils/customToast';
import CustomHeader from '../../../compoent/CustomHeader';


const TripMap = () => {
  const [loading, setLoading] = useState(false)
  const route: any = useRoute()
  const { item, event } = route?.params || ""
  // console.log("pickupLon", event?.parcel?.pickupLat)
  // console.log("pickupLon", event?.parcel?.pickupLon)


  const parcelId = item?.parcelId
  const [actionLoading, setActionLoading] = useState(true);
  useEffect(() => {

  }, [route])
  const [parcel, setParcel] = useState(item)
  const [pickupOtp, setPickupOtp] = useState('');
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [driverCoords, setDriverCoords] = useState({
    latitude: 33.95,
    longitude: 117.4028,
  });
  const canCancel = item?.deliveryStatus &&
    [STATUS.PENDING, STATUS.ASSIGNED, STATUS.GOING_TO_PICKUP, STATUS.PICKED_UP, STATUS.ON_THE_WAY].includes(item.deliveryStatus);

  // Fetch current location on component mount
  useEffect(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        setDriverCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
    );
  }, []);
  useEffect(() => {
    // setActionLoading(true)
    getDetail()
  }, [])
  const getDetail = async () => {

    // console.log(`/parcels/${item?.parcelId}/statis`)
    const param = {
      url: `/delivery/my-offers/${parcelId}`
    }
    const res = await GetApi(param, setLoading)
    if (res.status == 1) {
      console.log("---")
      setParcel(res?.offer?.parcel)
    }
    setActionLoading(false)
    console.log(res, 'this is res')
  }


  const origin = {
    latitude: parseFloat(item?.departure_lat) || 0,
    longitude: parseFloat(item?.departure_lon) || 0,
  };
  const destination = { latitude: parseFloat(item?.arrival_lat), longitude: parseFloat(item?.arrival_lon) }; // Indore MP
  const driver = { latitude: parseFloat(item?.departure_lat), longitude: parseFloat(item?.departure_lon) };

  const navigation = useNavigation()
  const getButtonConfig = () => {
    const currentStatus = item?.deliveryStatus;
    console.log("currentStatus", currentStatus)
    switch (currentStatus) {
      // case STATUS.PENDING:
      //   return {
      //     title: "Send Offer",
      //     onPress: handleSendOffer,
      //     color: "#FFD700", // Golden color for offer
      //     icon: "send-outline",
      //     showInputs: true
      //   };

      case STATUS.ASSIGNED:
        return {
          title: "Start Pickup",
          onPress: () => handleStatusUpdate(STATUS.GOING_TO_PICKUP),
          color: STATUS_COLORS[STATUS.GOING_TO_PICKUP], // Fixed
          icon: "car-outline",
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
          title: "Send Offer",
          onPress: null,
          color: "#FFD700", // Golden color for offer
          icon: "send-outline",
          showInputs: true
        };
      // {
      //   title: "Send",
      //   onPress: handleSendOffer,
      //   color: "#FFD700",
      //   icon: "send-outline",
      //   showInputs: true
      // };
    }
  };
  const DEFAULT_LAT = 22.7176;
  const DEFAULT_LNG = 75.8577;

  /** Ensures native map gets a number; API often returns string or null. */
  const safeNum = (v: unknown, fallback: number): number => {
    if (v == null) return fallback;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) ? n : fallback;
  };

  // Latitude = lat, longitude = lon. Always numbers so AIRMapMarker never gets String.
  const pickup = {
    latitude: safeNum(parcel?.pickupLat ?? parcel?.pickupLocationLat, DEFAULT_LAT),
    longitude: safeNum(parcel?.pickupLon ?? parcel?.pickupLocationLon, DEFAULT_LNG),
  };
  const dropoff = {
    latitude: safeNum(parcel?.dropLat || parcel.dropLocationLat, DEFAULT_LAT),
    longitude: safeNum(parcel?.dropLon || parcel.dropLocationLon, DEFAULT_LNG),
  };

  const [currentCoords, setCurrentCoords] = useState(driverCoords);

  useEffect(() => {
    setCurrentCoords(driverCoords);
  }, [driverCoords.latitude, driverCoords.longitude]);

  const driverCoordinate = {
    latitude: safeNum(driverCoords.latitude, DEFAULT_LAT),
    longitude: safeNum(driverCoords.longitude, DEFAULT_LNG),
  };

  const buttonConfig = getButtonConfig();
  const updateParcelStatus = async (orderId, newStatus, otp) => {
    // Implement your API call here
    const token = await AsyncStorage.getItem('token');
    const body = {
      otp: otp ?? '',
      // order_id: orderId,
      newStatus: newStatus
    };
    console.log(body, orderId)
    const param = {
      url: `/delivery/parcels/${orderId}/status`,
      data: body,
      token,
      isFormData: true
    }
    return await PostApi(param, setActionLoading);
  };
  useEffect(() => {

  }, [item])
  const handleStatusUpdate = async (newStatus: any) => {
    try {
      setActionLoading(true);
      if (newStatus == STATUS.PICKED_UP && pickupOtp == '') {
        Alert.alert('Please enter pickup OTP shared by customer')
        return;
      }
      if (newStatus == STATUS.DELIVERED && deliveryOtp == '') {
        Alert.alert('Please enter delivery OTP shared by customer')
        return;
      }

      const result = await updateParcelStatus(item?.parcelId || item.id, newStatus, newStatus == STATUS.DELIVERED ? deliveryOtp : pickupOtp);
      console.log(result)
      if (result.status == 1) {
        successToast(`Success, Status updated to ${STATUS_LABELS[newStatus]}`)
        navigation.goBack();
        // You might want to refresh the data here
      } else {
        Alert.alert("Error", result.message ?? "Failed to update status");
        // Alert.alert("Success", "Update Status Successfully");
      }
    } catch (error) {
      console.error("Status update error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      {loading && <LoadingModal />}

      {/* <MapView
  provider="google"
  style={{ flex: 1 }}
  initialRegion={{
    latitude: parseFloat(item?.departure_lat) || 0,
    longitude: parseFloat(item?.departure_lon) || 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker coordinate={origin} pinColor="green" />
  <Marker coordinate={destination} pinColor="red" />
  <Marker coordinate={driver}>
    <Image
      source={imageIndex.cars}
      style={{ width: 40, height: 40 }}
      resizeMode="contain"
    />
  </Marker>
</MapView> */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={[styles.mapView, Platform.OS === 'ios' && { height: Dimensions.get('window').height }]}
        initialRegion={{
          latitude: 22.7028931,
          longitude: 75.8715823,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* <Marker coordinate={{ latitude: 28.6139, longitude: 77.209 }} /> */}
        {!actionLoading &&
          <MapViewDirections
            origin={currentCoords} // Must be a plain object
            destination={item?.parcel?.deliveryStatus === "assigned" ? pickup : dropoff}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={4}
            strokeColor={item?.parcel?.deliveryStatus === "assigned" ? "#2196F3" : "#FFCC00"}
            onReady={(res) => {
              console.log(res, "map res");
              // setDistance(res?.distance);
              // setEta(`${Math.ceil(res.duration)} mins`);
            }}
          />
        }
        {!actionLoading &&
          <Marker coordinate={pickup} title="Pickup Point">
            <View style={[styles.dotMarker, { backgroundColor: "#4CAF50" }]} />
          </Marker>
        }
        {!actionLoading &&
          <Marker coordinate={dropoff} title="Drop-off Point">
            <View style={[styles.dotMarker, { backgroundColor: "#F44336" }]} />
          </Marker>
        }
        {!actionLoading && (
          <Marker
            key="driver-marker"
            coordinate={driverCoordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.courierMarker}>
              <Image source={imageIndex.deliver} style={styles.courierImage} />
            </View>
          </Marker>
        )}
      </MapView>


      {/* Pickup/Drop Info Card */}
      <View style={styles.infoCard} >
        <TouchableOpacity style={styles.locationRow}
        // onPress={()=>setLocationModal(true)}
        >
          <Image source={imageIndex.trck} style={{
            height: 22,
            width: 22
          }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item?.pickupLocation || "35 Oak Ave. Antioch, TN 37013"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationRow}
        //  onPress={()=>setLocationModal(true)}
        >

          <Image source={imageIndex.trck} style={{
            height: 22,
            width: 22
          }} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item?.dropLocation || "New Palasia, Indore, Madhya...."}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Driver Card */}
      <View style={styles.driverCard}>
        {/* {!end &&
          <>
            <Text style={styles.arrivingText}>Driver is Arriving...</Text>
            <Text style={styles.timeText}>2 ss</Text>
            <View style={styles.seprator} />
          </>
        } */}

        <View style={styles.driverRow}>
          {item?.user?.image ? (
            <Image
              source={{
                uri: item?.user?.image || item?.user?.imagem ? item?.user?.image : item?.user?.image,
              }}
              style={styles.avatar}
            />

          ) : (
            <Image
              source={{
                uri: item?.user?.image || event?.sender.profileImage ? event?.sender.profileImage : event?.sender.profileImage,
              }}
              style={styles.avatar}
            />

          )}

          <View>
            {/* <Text style={styles.driverName}>Marcus Aminoff</Text> */}
            <Text style={styles.driverName}>{item?.user?.firstName || event?.sender.name || ""}</Text>
            <Text style={styles.carDetails}>{item?.user?.phone}</Text>
            <Text style={styles.carDetails}>{item?.patient_details?.mobile_number}</Text>
          </View>
          {/* {end &&
            <Text style={[styles.timeText, { right: 0 }]}>2 xxx</Text>
          } */}
        </View>

        <View style={styles.buttonRow}>

          <TouchableOpacity onPress={() =>
            Alert.alert(
              "Confirmation",
              "Are you sure you want to cancel?",
              [
                {
                  text: "No",
                  style: "cancel",
                  onPress: () => console.log("User chose No"),
                },
                {
                  text: "Yes",
                  onPress: () => {
                    console.log("User chose Yes");
                    handleStatusUpdate(STATUS.CANCELLED);
                  },
                },
              ],
              { cancelable: false }
            )
          }>
            <Image source={imageIndex.Closed} style={styles.iconBtn} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            let url = `tel:${item?.user?.phobe}`;
            Linking.openURL(url);
          }}>
            <Image source={imageIndex.Calblack} style={styles.iconBtn} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            let url = `sms:${item?.user?.phone || event?.sender.phone}`;
            Linking.openURL(url);
          }}>
            <Image source={imageIndex.MessageBlack} style={styles.iconBtn} />
          </TouchableOpacity>
        </View>
        {/* {end && */}
        {/* <CustomButton onPress={Submit} title={"Finish"} /> */}
        {/* } */}

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

        <CustomButton
          title={actionLoading ? "Processing..." : buttonConfig.title}
          onPress={buttonConfig.onPress}
          disabled={actionLoading || buttonConfig.disabled}
          style={{
            // backgroundColor: buttonConfig.color,
            backgroundColor: color.primary,
            opacity: (actionLoading || buttonConfig.disabled) ? 0.6 : 1,

          }}
          // txtcolor={'white'}
          icon={
            <Icon
              name={buttonConfig.icon}
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
          }
        />
      </View>

      {/* <LocationPicker
      visible={locationModal}
      apiKey={MapApiKey}// replace with actual key
      onClose={() => setLocationModal(false)}
      onSumit={handleModalSubmit}
      onLocationSelected={handleLocationSelected}
    />
    <LocationPicker
      visible={locationModal2}
      apiKey={MapApiKey}// replace with actual key
      onClose={() => setLocationModal(false)}
      onSumit={handleModalSubmit2}
      onLocationSelected={handleLocationSelected2}
    /> */}
    </View>
  );
};
const OtpSection = ({ label, value, onChange }: any) => {
  return (
    <View>
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
export default TripMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoCard: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: "#F7F8F8",
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 10

  },
  locationText: {
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    // marginRight:5
    flex: 1
  },
  driverCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: '#fff',
    elevation: 10,
  },
  arrivingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timeText: {
    position: 'absolute',
    right: 20,
    top: 20,
    color: '#888',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
  },
  carDetails: {
    color: '#aaa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 15,
    marginBottom: 25
  },
  iconBtn: {
    width: 50,
    height: 50,
    // backgroundColor: '#00BFA5',
    // borderRadius: 25,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  seprator: {
    height: 0.7,
    marginVertical: 5,
    marginTop: 15,
    width: '100%',
    backgroundColor: "grey"
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
    fontWeight: "700"
  },
  textInput: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: font.MonolithRegular,
    padding: 0,
  },
  dotMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "white",
  },
  courierMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFCC00",
  },
  courierImage: { width: 30, height: 30, resizeMode: "contain" },
  mapView: {
    flex: 1,
    width: '100%',
  },

});
