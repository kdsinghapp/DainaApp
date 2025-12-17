import { StyleSheet } from "react-native";
import font from "../../../theme/font";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
    color: "black",
    fontFamily: font.MonolithRegular,
    marginTop: 20
  },
  subHeader: {
    fontSize: 14,
    textAlign: "center",
    color: "#9DB2BF",
    marginBottom: 16,
    marginTop: 5,
    fontFamily: font.MonolithRegular

  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginHorizontal: 2,
    marginTop: 5,
    borderColor: "#9DB2BF",
    borderWidth: 0.7
  },
  carrierText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
    fontFamily: font.MonolithRegular
  },
  offerText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 12,
    fontFamily: font.MonolithRegular

  },
  bold: {
    fontWeight: "600",
    color: "#111",
    fontFamily: font.MonolithRegular

  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
    ,
  },
  acceptBtn: {
    backgroundColor: "#34C759",
  },
  counterBtn: {
    backgroundColor: "#0088FF",
  },
  chatBtn: {
    backgroundColor: "#2F4858",
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
  counterText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: font.MonolithRegular

  },
  chatText: {
    color: "#fff",
    fontWeight: "600",
  },


});
