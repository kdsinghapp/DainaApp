import { StyleSheet, Dimensions } from "react-native";
import { color } from "../../../constant";
import font from "../../../theme/font";

 
export const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    alignItems: "center",
    paddingTop: 38,
    paddingBottom: 20,
  },
  uploadBox: {
    width: "90%",
    height: 150,
    borderWidth: 1.4,
    borderStyle: "dashed",
    borderColor: "#FFCC00",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    // backgroundColor: "#FFFBEA",
  },
  icon: {
    height: 40,
    width: 40,
    tintColor: "#FFB800",
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  buttonWrapper: {
    marginHorizontal: 20,
    marginBottom: 25,
  },

 });
