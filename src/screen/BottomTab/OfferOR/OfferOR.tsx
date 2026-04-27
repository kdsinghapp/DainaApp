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
import { Image } from "react-native";
import imageIndex from "../../../assets/imageIndex";
import { openDialer } from "../../../utils/Constant";




import Animated, { FadeInDown } from "react-native-reanimated";

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
    CounterOffer,
    selectedOfferId, setSelectedOfferId

  } = useOfferOR()

  const OfferCard = ({ item, onCounterPress }: any) => {
    return (
      <View style={styles.card}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between"
        }}>
          <Text style={styles.carrierText}>Carrier : <Text style={[styles.bold, {
            color: "#878787",
            fontFamily: font.MonolithRegular


          }]}>{item?.deliveryUser?.name}</Text></Text>
          <TouchableOpacity onPress={() => openDialer(item?.deliveryUser?.phone)}>

            <Image source={imageIndex.Calls}

              style={{
                height: 36,
                width: 36,

              }}
            />
          </TouchableOpacity>

        </View>
        <Text style={styles.offerText}>Offer Price : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular

        }]}>{item?.offerAmount}</Text>

        </Text>
        <Text style={styles.offerText}>Message : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular,

        }]}>{item?.message}</Text></Text>
        <Text style={styles.offerText}>Phone : <Text style={[styles.bold, {
          color: "#878787",
          fontFamily: font.MonolithRegular,

        }]}>{item?.deliveryUser?.phone}</Text></Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.acceptBtn]}
            onPress={() => onAccept(item?.id || item?.offerId)}
          >
            <Text style={styles.acceptText}>ACCEPT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            setSelectedOfferId(item?.id || item?.offerId);
            setOpen(true);
          }}
            style={[styles.button, styles.counterBtn]}>
            <Text style={styles.counterText}>COUNTER OFFER</Text>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={() => {
              navgation.navigate(ScreenNameEnum.ChatScreen, {
                item: item,
              })
            }}

            style={[styles.button, styles.chatBtn]}>
            <Text style={styles.chatText}>CHAT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const nav = useNavigation()
  console.log("offerData", offerData)
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
            marginTop: 20,
          }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              No offers available for your ad yet.
            </Text>
          )}

          data={offerData?.offers}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            console.log("sssss", item)
            return (
              <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
                <OfferCard item={item} onCounterPress={

                  () => setOpen(true)} />
              </Animated.View>
            )
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <CounterOfferModal
        visible={Open}
        defaultValue={1}
        currency="$"
        min={1}
        max={50000}
        onCancel={() => setOpen(false)}
        onSubmit={(amount) => {
          if (selectedOfferId) {
            CounterOffer(selectedOfferId, amount); // 👈 ID + amount
          }
          setOpen(false);
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
