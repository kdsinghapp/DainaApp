// ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
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

 const YELLOW_DARK = "#FDB400";
const TEXT = "#1C1C1C";
const SUBTLE = "#9A9A9A";
const BORDER = "#EFEFEF";
const BG = "#FFFFFF";

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
      height:22,
      width:22
    }}
    />
 
  </Pressable>
);

const DeliveryProfile: React.FC<Props> = ({
  onEditProfile,
  onAddress,
  onOrders,
  onChangePassword,
  onPrivacyPolicy,
  onTerms,
  onLogout,
  user = {
    name: "Marcus Aminoff",
    email: "marcus.aminoff@gmail.com",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
  },
}) => {
  const na = useNavigation()
  const [Modal,setModal]= useState(false)
    const [isLoading, setLoading] = useState(false);
 
  const dispatch = useDispatch();
    const isLogin:any = useSelector <any>((state) => state?.auth?.userData);
console.log("isLogin",isLogin)
    useEffect(() => {
      getProfileApi();
    }, []);
  
  const getProfileApi = async () => {
    try {
      const response = await GetProfileApi(setLoading);
       if (response) {
        console.log("response",response)
        dispatch(loginSuccess({ userData: response}));
       } 
    } catch (error) {
      setLoading(false)
  
     }
  };
    const handleLogout = () => {
         setModal(false);

    dispatch(logout());
    AsyncStorage.removeItem('authData');
    na.replace(ScreenNameEnum.SPLASH_SCREEN); 
  }; 
  console.log("isLogin?.image",isLogin?.image)
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent/>
      <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Profile</Text>

        {/* Profile card */}
        <TouchableOpacity 
        
        onPress={()=>{
          na.navigate(ScreenNameEnum.EditProfile)
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
            <Text style={[styles.name,{
              color:"#FFCC00",
              fontFamily:font.MonolithRegular

            }]}>{isLogin?.firstName}</Text>
            <Text style={[styles.email,{
              color:"#9DB2BF" ,
              fontFamily:font.MonolithRegular
            }]}>{isLogin?.email}</Text>
          </View>
          <Image source={imageIndex.right}
    
    style={{
      height:22,
      width:22
    }}
    />
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.card}>
         
           <ListItem
            icon={<SvgIndex.Earing   />}
            label="Earnings & Reports"
            onPress={()=>{
              na.navigate(ScreenNameEnum.EarningsScreen)
           }}
          />
          <ListItem
            icon={<Image source={imageIndex.document}
            
            style={{
              height:38,
              width:38,
             }}
            />}
            label="Document Show"
            onPress={()=>{
              na.navigate(ScreenNameEnum.DocumentShow)
           }}
          />
          
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Wallert  />}
            label="Wallet"
            onPress={()=>{
              na.navigate(ScreenNameEnum.WalletScreen)
           }}          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Notiftaction  />}
            label="Notifications"
            onPress={()=>{
              na.navigate(ScreenNameEnum.NotificationsSetting)
           }}          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Soupport  />}
            label="Support"
             onPress={()=>{
              na.navigate(ScreenNameEnum.HelpSupport)
           }}
            
            secure
          />
          <ItemDivider />
 
          <ListItem
            icon={<SvgIndex.Privacys   />}
            label="Privacy Policy"
            onPress={()=>{
              na.navigate(ScreenNameEnum.LegalPoliciesScreen)
             }}    
                   />
                             <ItemDivider />

          <ListItem
            icon={<SvgIndex.Logout   />}
            label="Logout"
            onPress={()=>{
              setModal(true)
            }}        />
        </View>

        {/* Logout */}
 
        <LogoutModal
        visible ={Modal}
       onCancel={()=>setModal(false)}
          onLogout={() => {
            handleLogout()
 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ItemDivider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 22, color: TEXT, marginBottom: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 16,
     marginBottom: 16,
 marginTop:11,
  },
  avatarWrap: { marginRight: 15 },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  avatarFallback: {
    backgroundColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {  fontFamily:font.MonolithRegular, fontSize: 18, color: TEXT },
  statusDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: YELLOW_DARK,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BG,
  },
  name: { fontSize: 16,fontFamily:font.MonolithRegular, color: TEXT },
  email: { fontSize: 13, color: SUBTLE, marginTop: 5  ,fontFamily:font.MonolithRegular,},
  card: {
    backgroundColor: BG,
     marginTop:5
    
  },
  row: {
    paddingVertical: 14,
     flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop:12 ,
    marginHorizontal:5
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
     alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  secureIconWrap: {
    backgroundColor: "#FFF1C2",
  },
  rowLabel: {marginLeft:15, fontSize: 15, color: TEXT ,},
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginLeft: 54,
  },
  logoutBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFCC00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    flexDirection: "row",
    gap: 8,
  },
  logoutText: { fontSize: 14,fontFamily:font.MonolithRegular, color: TEXT },
});

export default DeliveryProfile;
