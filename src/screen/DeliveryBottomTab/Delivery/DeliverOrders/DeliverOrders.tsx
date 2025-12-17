import React, {  useRef, useState, useEffect, useCallback } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../../compoent/StatusBarCompoent";
import imageIndex from "../../../../assets/imageIndex";
import font from "../../../../theme/font";
import ScreenNameEnum from "../../../../routes/screenName.enum";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { base_url } from "../../../../Api";
import LoadingModal from "../../../../utils/Loader";
import { styles } from "./style";

type OrderStatus = "Pending" | "Completed" | "Canceled";
type Order = {
  id: string;
  name: string;
  phone: string;
  code: string; // e.g. HSW 4736 XK
  status: OrderStatus;
  pickup: string;
  drop: string;
  avatar?: string; // remote/avatar uri if you have
};

const TABS = ["Pending", "Complete", "Canceled"] as const;

const STATUS_STYLES: Record<
  OrderStatus,
  { bg: string; text: string; label: string }
> = {
  Pending: { bg: "#FFF4E5", text: "#C26B00", label: "Pending" },
  Completed: { bg: "#EAF8EE", text: "#00CE9A", label: "Completed" },
  Canceled: { bg: "#FDECEC", text: "#D32F2F", label: "Canceled" },
};


const DeliveryHome = () => {
  const navigation = useNavigation();
  const [ordersSeed, setordersSeed] = useState([])
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const pillX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(pillX, {
      toValue: isOnline ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isOnline]);
 

  // tabs + filter
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Pending");

  // list enter animation on tab change
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
  const translateX = listSlide.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  const fade = listSlide.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  useFocusEffect(
    useCallback(() => {
      fetchAvailableRequests();
    }, [])
  );
  const fetchAvailableRequests = async () => {
    setisLoading(true)
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return;
      }
      const response = await axios.get(
        `${base_url}/delivery/my-offers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
      if (response?.data?.status == 1) {
        setisLoading(false)
        setordersSeed(response?.data?.offers)
      } else {
        setisLoading(false)

      }
    } catch (error:any) {
      setisLoading(false)

      console.error('Error fetching available requests:', error?.response?.data || error?.message);
    } finally {
      setisLoading(false)

    }
  };

  const renderItem = ({ item }: { item: Order }) => {
    const st = STATUS_STYLES[item.status];
    return (
      <TouchableOpacity style={styles.card}


        onPress={() => {
          if (item.status == "Pending") {
            navigation.navigate(ScreenNameEnum.ParcelDetails, {
              item: item,
            });
          }
        }}

      >

        <View style={styles.cardTop}>
          <Image
            source={
              item?.user?.image
                ? { uri: item?.user.image }
                : imageIndex?.userLogo || { uri: "" }
            }
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {item?.user?.firstName}
            </Text>
            <Text style={styles.phone} numberOfLines={1}>
              {item?.user?.phone}
            </Text>
          </View>

          <Text
            style={[
              styles.code,
              {
                textTransform: "capitalize",
                fontSize: 15,
                fontFamily: font.TrialMedium,
                color:
                  item.status === "pending"
                    ? "orange"
                    : item.status === "assigned"
                      ? "green"
                      : item.status === "complete"
                        ? "blue"
                        : "black",
              },
            ]}
          >
            {item.status}
          </Text>


        </View>

        <Text style={styles.code} numberOfLines={1}>
          {item.trackingId}
        </Text>

        {/* Pickup / Drop block */}
        <View style={styles.splitter} />

        <View style={styles.stopsRow}>
          {/* timeline dots/line image (replace with your own if needed) */}
          <Image
            source={imageIndex?.Dots || { uri: "" }}
            style={{ width: 12, height: 88, marginRight: 10 }}
            resizeMode="contain"
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.stopLabel}>Pickup Location</Text>
            <Text style={styles.stopValue} numberOfLines={2}>
              {item?.parcel?.pickupLocation}
            </Text>

            <Text style={[styles.stopLabel, { marginTop: 10 }]}>
              Drop Location
            </Text>
            <Text style={styles.stopValue} numberOfLines={2}>
              {item?.parcel?.dropLocation}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <LoadingModal visible={isLoading} />

      <View style={styles.ordersHeader}>
        <Text style={styles.sectionTitle}>Orders</Text>
        <Image
          source={imageIndex?.Filter || { uri: "" }}
          style={{ height: 22, width: 22 }}
          resizeMode="contain"
        />
      </View>

      {/* Tabs */}
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
      <Animated.View style={{ flex: 1, transform: [{ translateX }], opacity: fade }}>
        <FlatList
          data={ordersSeed}
          style={{
            marginTop: 10
          }}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders here yet.</Text>
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default DeliveryHome;


