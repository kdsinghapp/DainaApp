import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import font from "../../../../theme/font";
import OnlineSlideRight from "../../../../compoent/OnlineSlideRight";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import { successToast } from "../../../../utils/customToast";
import { useDeliveryHome } from "./useDeliveryHome";
import LoadingModal from "../../../../utils/Loader";
import CustomHeader from "../../../../compoent/CustomHeader";
 
type Parcel = {
  id: string;
  date: string;
  from: string;
  to: string;
  status: "Pending" | "Delivered" | "Canceled";
  statusColor: string;
  iconBg: string;
  icon?: string;
};

const TABS = ["Pending", "Complete", "Canceled"] as const;

const AllOrder = () => {
   const { 
       isLoading,
     requests,
      }= useDeliveryHome()
  // ---------- STATE ----------
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [isOnline, setIsOnline] = useState(false);

 console.log("requests --- ",requests)

   const pillX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(pillX, {
      toValue: isOnline ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOnline]);
 
  // list slide when changing tab
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
 
 
 

         <CustomHeader label="All Orders" />
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

      {/* List */}
      <Animated.View
        style={{ flex: 1, transform: [{ translateX }], opacity: fade }}
      >
        <FlatList
          data={filteredRequests}
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

export default AllOrder;

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },

  topRow: {
    marginTop: 8,
    marginBottom: 4,
  },

  pill: {
    width: 180,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD600",
    justifyContent: "center",
    overflow: "hidden",
  },
  pillHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pillLeftText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    fontWeight: "700",
  },
  pillRightText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    fontWeight: "600",
  },
  knob: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: 80,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  onlineText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    textAlign: "center",
  },

  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "black",
     fontWeight: "700",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
     padding: 6,
    borderRadius: 30,
    marginBottom: 12,
    height:55,
    justifyContent:"center" ,
    alignItems:"center",
    marginTop:10

  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#000000",
     height:45,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    justifyContent:"center",
    alignItems:"center"
  },
  tabText: {
    fontSize: 14,
    color: "#1C1B1B",    fontWeight: "400",

   },
  tabTextActive: {
    color: "white",
    fontWeight: "700",
     fontSize: 15,


  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
     marginTop: 20,
  },
  card1: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
     shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    height: 28,
    width: 28,
    marginBottom: 11,
   },
  title: {
    color: "#EDEDED",
    fontSize: 14,
     marginTop:8
  },
 

  card: {
    backgroundColor: "#fff",
   borderRadius: 16,
  padding: 17,
  marginBottom: 16,
  borderColor: "#eee",
  borderWidth: 1,

  // ✅ iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 6,

  // ✅ Android shadow
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
    fontSize: 15,
    marginRight: 8,
    color: "black",
  },
  bold: { fontWeight: "700",  fontSize:16,color:"black"},
  cardDate: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft:35
  },
  label: {
    fontSize: 14,
    color: "#BABFC5",
    fontFamily: font.MonolithRegular,
  },
  value: {
    fontSize: 14,
    color: "#76889A",
    fontFamily: font.MonolithRegular,
        marginTop: 10,

  },
  statusRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginRight: 6,
    fontFamily: font.MonolithRegular,
  },
  statusValue: {
    fontSize: 13,
    fontFamily: font.MonolithRegular,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },
});
