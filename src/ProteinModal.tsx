import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

const ProteinModal = () => {
  const [visible, setVisible] = useState(true);

  // Dummy Protein Data for each date
  const proteinData = {
    "27 Mar": [150, 220, 180],
    "28 Mar": [197, 267, 212],
    "29 Mar": [300, 400, 250],
    Today: [120, 310, 200],
  };

  const labels = ["08:00–09:00", "13:00–14:00", "17:00–18:00"];
  const [selectedDate, setSelectedDate] = useState("Today");

  const chartHeight = 180;
  const maxValue = 1600;

  // Filtered data for selected date
  const data = proteinData[selectedDate] || [];
  const minValue = Math.min(...data);
  const totalProtein = data.reduce((a, b) => a + b, 0);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>Protein</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Date Tabs */}
          <View style={styles.dateTabRow}>
            {Object.keys(proteinData).map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateTab,
                  selectedDate === date && styles.activeDateTab,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dateText,
                    selectedDate === date && styles.activeDateText,
                  ]}
                >
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart Section */}
          <View style={styles.ChartContainer}>
            <View style={styles.TextContainer}>
              <Text style={styles.Text1}>Protein consumption /gram/</Text>
              <Text style={[styles.Text2,{
            marginTop:20
              }]}>
                Total consumed protein :{" "}
                <Text style={styles.boldText}>{totalProtein} gram</Text>
              </Text>
            </View>

            <View style={styles.customChartContainer}>
              {/* Y Axis */}
              <View style={styles.yAxis}>
                {[1600, 1200, 800, 400, 0].map((val, idx) => (
                  <Text key={idx} style={styles.yAxisText}>
                    {val}
                  </Text>
                ))}
              </View>

              {/* Bars */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.barsContainer}
              >
                {data.map((value, index) => {
                  const barHeight = (value / maxValue) * chartHeight;
                  const isMin = value === minValue;

                  return (
                    <View key={index} style={styles.singleBarWrapper}>
                      <Text style={styles.barValueText}>{value}g</Text>
                      {isMin && <View style={styles.barTopLine} />}
                      <View style={[styles.bar, { height: barHeight }]} />
                      <Text style={styles.barLabel}>{labels[index]}</Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ProteinModal;

const chartHeight = 180;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  dateTabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  dateTab: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
  },
  activeDateTab: {
    backgroundColor: "#6fe0acff",
  },
  dateText: {
    fontSize: 14,
    color: "#000",
  },
  activeDateText: {
    color: "#fff",
    fontWeight: "600",
  },
  ChartContainer: {
    backgroundColor: "white",
    paddingBottom: 20,
  },
  TextContainer: {
    marginTop: 20,
    gap: 8,
  },
  Text1: {
    fontSize: 16,
    fontWeight: "500",
  },
  Text2: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: "600",
    color: "#000",
  },
  customChartContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  yAxis: {
    height: chartHeight,
    justifyContent: "space-between",
    marginRight: 8,
  },
  yAxisText: {
    fontSize: 12,
    color: "#000",
  },
  barsContainer: {
    flexDirection: "row",
    height: chartHeight,
    flex: 1,
  },
  singleBarWrapper: {
    alignItems: "center",
    width: (Dimensions.get("window").width - 100) / 3,
    marginHorizontal: 5,
    height: chartHeight,
    justifyContent: "flex-end",
    borderWidth: 0.8,
    borderRadius: 10,
    borderColor: "#666",
  },
  barValueText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bar: {
    width: 12,
    backgroundColor: "#6fe0acff",
    borderRadius: 5,
  },
  barTopLine: {
    position: "absolute",
    top: 20,
    width: "320%",
    height: 1.5,
    left: 5,
    backgroundColor: "#6fe0acff",
    borderRadius: 1,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    marginBottom: 12,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#6fe0acff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  closeBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
