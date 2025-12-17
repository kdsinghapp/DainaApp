import { StyleSheet } from "react-native";
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
    fontWeight: "700",
  },
  pillRightText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    fontWeight: "600",
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
     fontWeight: "700",
  },
    sectionTitle1: {
    fontSize: 15,
    color: "black",
     fontWeight: "600",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
     padding: 6,
    borderRadius: 30,
    marginBottom: 12,
    height:55,
    justifyContent:"center" ,
    alignItems:"center",
    marginTop:10

  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#000000",
     height:45,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    justifyContent:"center",
    alignItems:"center"
  },
  tabText: {
    fontSize: 14,
    color: "#1C1B1B",    fontWeight: "400",

   },
  tabTextActive: {
    color: "white",
    fontWeight: "700",
     fontSize: 15,


  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
     marginTop: 20,
  },
  card1: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
     shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    height: 28,
    width: 28,
    marginBottom: 11,
   },
  title: {
    color: "#EDEDED",
    fontSize: 14,
     marginTop:8
  },
 

  card: {
    backgroundColor: "#fff",
   borderRadius: 16,
  padding: 17,
  marginBottom: 16,
  borderColor: "#eee",
  borderWidth: 1,

  // ✅ iOS shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 6,

  // ✅ Android shadow
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
  bold: { fontWeight: "700",  fontSize:16,color:"black"},
  cardDate: {
    marginLeft: "auto",
    fontSize: 13,
    color: "#9AA4AF",
    fontFamily: font.MonolithRegular,
  },

  routeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft:35
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
