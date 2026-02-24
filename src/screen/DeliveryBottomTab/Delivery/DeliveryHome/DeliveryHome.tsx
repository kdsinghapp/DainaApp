import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
  ScrollView,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
import HomeHeaderBar from "../../../../compoent/HomeHeaderBar";
import imageIndex from "../../../../assets/imageIndex";
import OnlineSlideRight from "../../../../compoent/OnlineSlideRight";
import { successToast } from "../../../../utils/customToast";
import { useDeliveryHome } from "./useDeliveryHome";
import LoadingModal from "../../../../utils/Loader";
import { styles } from "./style";
import CurrentLocation from "../../../../CurrentLocation";
import { Pressable } from "react-native";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import { STATUS } from "../../../../utils/Constant";
import font from "../../../../theme/font";

const TABS = ["Pending", "Complete", "Canceled"] as const;
const DeliveryHome = () => {
  const {
    isLoading,
    requests,
    locationRef,
    currentlocation,
    address,
    newOrderNotification,
    setNewOrderNotification,
    acceptCounterOffer,
    acceptCounterOfferLoading,
    RejectcounterOffer
  } = useDeliveryHome();
  // console.log("newOrderNotification",newOrderNotification?.data?.user?.name)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [isOnline, setIsOnline] = useState(false);

  // useEffect(() => {
  //   Animated.timing(pillX, {
  //     toValue: isOnline ? 1 : 0,
  //     duration: 260,
  //     easing: Easing.out(Easing.quad),
  //     useNativeDriver: true,
  //   }).start();
  // }, [isOnline]);

  const listSlide = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    listSlide.setValue(0);
    const anim = Animated.timing(listSlide, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animationRef.current = anim;
    anim.start();
    return () => {
      try {
        animationRef.current?.stop();
        animationRef.current = null;
      } catch (_) { }
    };
  }, [activeTab]);

  const translateX = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  const fade = listSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const navigation = useNavigation();
  const filteredRequests = useMemo(() => {
    if (!requests || requests?.length === 0) return [];

    switch (activeTab) {
      case "Pending":
        return requests.filter(
          (item: any) => item.status?.toLowerCase() === "pending",
        );
      case "Complete":
        return requests.filter(
          (item: any) =>
            item.status?.toLowerCase() === "completed" ||
            item.status?.toLowerCase() === "delivered",
        );
      case "Canceled":
        return requests.filter(
          (item: any) => item.status?.toLowerCase() === "canceled",
        );
      default:
        return requests;
    }
  }, [activeTab, requests]);
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

      {/* 
      <HomeHeaderBar
        location={ "Wallace, Australia"}
        onLocationPress={() => console.log("Change location")}
        onNotificationPress={() => console.log("Notifications clicked")}
        hasNotification={true}
        style1={{
          fontWeight: "500",
        }}
      /> */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: 12,
            marginBottom: 5,
          }}
        >
          {/* <OnlineSlideRight onSlideSuccess={() => successToast("Online")} isOnline={isOnline} setIsOnline={setIsOnline} /> */}
        </View>
        <View style={styles.container1}>
          {/* Earnings */}
          <View style={styles.card1}>
            <Image
              source={imageIndex.earing}
              style={{
                height: 35,
                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Today's Earnings</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              00.€
            </Text>
          </View>

          {/* Rides */}
          <View style={styles.card1}>
            <Image
              source={imageIndex.cars}
              style={{
                height: 35,
                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Today's Rides</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <View style={styles.container1}>
          {/* Earnings */}
          <View style={styles.card1}>
            <Image
              source={imageIndex.earing}
              style={{
                height: 35,
                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Weekly's Earnings</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              00.€
            </Text>
          </View>

          {/* Rides */}
          <View style={styles.card1}>
            <Image
              source={imageIndex.cars}
              style={{
                height: 35,
                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>Weekly's Rides</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              0
            </Text>
          </View>
        </View>
        <Text></Text>
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
        {/* <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle1}>Orders</Text>
        <Text
          onPress={() => navigation.navigate('Orders')}
          style={styles.sectionTitle1}
        >
          Sell All
        </Text>
      </View> */}
        {/* List */}
        <Animated.View
          style={{
            flex: 1, transform: [{ translateX }], opacity: fade,
          }}
        >
          <FlatList
            data={filteredRequests.slice(0, 3)}


            style={{
              marginTop: 12,
            }}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => {
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => {
                    navigation.navigate(ScreenNameEnum.ParcelDetails, {
                      item: item,
                    });
                  }}
                >
                  <View style={styles.cardTop}>
                    <View style={[styles.iconBox]}>
                      <Image
                        source={imageIndex?.icons || { uri: "" }}
                        style={{ height: 24, width: 24 }}
                        resizeMode="contain"
                      />
                    </View>

                    <Text style={[styles.cardId, styles.bold]}>
                      {item?.trackingId}
                    </Text>
                    <View
                      style={{
                        borderWidth: 3,
                        borderColor: "#D2D6DB",
                        borderRadius: 20,
                      }}
                    />
                    <Text
                      style={[
                        styles.cardDate,
                        {
                          marginLeft: 5,
                        },
                      ]}
                    >
                      {item?.date}
                    </Text>

                    <View style={{ flex: 1 }} />
                    <Image
                      source={imageIndex.more_vert}
                      style={{
                        height: 22,
                        width: 22,
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
                      <Text style={[styles.value, { marginTop: 6 }]}>
                        {item?.dropLocation}
                      </Text>

                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders here yet.</Text>
            }
          />
        </Animated.View>
      </ScrollView>
      <OnlineSlideRight onSlideSuccess={() => successToast("Online")} isOnline={isOnline} setIsOnline={setIsOnline} />

      {/* New order notification modal */}
      <Modal
        visible={!!newOrderNotification?.visible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={newOrderStyles.overlay}
          onPress={() => setNewOrderNotification(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={newOrderStyles.modalCard}>
              <View style={newOrderStyles.accentBar} />

              <View style={newOrderStyles.iconWrap}>
                <Image
                  source={imageIndex?.icons || imageIndex?.earing}
                  style={newOrderStyles.notifIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={newOrderStyles.title}>
                {(newOrderNotification?.data as { type?: string; title?: string })?.type === 'counter_offer'
                  ? ((newOrderNotification?.data as { title?: string })?.title ?? 'Counter Offer Received')
                  : 'New delivery request'}
              </Text>

              <Text style={newOrderStyles.message}>
                {(newOrderNotification?.data as { type?: string; message?: string })?.type === 'counter_offer'
                  ? ((newOrderNotification?.data as { message?: string })?.message ?? 'User sent a counter offer. Tap to view and respond.')
                  : 'A parcel pickup is nearby. Tap below to see details and send your offer.'}
              </Text>

              {newOrderNotification?.data?.user?.profileImage && (
                  <View style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
                backgroundColor: "#fff",
                bottom: 20

              }}>
                <Image
                  source={{
                    uri: newOrderNotification?.data?.user?.profileImage
                      ? newOrderNotification?.data?.user?.profileImage
                      : "https://via.placeholder.com/50",
                  }}
                  style={newOrderStyles.profileImage}
                />

                <View style={newOrderStyles.textContainer}>
                  <Text style={newOrderStyles.userName}>
                    {newOrderNotification?.data?.user?.name || "Unknown User"}
                  </Text>

                </View>

              </View>

              )}
            


              <View style={newOrderStyles.buttonRow}>
                {(newOrderNotification?.data as { type?: string })?.type === 'counter_offer' ? (
                  <>
                    <TouchableOpacity
                      style={newOrderStyles.btnDismiss}
                      // onPress={() => setNewOrderNotification(null)}
                      onPress={() => {
                        const offerId = (newOrderNotification?.data as { offerId?: number })?.offerId;
                        console.log("offerId", offerId)

                        if (offerId != null) {
                          RejectcounterOffer(offerId);
                        } else {
                          setNewOrderNotification(null);
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={acceptCounterOfferLoading}
                    >
                      <Text style={newOrderStyles.btnDismissText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={newOrderStyles.btnView}
                      onPress={() => {
                        const offerId = (newOrderNotification?.data as { offerId?: number })?.offerId;
                        console.log("offerId", offerId)

                        if (offerId != null) {
                          acceptCounterOffer(offerId);
                        } else {
                          setNewOrderNotification(null);
                        }
                      }}
                      activeOpacity={0.8}
                      disabled={acceptCounterOfferLoading}
                    >
                      <Text style={newOrderStyles.btnViewText}>
                        Accept
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={newOrderStyles.btnDismiss}
                      onPress={() => setNewOrderNotification(null)}

                      activeOpacity={0.8}
                    >
                      <Text style={newOrderStyles.btnDismissText}>Later</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={newOrderStyles.btnView}
                      onPress={() => {
                        if (newOrderNotification?.data != null) {
                          navigation.navigate(ScreenNameEnum.ParcelDetails, {
                            item: {
                              data: newOrderNotification.data,
                              deliveryStatus: STATUS.PENDING,
                            },
                          });
                          setNewOrderNotification(null);
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={newOrderStyles.btnViewText}>View order</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const newOrderStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  accentBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#22C55E",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 20,
  },
  badge: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 1,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#BBF7D0",
  },
  notifIcon: { width: 36, height: 36 },
  title: {
    fontSize: 22,

    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: font.MonolithRegular
  },
  message: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
    fontFamily: font.MonolithRegular

  },
  buttonRow: {
    flexDirection: "row",
    gap: 14,
    width: "100%",
  },
  btnDismiss: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",

  },
  btnDismissText: {
    fontSize: 16,
    color: "#64748B",
    fontFamily: font.MonolithRegular
  },
  btnView: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#FFCC00",
    alignItems: "center",



  },
  btnViewText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular
    ,
    color: "#FFFFFF",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3, // android shadow
    shadowColor: "#000", // ios shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginVertical: 8,
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
  },

  textContainer: {
    marginLeft: 12,
  },

  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },

  subText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

});

export default DeliveryHome;
