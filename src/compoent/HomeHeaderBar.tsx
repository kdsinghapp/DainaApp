import React from "react";
import { View,Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import imageIndex from "../assets/imageIndex";
import font from "../theme/font";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import Ionicons from "react-native-vector-icons/Ionicons";

const HomeHeaderBar = ({ location = "Wallace, Australia", onLocationPress, onNotificationPress, hasNotification = true }) => {
  return (
    <View>
        <Text style={{
            color:"#878787",
            fontSize:12,
            paddingHorizontal: 5,
             fontFamily:font.MonolithRegular
        }}>Current location</Text>

    <View style={styles.container}>
        
       <TouchableOpacity style={styles.locationContainer} onPress={onLocationPress}>
      <Image source={imageIndex.location1} 
      
      style={{
        height:22,
        width:22
      }}
      />

        <Text style={styles.locationText}>{location}</Text>
        <Image  
           
      style={{
        height:22,
        width:22 ,
       }}
      
        source={imageIndex.arrowqdown}/>

      </TouchableOpacity>

       <TouchableOpacity style={styles.notificationContainer} onPress={onNotificationPress}>
        <Image source={imageIndex.Notification} 
           
      style={{
        height:44,
        width:44
      }}
 
        
        />
        {/* {hasNotification && <View style={styles.badge} />} */}
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
     backgroundColor: "#fff",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 15,
     marginHorizontal: 5,
    color: "#000",
    fontFamily:font.MonolithRegular

  },
  notificationContainer: {
    position: "relative",
    padding: 8,
    borderRadius: 10,
 
  },
  badge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
});

export default HomeHeaderBar;
