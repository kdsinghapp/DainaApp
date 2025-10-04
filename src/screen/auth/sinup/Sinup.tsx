import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import imageIndex from '../../../assets/imageIndex';
import { color } from '../../../constant';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomButton from '../../../compoent/CustomButton';
import ScreenNameEnum from '../../../routes/screenName.enum';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
};

const Sinup: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBarComponent backgroundColor={color.baground} />
      <View style={styles.container}>
        <FastImage
          style={styles.logo}
          source={imageIndex.appLogo}
          resizeMode={FastImage.resizeMode.contain}
        />
        {/* Empty View to push button to bottom */}
        <View style={styles.flexGrow} />
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Create an account"
            onPress={() => navigation.navigate(ScreenNameEnum.OnboardingScreen)}
          />
          <View style={styles.spacing} />
          <CustomButton 
            style={{
              borderWidth: 1,
              backgroundColor: "white",
              borderColor: "#4CBCA6",
            }} 
            textStyle={{
              color: color.primary,
            }}
            title="Already have an account"
            onPress={() => navigation.navigate(ScreenNameEnum.OnboardingScreen)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',marginTop:230
  },
  logo: {
    height: 130,
    width: 130,
    marginTop: 50,
  },
  flexGrow: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30, // Space from bottom
    justifyContent:"center" ,
    alignItems:"center"
  },
  spacing: {
    height: 10, 
   },
});

export default Sinup;
