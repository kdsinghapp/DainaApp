import React from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import imageIndex from "../assets/imageIndex";
import font from "../theme/font";

const HomeHeaderBar = ({
  location = "Wallace, Australia",
  lable ="Current location" ,
  style1,
  onLocationPress,
  onNotificationPress,
  hasNotification = true,
}: any) => {
  return (
    <View>
      <Text style={styles.tex}>Current location</Text>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={onLocationPress}
          activeOpacity={0.7}
        >
          <Image source={imageIndex.location1} style={styles.iconSmall} />
          <Text
            style={[styles.locationText, style1]}
            numberOfLines={1}           // restrict to single line
            ellipsizeMode="tail"        // add "..." if too long
          >
            {location}
          </Text>
          <Image source={imageIndex.arrowqdown} style={styles.iconSmall} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={onNotificationPress}
        >
          <Image source={imageIndex.Notification} style={styles.iconLarge} />
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
    backgroundColor: "#fff",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,                     // allow text to shrink if needed
    marginRight: 10,             // some spacing from notification
  },
  locationText: {
    fontSize: 15,
    marginHorizontal: 5,
    color: "#000",
    fontFamily: font.MonolithRegular,
    flexShrink: 1,               // allow text to shrink
  },
  tex: {
    color: "#878787",
    fontSize: 12,
    fontFamily: font.MonolithRegular,
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
     
  },
  iconSmall: {
    width: 22,
    height: 22,
  },
  iconLarge: {
    width: 44,
    height: 44,
  },
});

export default HomeHeaderBar;
