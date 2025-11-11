import React, { useEffect, useRef, useState } from 'react';
import {
View,
Text,
StyleSheet,
Dimensions,
Image,
TouchableOpacity,
Linking,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { useNavigation, useRoute } from '@react-navigation/native';
import LoadingModal from '../../../utils/Loader';
import imageIndex from '../../../assets/imageIndex';
import CustomButton from '../../../compoent/CustomButton';


const { width, height } = Dimensions.get('window');

const TripMap = () => {
const [loading, setLoading] = useState(false)
 const route:any = useRoute()
const item = route?.params || ""
console.log("item",item)
console.log(item, "item in msp")
const Submit = async () => {
    navigation.replace(ScreenNameEnum.DeliveryTabNavigator)

  // const param = {
  //   id: item?.user_id,
  //   bookingId: item?.id,
  //   status: "Done"
  // }
  // setLoading(true)
  // await ChangeTripStatusApi(param, setLoading)
   //  navigation.navigate(ScreenNameEnum.CaptureDoc) 
}
const origin = {
  latitude: parseFloat(item?.departure_lat) || 0,
  longitude: parseFloat(item?.departure_lon) || 0,
};
const destination = { latitude: parseFloat(item?.arrival_lat), longitude: parseFloat(item?.arrival_lon) }; // Indore MP
const driver = { latitude: parseFloat(item?.departure_lat), longitude: parseFloat(item?.departure_lon) };
// const [locationModal, setLocationModal] = useState(false);
// const [selectedAddress, setSelectedAddress] = useState(item?.departure_address);
// const [selectedAddress2, setSelectedAddress2] = useState(item?.arrival_address);
// const [locationModal2, setLocationModal2] = useState(false);
const [end, setEnd] = useState(false)
const navigation = useNavigation()
const mapRef = useRef(null)
// const handleLocationSelected = (location: { latitude: number, longitude: number, address: string }) => {
//   setSelectedAddress(location);
//   handleModalSubmit()
// };
// const handleModalSubmit = () => {
//   setLocationModal(false);
// };

// const handleLocationSelected2 = (location: { latitude: number, longitude: number, address: string }) => {
//   setSelectedAddress2(location);
//   handleModalSubmit2()
// };
// const handleModalSubmit2 = () => {
//   setLocationModal(false);
// };

// const routeCoordinates = [
//   origin,
//   { latitude: 30, longitude: -90 },
//   { latitude: 25, longitude: -80 },
//   destination,
// ];

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
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>
  <Marker coordinate={{ latitude: 28.6139, longitude: 77.209 }} />
</MapView>


    {/* Pickup/Drop Info Card */}
    <View style={styles.infoCard} >
      <TouchableOpacity style={styles.locationRow}
      // onPress={()=>setLocationModal(true)}
      >
     <Image source={imageIndex.trck} style={{
      height:22,
      width:22
     }}  />  
        <Text style={styles.locationText}>
          {item?.departure_address}35 Oak Ave. Antioch, TN 37013
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.locationRow}
      //  onPress={()=>setLocationModal(true)}
      >

<Image source={imageIndex.trck} style={{
      height:22,
      width:22
     }}  /> 
        <Text style={styles.locationText}>
          {item?.arrival_address} New Palasia, Indore, Madhya....
        </Text>
      </TouchableOpacity>
    </View>

    {/* Bottom Driver Card */}
    <View style={styles.driverCard}>
      {!end &&
        <>
          <Text style={styles.arrivingText}>Driver is Arriving...</Text>
          <Text style={styles.timeText}>2 ss</Text>
          <View style={styles.seprator} />
        </>
      }
      <View style={styles.driverRow}>
        <Image
          source={{
            uri: item?.patient_details?.image ? item?.patient_details?.image :'https://randomuser.me/api/portraits/men/41.jpg',
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.driverName}>Marcus Aminoff</Text>
          {/* <Text style={styles.driverName}>{item?.patient_details?.first_name + '' + item?.patient_details?.last_name || ""}</Text> */}
          <Text style={styles.carDetails}>+197 504 371 0841</Text>
          {/* <Text style={styles.carDetails}>{item?.patient_details?.mobile_number}</Text> */}
        </View>
        {end &&
          <Text style={[styles.timeText, { right: 0 }]}>2 xxx</Text>
        }
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => setEnd(true)} >
          <Image source={imageIndex.Closed} style={styles.iconBtn} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>{
          let url = `tel:${item?.patient_details?.mobile_number}`;
                      Linking.openURL(url);
        }}>
          <Image source={imageIndex.Calblack} style={styles.iconBtn} />
        </TouchableOpacity>
        <TouchableOpacity  onPress={()=>{
          let url = `sms:${item?.patient_details?.mobile_number}`;
                      Linking.openURL(url);
        }}>
          <Image source={imageIndex.MessageBlack} style={styles.iconBtn} />
        </TouchableOpacity>
      </View>
      {/* {end && */}
        <CustomButton onPress={Submit} title={"Finish"} />
      {/* } */}
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

export default TripMap;

const styles = StyleSheet.create({
container: {
  flex: 1,
},
infoCard: {
  position: 'absolute',
  top: 60,
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
  marginVertical: 15,
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
}
});
