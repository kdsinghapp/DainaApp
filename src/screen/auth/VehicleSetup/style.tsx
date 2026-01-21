import { StyleSheet, Dimensions } from "react-native";
 import font from "../../../theme/font";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    marginHorizontal: 15,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    height: 66,
  },
  dropdownText: {
    color: "#333",
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    fontSize: 15,
    color: "#333",
  },
  uploadBox: {
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: "#FFCC00",
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  uploadText: {
    marginTop: 10,
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#FFCC00",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
     marginHorizontal:20,
    marginBottom:15
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily:font.MonolithRegular
   },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "80%",
    paddingVertical: 10,
    elevation: 6,
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#333",
  },

 });
