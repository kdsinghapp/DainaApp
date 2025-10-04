import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import font from "../../../theme/font";
import CounterOfferModal from "../../../compoent/MakeCounterModal";
import CourierTrackingScreen from "../CourierTracking/CourierTracking";
import TrackCourierModal from "../../../compoent/TrackCourierModal";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

const offersData = [
  { id: "1", carrier: "Cesar Baptista", offer: "₹1900" },
  { id: "2", carrier: "Maria Baptista", offer: "₹1900" },
  { id: "3", carrier: "Alison Phelps", offer: "₹1900" },
  { id: "4", carrier: "Hanna Passquilanda Arcand", offer: "₹1900" },
];



export default function OfferOR() {
    const [Open,setOpen]= useState(false)
    const [trackerModal,settrackerModal]= useState(false)
    const OfferCard = ({ carrier, offer }) => {
        return (
          <View style={styles.card}>
            <Text style={styles.carrierText}>Carrier : <Text style={[styles.bold,{
                      color:"#878787" ,
                      fontFamily:font.MonolithRegular
      
      
            }]}>{carrier}</Text></Text>
            <Text style={styles.offerText}>Offer : <Text style={[styles.bold,{
              color:"#878787",
              fontFamily:font.MonolithRegular
      
            }]}>{offer}</Text></Text>
      
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.acceptBtn]} 
              onPress={()=>setOpen(true)}
              >
                <Text style={styles.acceptText}>ACCEPT</Text>
              </TouchableOpacity>
      
              <TouchableOpacity style={[styles.button, styles.counterBtn]}>
                <Text style={styles.counterText}>COUNTER OFFER</Text>
              </TouchableOpacity>
      
              <TouchableOpacity style={[styles.button, styles.chatBtn]}>
                <Text style={styles.chatText}>CHAT</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      };
      const nav = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
        <StatusBarComponent/>
        <CustomHeader label={"Back"}/>
<View style={{
    marginHorizontal:15
}}>
      <Text style={styles.header}>OFFERS FOR YOUR AD</Text>
      <Text style={styles.subHeader}>Your Ad: 10 Boxes | 20 Kg | ₹2000 Proposed</Text>

      <FlatList
      style={{
        marginTop:20
      }}
        data={offersData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OfferCard carrier={item.carrier} offer={item.offer} />
        )}
        showsVerticalScrollIndicator={false}
      />
      </View>
      <CounterOfferModal
  visible={Open}
  defaultValue={1850}
  currency="₹"
  min={1}
  max={50000}
  onCancel={() => setOpen(false)}
  onSubmit={(amount) => { /* send amount */ setOpen(false)
    settrackerModal(true)
  
  ; }}
/>



<TrackCourierModal visible={trackerModal} 

onClose ={()=>{
  settrackerModal(false)

  setOpen(false)
 }}
 onpress={()=>{
  setOpen(false)
  settrackerModal(false)

  nav.navigate(ScreenNameEnum.CourierTrackingScreen)

 }}
//  onLocationGranted
/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
   },
  header: {
    fontSize: 18,
     textAlign: "center",
    marginBottom: 6,
    color: "black",
    fontFamily:font.MonolithRegular ,
    marginTop:20
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    color: "#9DB2BF",
    marginBottom: 16,
    marginTop:5,
    fontFamily:font.MonolithRegular

  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginHorizontal:2,
    marginTop:5
  },
  carrierText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    fontFamily:font.MonolithRegular
  },
  offerText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
    fontFamily:font.MonolithRegular

  },
  bold: {
    fontWeight: "600",
    color: "#111",
    fontFamily:font.MonolithRegular

  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent:"center"
    ,
   },
  acceptBtn: {
    backgroundColor: "#34C759",
  },
  counterBtn: {
    backgroundColor: "#0088FF",
  },
  chatBtn: {
    backgroundColor: "#2F4858",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
  counterText: {
    color: "#fff",
     fontSize:10,
     fontFamily:font.MonolithRegular

  },
  chatText: {
    color: "#fff",
    fontWeight: "600",
  },
});
