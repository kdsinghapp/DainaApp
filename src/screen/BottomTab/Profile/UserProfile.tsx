// ProfileScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
   ScrollView,
} from "react-native";
import SvgIndex from "../../../assets/svgIndex";
import font from "../../../theme/font";
import imageIndex from "../../../assets/imageIndex";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { useNavigation } from "@react-navigation/native";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import LogoutModal from "../../../compoent/LogoutModal";
import { SafeAreaView } from "react-native-safe-area-context";
 
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
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  </Pressable>
);

const ProfileScreen: React.FC<Props> = ({
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
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent/>
      <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Profile</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={[styles.avatarInitials,]}>
                  {user?.name?.slice(0, 1) ?? "U"}
                </Text>
              </View>
            )}
            <View style={styles.statusDot}>
              <Image source={imageIndex.eoditphots} style={{
                height:22,
                width:22
              }}/>
              {/* <Feather name="camera" size={12} color="#fff" /> */}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.name,{
              color:"#FFCC00",
              fontFamily:font.MonolithRegular

            }]}>{user?.name}</Text>
            <Text style={[styles.email,{
              color:"#9DB2BF" ,
              fontFamily:font.MonolithRegular
            }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.card}>
          <ListItem
            icon={<SvgIndex.Edit   />}
            label="Edit Profile"
            onPress={()=>{
              na.navigate(ScreenNameEnum.EditProfile)
           }}
          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Edit   />}
            label="My Address"
            onPress={()=>{
              na.navigate(ScreenNameEnum.AddressScreen)
           }}
          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Box  />}
            label="My Orders"
            onPress={()=>{
              na.navigate(ScreenNameEnum.OrdersPrfile)
           }}          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Lockss  />}
            label="Change Password"
             onPress={()=>{
              na.navigate(ScreenNameEnum.changePassword)
           }}
            
            secure
          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Privacy />}
            label="Privacy Policy"
            onPress={()=>{
               na.navigate(ScreenNameEnum.PrivacyPolicy)
            }}
          />
          <ItemDivider />
          <ListItem
            icon={<SvgIndex.Terms   />}
            label="Terms and Conditions"
            onPress={()=>{
              na.navigate(ScreenNameEnum.LegalPoliciesScreen)
             }}          />
        </View>

        {/* Logout */}
        <Pressable
          onPress={()=>{
            setModal(true)
          }}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          android_ripple={{ color: "#fff" }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
        <LogoutModal
        
        
        visible ={Modal}
        
      onLogout={()=>setModal(false)}
      onCancel={()=>setModal(false)}
        
        
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const ItemDivider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  container: { padding: 16, paddingBottom: 28 },
  title: { fontSize: 22, fontFamily:font.MonolithRegular, color: TEXT, marginBottom: 12 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
 
  },
  avatarWrap: { marginRight: 15 },
  avatar: { width: 70, height: 70, borderRadius: 10 },
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
    borderRadius: 16,
    
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
     alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  secureIconWrap: {
    backgroundColor: "#FFF1C2",
  },
  rowLabel: { fontSize: 15, color: TEXT ,fontFamily:font.MonolithRegular },
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

export default ProfileScreen;
