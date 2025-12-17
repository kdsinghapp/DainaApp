import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import font from "../../../theme/font";
import CounterOfferModal from "../../../compoent/MakeCounterModal";
import TrackCourierModal from "../../../compoent/TrackCourierModal";
import { useNavigation } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { useOfferOR } from "./useOfferOR";
import LoadingModal from "../../../utils/Loader";
import { styles } from "./style";




export default function OfferOR() {
  const [Open, setOpen] = useState(false)
  const [trackerModal, settrackerModal] = useState(false)
  const {
    isLoading,
    offerData,
    location,
    setLocation,
    onAccept, 
    navgation,
  } = useOfferOR()

  const OfferCard = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Text style={styles.carrierText}>Carrier : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular


        }]}>{item?.deliveryUser?.name}</Text></Text>
        <Text style={styles.offerText}>Offer Price : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular

        }]}>{item?.amount}</Text>

        </Text>
        <Text style={styles.offerText}>Message : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular,

        }]}>{item?.message}</Text></Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.acceptBtn]}
            onPress={() => onAccept(item?.id || item?.offerId)}
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
      <StatusBarComponent />
      <LoadingModal visible={isLoading} />
      <CustomHeader label={"Back"} />
      <View style={{
        marginHorizontal: 15
      }}>
        <Text style={styles.header}>OFFERS FOR YOUR AD</Text>
        {/* <Text style={styles.subHeader}>Your Ad: 10 Boxes | 20 Kg | ₹2000 Proposed</Text> */}

        <FlatList
          style={{
            marginTop: 20
          }}
          data={offerData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OfferCard item={item} />
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

            ;
        }}
      />



      <TrackCourierModal visible={trackerModal}

        onClose={() => {
          settrackerModal(false)

          setOpen(false)
        }}
        onpress={() => {
          setOpen(false)
          settrackerModal(false)

          navgation.navigate(ScreenNameEnum.CourierTrackingScreen)

        }}
      //  onLocationGranted
      />
    </SafeAreaView>
  );
}
