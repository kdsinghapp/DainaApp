import { StyleSheet, Platform } from "react-native";
import font from "../../../../theme/font";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },

  topRow: {
    marginTop: 8,
    marginBottom: 4,
  },

  pill: {
    width: 180,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD600",
    justifyContent: "center",
    overflow: "hidden",
  },
  pillHalf: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  pillLeftText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,

  },
  pillRightText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,

  },
  knob: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: 80,
    borderRadius: 20,
    backgroundColor: "#fff",
  },
  onlineText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: font.MonolithRegular,
    textAlign: "center",
  },

  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: "black",
    fontFamily: font.MonolithRegular

  },
  sectionTitle1: {
    fontSize: 15,
    color: "black",
    fontFamily: font.MonolithRegular
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 6,
    borderRadius: 30,
    marginBottom: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10

  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#FFCC00",
    height: 45,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  tabText: {
    fontSize: 14,
    color: "#1C1B1B", fontFamily: font.MonolithRegular


  },
  tabTextActive: {
    color: "white",
    fontFamily: font.MonolithRegular
    ,
    fontSize: 15,


  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card1: {
    flex: 1,
    // backgroundColor: "#FFCC00",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FFCC00",
    marginHorizontal: 6,

  },
  icon: {
    height: 28,
    width: 28,
    marginBottom: 11,
  },
  title: {
    color: "black",
    fontSize: 14,
    marginTop: 8
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,

    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#d6e1f9ff",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  cardId: {
    fontSize: 15,
    marginRight: 8,
    color: "black",
  },
  bold: {
    fontFamily: font.MonolithRegular
    , fontSize: 16, color: "black"
  },
  cardDate: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 35
  },
  label: {
    fontSize: 14,
    color: "#BABFC5",
    fontFamily: font.MonolithRegular,
  },
  value: {
    fontSize: 14,
    color: "#76889A",
    fontFamily: font.MonolithRegular,
    marginTop: 10,

  },
  statusRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#555",
    marginRight: 6,
    fontFamily: font.MonolithRegular,
  },
  statusValue: {
    fontSize: 13,
    fontFamily: font.MonolithRegular,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

});
