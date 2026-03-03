import { StyleSheet } from "react-native";
import font from "../../../../theme/font";
 export const styles = StyleSheet.create({
  container: {
    flex: 1,
     backgroundColor: "#fff",
     marginHorizontal:15
  },
  sectionTitle: {
    fontSize: 16,
     marginTop: 20,
    marginBottom: 10,
    color: "black",
    fontFamily:font.MonolithRegular
  },
  input: {
     borderWidth: 1.5,
    borderColor: "#F0F0F0",
    borderRadius: 10,
    paddingHorizontal: 15,
    height:55,
    backgroundColor: "#fff",
     justifyContent: "space-between",
    color:"black" ,
    fontFamily:font.MonolithRegular,
    fontSize:15 ,
    flexDirection:"row",
    alignItems:"center",
    paddingVertical:15,
    marginBottom:15
    
    
  },
  placeholderText: {
    color: "#ADA4A5",
    fontSize: 15,
    fontFamily:font.MonolithRegular
  },
  packageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  packageBox: {
    width: "30%",
    paddingVertical: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    marginTop:11,
  },
  packageText: {
    fontSize: 14,
    color: "#333",
    fontFamily:font.MonolithRegular,

  },
  selectedBox: {
    borderColor: "#FFD600",
    backgroundColor: "#FFFBE6",
  },
  selectedText: {
    color: "#FFD600",
    fontWeight: "600",
  },
  submitBtn: {
    marginTop: 30,
    backgroundColor: "#FFD600",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: font.MonolithRegular,
  },
  imageUploadButton: {
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderStyle: "dotted",
    marginTop: 5,
    marginBottom: 11,
  },
  imageUploadButtonFilled: {
    borderColor: "#ADA4A5",
  },
  imageUploadButtonEmpty: {
    borderColor: "#EAEAEA",
  },
  parcelImage: {
    height: 150,
    width: "100%",
    borderRadius:10


  },
  imageUploadPlaceholderText: {
    fontSize: 18,
    fontFamily: font.MonolithRegular,
    color: "#ADA4A5",
  },
});
