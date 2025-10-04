import React, { useEffect, useRef } from 'react';
import { SafeAreaView, Animated, ImageBackground, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { color } from '../../../constant';
import imageIndex from '../../../assets/imageIndex';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import { styles } from './style';

type RootStackParamList = {
  Home: undefined;
};

const Splash: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Fade animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Navigate to Home after 2 seconds
    const timer = setTimeout(() => {
      // navigation.replace(ScreenNameEnum.EarningsScreen);
      navigation.replace(ScreenNameEnum.OnboardingScreen);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <ImageBackground
      style={styles.container}
      source={imageIndex.bag} // Your background image
      resizeMode="cover"
    >
      <StatusBarComponent backgroundColor={color.white} />

      {/* Centered Logo with fade-in */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <FastImage
            style={styles.logo}
            source={imageIndex.appLogo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default Splash;
