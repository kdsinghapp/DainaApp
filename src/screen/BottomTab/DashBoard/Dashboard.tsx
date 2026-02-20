import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import font from "../../../theme/font";
import imageIndex from "../../../assets/imageIndex";
import CustomButton from "../../../compoent/CustomButton";
import HomeHeaderBar from "../../../compoent/HomeHeaderBar";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import ScreenNameEnum from "../../../routes/screenName.enum";
import AddressModalInput from "../../../compoent/AutocompleteData";
import useDashboard from "./useDashboard";
import CurrentLocation from "../../../CurrentLocation";
import LoadingModal from "../../../utils/Loader";
import { FlatList } from "react-native-gesture-handler";
import OrderCard from "../../../compoent/OrderCard";

const ShippingScreen = () => {


  const {
    navigation,
    isLoading,
    locationRef,
    currentlocation,
    address, setAddress,
    location, setLocation,
    locationModal,
    setlocationModal,
    orderData
  } = useDashboard()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <LoadingModal visible={isLoading} />

      <CurrentLocation ref={locationRef} />

      <HomeHeaderBar
        location={currentlocation || address}
        // onLocationPress={() => setlocationModal(true)}
        onNotificationPress={() => console.log("Notifications clicked")}
        hasNotification={true}
      />

      {/* <TouchableOpacity style={styles.inputBox} 
      onPress={()=> navigation.navigate(ScreenNameEnum.PickupLocation)}
      >
        <Text style={{ color: "black" ,fontSize:14, fontFamily:font.MonolithRegular}}>Enter Pickup Location</Text>
      <Image source={imageIndex.Next} 
      style={{
        height:20,
        width:20
      }}
      />
       </TouchableOpacity> */}

      <View style={{
        marginTop: 11, marginBottom: 5
      }}>
        <CustomButton title={"Create Parcel"}
          onPress={() => navigation.navigate(ScreenNameEnum.CreateParcelFrom)}
        />
      </View>
      {/* Shipping History */}

      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18,
        marginBottom: 10
      }}>
        <Text style={styles.sectionTitle}>Shipping History</Text>

        <Image source={imageIndex.Filter}

          style={{
            height: 24,
            width: 24
          }}
        />
      </View>

      {/* <ScrollView showsVerticalScrollIndicator={false}> */}
      {/* {orderData.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardTop}>

              <View style={[styles.iconBox,]}>

                <Image source={imageIndex.icons}
                  style={{
                    height: 40,
                    width: 40
                  }}
                />
              </View>
              <Text style={[styles.cardId, {
                fontFamily: font.MonolithRegular,
                fontSize: 14,
                color: "black"
              }]}>#{item.id}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
              <Text style={styles.cardDate}>ss</Text>

            </View>

             <View style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              alignItems: "center"
            }}>
              <Image source={imageIndex.Vector}
                style={{
                  height: 88,
                  width: 10
                }}
                resizeMode="contain"
              />

              <View style={{
                flexDirection: "column",
                right: 11
              }}>
                <Text style={styles.label}>From</Text>
                <Text style={[styles.value, {
                  marginTop: 5
                }]}>{item.from}</Text>
                <Text style={[styles.label, {
                  marginTop: 10
                }]}>To</Text>
                <Text style={[styles.value, {
                  marginTop: 5
                }]}>{item.to || "5678 Maple Avenue Seattle, WA 98101"}</Text>

                 <View style={styles.statusRow}>
                  <Text style={styles.statusText}>Delivery Status :</Text>
                  <Text style={[styles.statusValue, { color: item.statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>

          </View>
        ))} */}
      {/* </ScrollView> */}
      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
        data={orderData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>  {
          return(
             <OrderCard order={item} onPress={() => {
             if (item?.deliveryStatus === "pending") {
              navigation.navigate(ScreenNameEnum.ViewDetails, {
                item: item
              })
            } else {
              // navigation.navigate(ScreenNameEnum.NearbyDriversMap)
              navigation.navigate(ScreenNameEnum.ViewDetails, {
                item: item
              })
            }

          }} />
          )
        }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No orders found</Text>
        )}
      />
      <AddressModalInput
        value={address}
        modalVisible={locationModal}
        setModalVisible={() => setlocationModal(false)}
        onChange={setAddress}
        onSelect={(loc) => setLocation(loc)}
        placeholder="Select your delivery address"
      />
    </SafeAreaView>
  );
};

export default ShippingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  emptyText:{
     fontSize: 14,
     marginLeft: 6, 
    fontFamily:font.MonolithRegular ,
    textAlign:"center"
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  locationText: {
    fontSize: 14,
     marginLeft: 6,
        fontFamily:font.MonolithRegular

  },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 2,
    marginTop: 11,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    // Android shadow


    flexDirection: "row",
    justifyContent: "space-between"
  },
  createBtn: {
    backgroundColor: "#FFD600",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 22,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
    fontFamily: font.MonolithRegular,

  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#eee",
    marginHorizontal: 1,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    // Android shadow

  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardId: {
    fontWeight: "700",
    fontSize: 15,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 14,
    color: "#BABFC5",
    fontFamily: font.MonolithRegular

  },
  label: {
    fontSize: 14,
    color: "#BABFC5",
    marginTop: 6,
    fontFamily: font.MonolithRegular

  },
  value: {
    fontSize: 14,
    color: "#76889A",
    fontFamily: font.MonolithRegular
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginRight: 6,
    fontFamily: font.MonolithRegular
  },
  statusValue: {
    fontSize: 13,
    color: "#555",
    fontFamily: font.MonolithRegular

  },
});
