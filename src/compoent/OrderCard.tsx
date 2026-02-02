import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import imageIndex from "../assets/imageIndex";
import font from "../theme/font";
 

// Define the colors based on your design
const YELLOW = "#FFCC00";
const TEXT = "#0F0F0F";
const MUTED = "#7C7C7C";
const CARD_BG = "#FFFFFF";
const BORDER = "#EFEFEF";

const OrderCard = ({ order, onPress }: { order: any; onPress: () => void }) => {
  
  // Helper to format the date/time
  const formatDateTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year:'numeric'
    //   hour: "2-digit",
    //   minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      style={styles.card} 
      onPress={() => onPress()}
    >
      {/* Top Header Section */}
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Image 
            source={imageIndex.icons} // This is the parcel/box icon
            style={styles.headerIcon}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardId}>#{order.trackingId || order.id} <Text style={{color:MUTED}}> •</Text></Text>
          <Text style={styles.cardDate}> {formatDateTime(order.createdAt)}</Text>
        </View>
        {/* Price Tag */}
        {/* <View style={styles.priceContainer}>
           <Text style={styles.priceText}>$ {order.price}</Text>
        </View> */}
      </View>

      {/* Location Section with Vertical Vector */}
      <View style={styles.locationSection}>
        {/* Vertical Line Image */}
        <Image 
          source={imageIndex.Vector} 
          style={styles.vectorLine}
          resizeMode="contain"
        />

        <View style={styles.locationContent}>
          {/* Pickup */}
          <View style={styles.locationBlock}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value} numberOfLines={2}>
              {order.pickupLocation}
            </Text>
          </View>

          {/* Drop */}
          <View style={[styles.locationBlock, { marginTop: 15 }]}>
            <Text style={styles.label}>To</Text>
            <Text style={styles.value} numberOfLines={2}>
              {order.dropLocation}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Status Section */}
      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Delivery Status : </Text>
          <Text style={styles.statusValue}>
            {order.deliveryStatus ? order.deliveryStatus=="pending" ? "Waiting for Driver" : order.deliveryStatus.toUpperCase() : "PENDING"}
          </Text>
        </View>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BORDER,
    // elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconBox: {
    // backgroundColor: "#F9F9F9",
    // padding: 8,
    // borderRadius: 12,
  },
  headerIcon: {
    height: 45,
    width: 45
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    flexDirection:'row'
  },
  cardId: {
    fontFamily: font.MonolithRegular,
    fontSize: 15,
    color: TEXT,
    fontWeight: "bold",
  },
  cardDate: {
    fontFamily: font.MonolithRegular,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: "#FFF9E5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priceText: {
    fontFamily: font.MonolithRegular,
    color: YELLOW,
    fontWeight: "700",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  vectorLine: {
    height: 90,
    width: 15,
  },
  locationContent: {
    flex: 1,
    marginLeft: 15,
  },
  locationBlock: {
    flexDirection: "column",
  },
  label: {
    fontSize: 12,
    color: MUTED,
    fontFamily: font.MonolithRegular,
  },
  value: {
    fontSize: 14,
    color: TEXT,
    fontFamily: font.MonolithRegular,
    fontWeight: "500",
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 13,
    color: TEXT,
    fontFamily: font.MonolithRegular,
  },
  statusValue: {
    fontSize: 13,
    color: "#4CAF50", // Green for status
    fontWeight: "bold",
    fontFamily: font.MonolithRegular,
  },
  viewDetailsText: {
    fontSize: 13,
    color: MUTED,
    textDecorationLine: "underline",
    fontFamily: font.MonolithRegular,
  },
});