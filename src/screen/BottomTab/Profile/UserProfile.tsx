// UserProfile.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import SvgIndex from "../../../assets/svgIndex";
import font from "../../../theme/font";
import imageIndex from "../../../assets/imageIndex";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import LogoutModal from "../../../compoent/LogoutModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { GetProfileApi } from "../../../Api/apiRequest";
import { loginSuccess, logout } from "../../../redux/feature/authSlice";
import LoadingModal from "../../../utils/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import strings from "../../../localization/Localization";
import { color } from "../../../constant";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const { width } = Dimensions.get("window");

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const StatItem = ({ label, value, icon, index }: any) => (
  <Animated.View
    entering={FadeInUp.delay(500 + index * 100).duration(600)}
    style={styles.statItem}
  >
    <View style={styles.statIconWrap}>
      {icon}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

const MenuItem = ({ icon, label, onPress, index, isLast }: any) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  const handlePress = () => {
    ReactNativeHapticFeedback.trigger("impactLight", hapticOptions);
    onPress?.();
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(600 + index * 50).duration(500)}
      style={[animatedStyle, styles.menuItemContainer]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      >
        <View style={styles.menuLeft}>
          <View style={styles.menuIconWrap}>
            {icon}
          </View>
          <Text style={styles.menuLabel}>{label}</Text>
        </View>
        <Image
          source={imageIndex.rightaArrow}
          style={styles.menuArrow}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProfileScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const userData: any = useSelector<any>((state) => state?.auth?.userData);

  useEffect(() => {
    getProfileApi();
  }, []);

  const getProfileApi = async () => {
    try {
      const response = await GetProfileApi(setLoading);
      if (response) {
        dispatch(loginSuccess({ userData: response }));
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    ReactNativeHapticFeedback.trigger("notificationSuccess", hapticOptions);
    dispatch(logout());
    AsyncStorage.removeItem('authData');
    navigation.replace(ScreenNameEnum.SPLASH_SCREEN);
  };

  return (
    <View style={styles.container}>
      <StatusBarComponent />
      <LoadingModal visible={isLoading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Luxury Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Animated.Text entering={FadeInDown.delay(200)} style={styles.headerTitle}>
              {strings.Profile}
            </Animated.Text>
            <TouchableOpacity
              onPress={() => navigation.navigate(ScreenNameEnum.EditProfile)}
              style={styles.headerSettings}
            >
              <Image source={imageIndex.eoditphots} style={styles.settingsIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <Animated.View entering={FadeInDown.delay(300)} style={styles.avatarWrap}>
              <View style={styles.avatarGlow} />
              <Image
                source={userData?.image ? { uri: userData?.image } : imageIndex.prfile}
                style={styles.avatar}
              />
              <TouchableOpacity
                style={styles.editBadge}
                onPress={() => navigation.navigate(ScreenNameEnum.EditProfile)}
              >
                <Image source={imageIndex.eoditphots} style={styles.editBadgeIcon} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.nameSection}>
              <Text style={styles.nameText}>{userData?.firstName || "User"}</Text>
              <Text style={styles.emailText}>{userData?.email || "No email provided"}</Text>
              <View style={styles.verifiedContainer}>
                <View style={styles.verifiedDot} />
                <Text style={styles.verifiedText}>Gold Member</Text>
              </View>
            </Animated.View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatItem
              index={0}
              label={strings.Orders || "Orders"}
              value="12"
              icon={<SvgIndex.Box width={18} height={18} />}
            />
            <StatItem
              index={1}
              label={strings.Messages || "Inbox"}
              value="05"
              icon={<SvgIndex.Edit width={18} height={18} />}
            />
            <StatItem
              index={2}
              label={strings.Points || "Credits"}
              value="250"
              icon={<SvgIndex.Terms width={18} height={18} />}
            />
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          <Animated.View entering={FadeInDown.delay(700)} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.card}>
              <MenuItem
                index={0}
                icon={<SvgIndex.Edit width={20} height={20} />}
                label={strings.EditProfile}
                onPress={() => navigation.navigate(ScreenNameEnum.EditProfile)}
              />
              <MenuItem
                index={1}
                icon={<SvgIndex.Edit width={20} height={20} />}
                label={strings.ChangeLanguage}
                onPress={() => navigation.navigate(ScreenNameEnum.language)}
              />
              <MenuItem
                index={2}
                isLast
                icon={<SvgIndex.Box width={20} height={20} />}
                label={strings.MyOrders}
                onPress={() => navigation.navigate(ScreenNameEnum.OrdersPrfile)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(850)} style={styles.sectionWrap}>
            <Text style={styles.sectionTitle}>Support & Legal</Text>
            <View style={styles.card}>
              <MenuItem
                index={3}
                icon={<SvgIndex.Privacy width={20} height={20} />}
                label={strings.PrivacyPolicy}
                onPress={() => navigation.navigate(ScreenNameEnum.PrivacyPolicy)}
              />
              <MenuItem
                index={4}
                isLast
                icon={<SvgIndex.Terms width={20} height={20} />}
                label={strings.TermsConditions}
                onPress={() => navigation.navigate(ScreenNameEnum.LegalPoliciesScreen)}
              />
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(1000)}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                ReactNativeHapticFeedback.trigger("impactMedium", hapticOptions);
                setModalVisible(true);
              }}
              style={styles.logoutBtn}
            >
              <Text style={styles.logoutText}>{strings.Logout}</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.versionText}>Version 1.0.2 (Build 45)</Text>
        </View>
      </ScrollView>

      <LogoutModal
        visible={modalVisible}
        onLogout={async () => {
          setModalVisible(false);
          handleLogoutPress();
        }}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  scrollContent: {
    paddingBottom: hp(10),
  },
  header: {
    backgroundColor: "#121212",
    paddingTop: hp(4),
    paddingBottom: hp(8),
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: font.TrialBold,
    color: "#FFF",
  },
  headerSettings: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFF",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: color.primary,
    opacity: 0.5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#121212",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: color.primary,
    borderWidth: 3,
    borderColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadgeIcon: {
    width: 12,
    height: 12,
    tintColor: "#000",
  },
  nameSection: {
    marginLeft: 20,
  },
  nameText: {
    fontSize: 24,
    fontFamily: font.TrialBold,
    color: "#FFF",
  },
  emailText: {
    fontSize: 14,
    fontFamily: font.TrialMedium,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
  },
  verifiedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.primary,
    marginRight: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: font.TrialBold,
    color: color.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    position: "absolute",
    bottom: -hp(5),
    left: 24,
    right: 24,
    height: hp(11),
    alignItems: "center",
    justifyContent: "space-around",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontFamily: font.TrialBold,
    color: "#121212",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: font.TrialMedium,
    color: "#757575",
    marginTop: 1,
  },
  menuContainer: {
    paddingTop: hp(8),
    paddingHorizontal: 24,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: font.TrialBold,
    color: "#757575",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F7FA",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: font.TrialMedium,
    color: "#121212",
  },
  menuArrow: {
    width: 14,
    height: 14,
    tintColor: "#BBB",
  },
  logoutBtn: {
    height: 60,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#FF3B30",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoutText: {
    fontSize: 16,
    fontFamily: font.TrialBold,
    color: "#FF3B30",
  },
  versionText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 12,
    fontFamily: font.TrialMedium,
    color: "#BBB",
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;

