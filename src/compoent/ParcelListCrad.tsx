import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import imageIndex from "../assets/imageIndex";

const parcels = [
  {
    id: "5R9G87R",
    date: "14 May 2023",
    from: "1234 Elm Street Springfield, IL 62701",
    to: "5678 Maple Avenue Seattle, WA 98101",
    status: "Delivered",
    statusColor: "green",
    icon: imageIndex.Icon, // replace with your icon
  },
  {
    id: "7X1K90P",
    date: "10 May 2023",
    from: "45 Park Lane, New York, NY",
    to: "78 Ocean Drive, Miami, FL",
    status: "In Transit",
    statusColor: "orange",
    icon: imageIndex.Icon, // replace with your icon
  },
];

export default function ParcelList() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {parcels.map((item, index) => (
        <View key={index} style={styles.card}>
          {/* Top Row */}
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <Image
                source={item.icon}
                style={{ height: 32, width: 32, resizeMode: "contain" }}
              />
            </View>
            <Text style={styles.cardId}>#{item.id}</Text>
            <Text style={styles.cardDate}>{item.date}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* From / To */}
          <Text style={styles.label}>From</Text>
          <Text style={styles.value}>{item.from}</Text>

          <Text style={styles.label}>To</Text>
          <Text style={styles.value}>{item.to || "—"}</Text>

          {/* Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>Delivery Status:</Text>
            <Text style={[styles.statusValue, { color: item.statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FB",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",

    // Shadow (iOS + Android)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EAFBF2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardId: {
    fontWeight: "700",
    fontSize: 15,
    color: "#000",
    marginRight: 8,
  },
  cardDate: {
    fontSize: 13,
    color: "#888",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 10,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 6,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  statusText: {
    fontSize: 13,
    color: "#555",
    marginRight: 6,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: "700",
  },
});
