import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
   Image,
  FlatList,
  Pressable,
  Animated,
  Easing,
  TouchableOpacity,
 } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
import HomeHeaderBar from "../../../../compoent/HomeHeaderBar";
import imageIndex from "../../../../assets/imageIndex";
 import OnlineSlideRight from "../../../../compoent/OnlineSlideRight";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import { successToast } from "../../../../utils/customToast";
import { useDeliveryHome } from "./useDeliveryHome";
import LoadingModal from "../../../../utils/Loader";
 import { styles } from "./style";

const TABS = ["Pending", "Complete", "Canceled"] as const;
const DeliveryHome = () => {
   const { 
       isLoading,
     requests,
       }= useDeliveryHome()
   const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [isOnline, setIsOnline] = useState(false);
   const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pillX, {
      toValue: isOnline ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOnline]);
 
   const listSlide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    listSlide.setValue(0);
    Animated.timing(listSlide, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  const translateX = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const fade = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const navigation = useNavigation()
const filteredRequests = useMemo(() => {
    if (!requests || requests?.length === 0) return [];

    switch (activeTab) {
      case "Pending":
        return requests.filter(
          (item) => item.status?.toLowerCase() === "pending"
        );
      case "Complete":
        return requests.filter(
          (item) =>
            item.status?.toLowerCase() === "completed" ||
            item.status?.toLowerCase() === "delivered"
        );
      case "Canceled":
        return requests.filter(
          (item) => item.status?.toLowerCase() === "canceled"
        );
      default:
        return requests;
    }
  }, [activeTab, requests]);
   

 

   return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
                                       <LoadingModal visible ={isLoading}/>  

      <HomeHeaderBar
        location="Wallace, Australia"
        onLocationPress={() => console.log("Change location")}
        onNotificationPress={() => console.log("Notifications clicked")}
        hasNotification={true}
        style1={{
                        fontWeight:"500"

        }}
      />
<View style={{
  marginTop:12 ,
  marginBottom:5
}}>
    <OnlineSlideRight 
    onSlideSuccess={() => 
successToast("Online")

    } 

    />
    </View>
    <View style={styles.container1}>
      {/* Earnings */}
      <View style={styles.card1}>
        <Image source={imageIndex.earing} style={{
            height:35,
            width:35
        }} 
        
        resizeMode="contain"
        />
        <Text style={styles.title}>Today's Earnings</Text>
        <Text style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop:5
        }}>00.€</Text>
      </View>

      {/* Rides */}
      <View style={styles.card1}>
        <Image source={imageIndex.cars} style={{
          height:35,
          width:35
        }}        resizeMode="contain"
        />
        <Text style={styles.title}>Today's Rides</Text>
        <Text style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop:5
        }}>0</Text>
      </View>
    </View>

      {/* Orders header row */}
      <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <Image
          source={imageIndex?.Filter || { uri: "" }}
          style={{ height: 24, width: 24 }}
        />
      </View>

       <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle1}>Orders</Text>
               <Text  
               onPress={()=> navigation.navigate(ScreenNameEnum.AllOrder)}
               style={styles.sectionTitle1}>Sell All</Text>

      </View>
      {/* List */}
      <Animated.View
        style={{ flex: 1, transform: [{ translateX }], opacity: fade }}
      >
        <FlatList
  data={filteredRequests} // 👈 Sirf bottom 4 items
  // data={filteredRequests.slice(-4)} // 👈 Sirf bottom 4 items

          style={{
            marginTop:12
          }}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
             return(
               <TouchableOpacity style={styles.card} 
               
                onPress={() => {
     
      navigation.navigate(ScreenNameEnum.ParcelDetails, {
        item: item,
      });
 
  }}
               
               >
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.iconBox,
                   ]}
                >
                  <Image
                    source={imageIndex?.icons || { uri: "" }}
                    style={{ height: 24, width: 24 }}
                    resizeMode="contain"
                  />
                </View>

                <Text style={[styles.cardId, styles.bold]}>{item.trackingId}</Text>
                               <View  
                               style={{
                                borderWidth:3,
                                borderColor:"#D2D6DB",
                                borderRadius:20

                               }}
                               />
                                <Text style={[styles.cardDate,{
                                  marginLeft:5
                                }]}>{item.date}</Text>

                <View style={{ flex: 1 }} />
                <Image source={imageIndex.more_vert} 
                
                style={{
                  height:22,
                  width:22
                }}
                />
               </View>

              <View style={styles.routeRow}>
                <Image
                  source={imageIndex?.Vector || { uri: "" }}
                  style={{ height: 88, width: 10 }}
                  resizeMode="contain"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.label}>From</Text>
                  <Text style={[styles.value, { marginTop: 6 }]}>
                   {item?.pickupLocation}
                  </Text>
                  <Text style={[styles.label, { marginTop: 10 }]}>To</Text>
                  <Text style={[styles.value, { marginTop: 6 }]}>{item?.dropLocation}</Text>
                  {/* <View style={styles.statusRow}>
                    <Text style={styles.statusText}>Delivery Status :</Text>
                    <Text
                      style={[
                        styles.statusValue,
                        { color: item.statusColor || "#555" },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View> */}
                </View>
              </View>
            </TouchableOpacity>
            )
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders here yet.</Text>
          }
        />
      </Animated.View>



        
     
    </SafeAreaView>
  );
};

export default DeliveryHome;

 