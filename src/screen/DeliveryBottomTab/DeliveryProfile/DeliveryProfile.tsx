// ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./style";
import strings from "../../../localization/Localization";
import NewOrderNotificationModal from "../../../compoent/NewOrderNotificationModal";
import OfferAcceptedModal from "../../../compoent/OfferAcceptedModal";

type Props = {
  onEditProfile?: () => void;
  onAddress?: () => void;
  onOrders?: () => void;
  onChangePassword?: () => void;
  onPrivacyPolicy?: () => void;
  onTerms?: () => void;
  onLogout?: () => void;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
};


const ListItem = ({
  icon,
  label,
  onPress,
  secure = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  secure?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.row,
      { opacity: pressed ? 0.6 : 1, },
    ]}
  >
    <View style={styles.left}>
      <View style={[styles.iconWrap, secure && styles.secureIconWrap]}>
        {icon}
      </View>
      <Text style={styles.rowLabel}>{label} {"  "}</Text>
    </View>
    <Image source={imageIndex.right}

      style={{
        height: 22,
        width: 22
      }}
    />

  </Pressable>
);

const DeliveryProfile: React.FC<Props> = ({

  user = {
    name: "Marcus Aminoff",
    email: "marcus.aminoff@gmail.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
  },
}) => {
  const navigation: any = useNavigation()
  const [Modal, setModal] = useState(false)
  const [isLoading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const isLogin: any = useSelector<any>((state) => state?.auth?.userData);
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
      setLoading(false)

    }
  };
  const handleLogout = () => {
    setModal(false);
    dispatch(logout());
    AsyncStorage.removeItem('authData');
    navigation.replace(ScreenNameEnum.SPLASH_SCREEN);
  };
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent />
      <NewOrderNotificationModal />
      <OfferAcceptedModal />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.title}>{strings.Profile}</Text>

        {/* Profile card */}
        <TouchableOpacity

          onPress={() => {
            navigation.navigate(ScreenNameEnum.EditProfileDeliver)
          }}
          style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {isLogin?.image ? (
              <Image source={{ uri: isLogin?.image }} style={styles.avatar} />
            ) : (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            )}




          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.name, {
              color: "#FFCC00",
              fontFamily: font.MonolithRegular

            }]}>{isLogin?.firstName}</Text>

            <Text style={[styles.email, {
              color: "#9DB2BF",
              fontFamily: font.MonolithRegular
            }]}>{isLogin?.email}

            </Text>
            <Text style={[styles.email, {
              color: "#9DB2BF",
              fontFamily: font.MonolithRegular
            }]}>

              {isLogin?.phoneNumber}

            </Text>
          </View>
          <Image source={imageIndex.right}

            style={{
              height: 22,
              width: 22
            }}
          />
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.card}>

          {/* <ListItem
            icon={<SvgIndex.Earing />}
            label={strings.EarningsReports}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.EarningsScreen)
            }}
          /> */}
          <ListItem
            icon={<Image source={imageIndex.document}

              style={{
                height: 34,
                width: 34,
              }}
            />}
            label={strings.DocumentShow}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.DocumentShow)
            }}
          />

          <ItemDivider />
          {/* <ListItem
            icon={<SvgIndex.Wallert />}
            label={strings.Wallet}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.WalletScreen)
            }} /> */}
          <ItemDivider />
          {/* <ListItem
            icon={<SvgIndex.Notiftaction />}
            label={strings.Notifications}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.NotificationsSetting)
            }} /> */}
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Edit />}
            label={strings.ChangeLanguage}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.language);
            }}
          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Soupport />}
            label={strings.Support}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.HelpSupport)
            }}

            secure
          />
          <ItemDivider />

          <ListItem
            icon={<SvgIndex.Privacys />}
            label={strings.PrivacyPolicy}
            onPress={() => {
              navigation.navigate(ScreenNameEnum.LegalPoliciesScreen)
            }}
          />
          <ItemDivider />

          <ListItem
            icon={<SvgIndex.Logout />}
            label={strings.Logout}
            onPress={() => {
              setModal(true)
            }} />
        </View>

        {/* Logout */}

        <LogoutModal
          visible={Modal}
          onCancel={() => setModal(false)}
          onLogout={() => {
            handleLogout()
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ItemDivider = () => <View style={styles.divider} />;



export default DeliveryProfile;
