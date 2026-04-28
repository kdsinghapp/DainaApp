import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Easing,
  FlatList,
  ScrollView,
  RefreshControl,
  Animated,
} from "react-native";
import ReAnimated, { FadeInDown, FadeIn, Layout } from "react-native-reanimated";
import { SafeAreaView, } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
import HomeHeaderBar from "../../../../compoent/HomeHeaderBar";
import imageIndex from "../../../../assets/imageIndex";
import { useDeliveryContext } from "../../../../context/DeliveryContext";
import { styles } from "./style";
import CurrentLocation from "../../../../CurrentLocation";
import { Pressable } from "react-native";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import useDashboard from "../../../BottomTab/DashBoard/useDashboard";
import NewOrderNotificationModal from "../../../../compoent/NewOrderNotificationModal";
import OfferAcceptedModal from "../../../../compoent/OfferAcceptedModal";
import { GetDashboardCounts } from "../../../../Api/apiRequest";
import strings from "../../../../localization/Localization";

const TABS = ["Pending", "Complete", "Cancelled"] as const;
const DeliveryHome = () => {
  const ctx = useDeliveryContext();
  if (!ctx) return null;
  const { isLoading, requests, coords, newOrderNotification, fetchAvailableRequests } = ctx;
  // console.log("newOrderNotification",newOrderNotification?.data?.user?.name)
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");
  const [counts, setCounts] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);


  const fetchCounts = async () => {
    const res = await GetDashboardCounts(() => { });
    if (res && (res.status === 1 || res.status === "1")) {
      setCounts(res);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCounts(),
      fetchAvailableRequests()
    ]);
    setRefreshing(false);
  };

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
          (item: any) => item.deliveryStatus?.toLowerCase() === "pending",
        );
      case "Complete":
        return requests.filter(
          (item: any) =>
            item.deliveryStatus?.toLowerCase() === "completed" ||
            item.deliveryStatus?.toLowerCase() === "delivered",
        );
      case "Canceled":
        return requests.filter(
          (item: any) => item.deliveryStatus?.toLowerCase() === "canceled",
        );
      default:
        return requests;
    }
  }, [activeTab, requests]);
  const { locationRef, address, currentlocation } = useDashboard()
  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <NewOrderNotificationModal />
      <OfferAcceptedModal />
      {/* <LoadingModal visible={isLoading} /> */}
      <CurrentLocation ref={locationRef} />
      <HomeHeaderBar
        location={currentlocation || address}
        onNotificationPress={() => navigation.navigate(ScreenNameEnum.NotificationsScreen)}
        hasNotification={false}
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          <ReAnimated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.card1}
          >
            <Image
              source={imageIndex.cars}
              style={{
                height: 35,
                tintColor: "gray",
                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>{strings.PendingRides}</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              {counts?.pendingRides || "0"}
            </Text>
          </ReAnimated.View>

          {/* Rides */}
          <ReAnimated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.card1}
          >
            <Image
              source={imageIndex.cars}
              style={{
                height: 35,
                width: 35,
                tintColor: "gray",

              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>{strings.TodaysRides}</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              {counts?.todayRides || "0"}
            </Text>
          </ReAnimated.View>
        </View>
        <View style={styles.container1}>
          {/* Earnings */}
          <ReAnimated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.card1}
          >
            <Image
              source={imageIndex.earing}
              style={{
                height: 35,
                width: 35,
                tintColor: "gray",

              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>{strings.TotalEarnings}</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              0.00€
            </Text>
          </ReAnimated.View>

          {/* Rides */}
          <ReAnimated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.card1}
          >
            <Image
              source={imageIndex.cars}
              style={{
                height: 35,
                tintColor: "gray",

                width: 35,
              }}
              resizeMode="contain"
            />
            <Text style={styles.title}>{strings.WeeklyRides}</Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 5,
              }}
            >
              {counts?.weeklyRides || "0"}
            </Text>
          </ReAnimated.View>
        </View>
        <View style={styles.tabs}>
          {TABS.map((tab) => {
            const active = tab === activeTab;
            const label = tab === "Complete" ? strings.Complete : tab === "Cancelled" ? strings.Canceled : strings[tab as keyof typeof strings] || tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {label}
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
            renderItem={({ item, index }) => {
              return (
                <ReAnimated.View entering={FadeInDown.delay(index * 100)}>
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
                        <Text style={styles.label}>{strings?.From}</Text>
                        <Text style={[styles.value, { marginTop: 6 }]}>
                          {item?.pickupLocation || item?.pickup?.location}
                        </Text>
                        <Text style={[styles.label, { marginTop: 10 }]}>{strings?.To}</Text>
                        <Text style={[styles.value, { marginTop: 6 }]}>
                          {item?.dropLocation || item?.drop?.location}
                        </Text>

                      </View>
                    </View>
                  </TouchableOpacity>
                </ReAnimated.View>
              );
            }}
            ListEmptyComponent={
              <ReAnimated.View entering={FadeIn.delay(300)}>
                <Text style={styles.emptyText}>{strings.NoOrdersHereYet}</Text>
              </ReAnimated.View>
            }
          />
        </Animated.View>
      </ScrollView>
      {/* <OnlineSlideRight coords={coords} onSlideSuccess={() => successToast("Online")} isOnline={isOnline} setIsOnline={setIsOnline} /> */}
    </SafeAreaView>
  );
};

export default DeliveryHome;
