import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import imageIndex from '../../../assets/imageIndex';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomHeader from '../../../compoent/CustomHeader';
import CustomButton from '../../../compoent/CustomButton';

const UploadDocumentsScreen = () => {
  const [idDoc, setIdDoc] = useState(null);
  const [licenseDoc, setLicenseDoc] = useState(null);
  const [vehicleDoc, setVehicleDoc] = useState(null);

  // File picker function
  const pickDocument = async (type:any) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles], // you can restrict to images/pdf
      });

      if (type === "id") setIdDoc(res[0]);
      if (type === "license") setLicenseDoc(res[0]);
      if (type === "vehicle") setVehicleDoc(res[0]);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled upload");
      } else {
        console.log("Error: ", err);
      }
    }
  };

  const handleContinue = () => {
    if (!idDoc || !licenseDoc || !vehicleDoc) {
      alert("Please upload all documents!");
      return;
    }
    // 👇 Ye API call ka placeholder hai
    console.log("ID: ", idDoc);
    console.log("License: ", licenseDoc);
    console.log("Vehicle: ", vehicleDoc);

    alert("Documents uploaded successfully!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label={"Upload Document"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >

        {/* Upload ID */}
        <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument("id")}>
          <Image source={imageIndex.document} style={{ height: 18, width: 18 }} />
          <Text style={styles.uploadText}>
            {idDoc ? idDoc.name : "Upload ID"}
          </Text>
        </TouchableOpacity>

        {/* Driving License */}
        <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument("license")}>
          <Image source={imageIndex.document} style={{ height: 18, width: 18 }} />
          <Text style={styles.uploadText}>
            {licenseDoc ? licenseDoc.name : "Driving License"}
          </Text>
        </TouchableOpacity>

        {/* Vehicle Papers */}
        <TouchableOpacity style={styles.uploadBox} onPress={() => pickDocument("vehicle")}>
          <Image source={imageIndex.document} style={{ height: 18, width: 18 }} />
          <Text style={styles.uploadText}>
            {vehicleDoc ? vehicleDoc.name : "Vehicle Papers"}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
        <CustomButton
          title={"Continue"}
          onPress={handleContinue}
        />
      </View>
    </SafeAreaView>
  );
};

export default UploadDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingTop: 38
  },
  uploadBox: {
    width: '90%',
    borderWidth: 1.4,
    borderStyle: 'dashed',
    borderColor: '#FFCC00',
    borderRadius: 10,
    paddingVertical: 25,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  }
});
