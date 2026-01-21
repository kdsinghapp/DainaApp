import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
   Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomButton from '../../../compoent/CustomButton';
import ScreenNameEnum from '../../../routes/screenName.enum';
import imageIndex from '../../../assets/imageIndex';
import AsyncStorage from '@react-native-async-storage/async-storage';
import font from '../../../theme/font';
import { errorToast } from '../../../utils/customToast';
import { styles } from './style';
 
const ChooseRole = () => {
  const [selected, setSelected] = useState<any>(null);
  const navigation = useNavigation();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const options = [
    { id: 1,type:"user", label: 'User', image: imageIndex.userLogo },
    { id: 2, type:"Delivery",label: 'Delivery', image: imageIndex.deliver },
  ];

  useEffect(() => {
    // Smooth fade-in and scale animation on screen load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelect = (item: any) => {
    setSelected(item);

    // Pulse animation on selection
    pulseAnim.setValue(1);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.08,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 3,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = async () => {
    if (!selected) {
      errorToast('Please select your role before proceeding.');
       return;
    }
    await AsyncStorage.setItem('selectedRole', selected.type);
    navigation.navigate(ScreenNameEnum.SocialLogin);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBarComponent />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.container,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Header Image */}
          <Animated.Image
            source={imageIndex.phonLogoapp}
            style={[styles.image, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Choose your user Role</Text>

          {/* Options */}
          {options.map((item) => {
            const isSelected = selected?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.touchContainer}
                activeOpacity={0.9}
                onPress={() => handleSelect(item)}
              >
                <Animated.View
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    {
                      transform: [
                        {
                          scale: isSelected ? pulseAnim : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={[
                      styles.optionIcon,
                      { tintColor: isSelected ? 'white' : '#FFCC00' },
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <CustomButton
          title="Continue"
          onPress={handleNext}
          style={styles.nextButton}
          textStyle={styles.nextButtonText}
        />
      </View>
    </SafeAreaView>
  );
};

export default ChooseRole;
 