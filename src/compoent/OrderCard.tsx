import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import imageIndex from "../assets/imageIndex";
import font from "../theme/font";
import { color } from "../constant";
import { STATUS_COLORS, STATUS_LABELS } from "../utils/Constant";
 

// Define the colors based on your design
const YELLOW = "#FFCC00";
const TEXT = "#0F0F0F";
const MUTED = "#7C7C7C";
const CARD_BG = "#FFFFFF";
const BORDER = "#EFEFEF";

const OrderCard = ({ order, onPress }: { order: any; onPress: () => void }) => {
         const isoTime = order?.createdAt;

 

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
   const statusKey =  order.deliveryStatus;
    const statusLabel = STATUS_LABELS[statusKey] || 'Unknown';
    const statusColor = STATUS_COLORS[statusKey] || 'black';
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
          <Text style={styles.cardId}>#{order.trackingId || order.id} <Text style={{color:MUTED,    fontFamily: font.MonolithRegular,
}}> •</Text></Text>
          {/* <Text style={styles.cardDate}> {order?.deliveryStatus}</Text> */}
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
        <Text style={[styles.statusValue,{
          color:statusColor
        }]}>
          {statusLabel}
          {/* Going To Pickup */}
  {/* {order.deliveryStatus
    ? order.deliveryStatus.charAt(0).toUpperCase() +
      order.deliveryStatus.slice(1).toLowerCase()
    : "Pending"} */}
</Text>
        </View>
      </View>
      <View style={{
        backgroundColor:color.baground,
        width:"40%" ,
        padding:6,
        borderRadius:10,
        marginTop:10,
        alignItems:"center",
        justifyContent:"center"
      }}>
              <Text style={[styles.viewDetailsText,{
                color:"black"
              }]}>View Details</Text>
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
    fontSize: 16,
    color: "#4CAF50", // Green for status
     fontFamily: font.MonolithRegular,
  },
  viewDetailsText: {
  fontSize: 14,
    color: color.baground,
    // textDecorationLine: "underline",
     fontFamily: font.MonolithRegular,
  },
});