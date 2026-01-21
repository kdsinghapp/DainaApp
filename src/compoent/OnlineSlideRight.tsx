import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
import imageIndex from '../assets/imageIndex';
import font from '../theme/font';

const { width } = Dimensions.get('window');

interface SlideButtonProps {
  title?: string;
  onSlideSuccess?: () => void;
}

const OnlineSlideRight: React.FC<SlideButtonProps> = ({
  title = 'Continue',
  onSlideSuccess,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSlide = width * 0.75;

  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (_, gesture) => {
        if (gesture.dx >= 0 && gesture.dx <= maxSlide - 70) {
          translateX.setValue(gesture.dx);
        }
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > maxSlide - 120) {
          Animated.timing(translateX, {
            toValue: maxSlide - 70,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            toggleOnlineStatus(); // Call API on slide success
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

const toggleOnlineStatus = async () => {
  try {
    setLoading(true); // show loading while API works
    const token = await AsyncStorage.getItem('token');

    // Determine the new status
    const newStatus = isOnline ? 0 : 1; // 1 = online, 0 = offline

    const requestBody = {
      lat: "28.9008",
      lon: "77.2092",
      status: newStatus,
    };

    console.log('Request Body:', requestBody);

    const response = await fetch(
      'https://aitechnotech.in/DAINA/api/driver/location',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    console.log('API Response:', data);

    if (data.status === '1') {
      setIsOnline((prev) => !prev);
    } else {
      Alert.alert('Error', data.message || 'Something went wrong!');
      // Reset slider if API fails
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  } catch (error) {
    console.log('Toggle Error:', error);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    Alert.alert('Error', 'Unable to update status.');
  } finally {
    setLoading(false);
  }
};



  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <View style={styles.slider}>
        <View style={styles.arrowWrapper}>
          <Text style={styles.onlineText}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
        </View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.button, { transform: [{ translateX }] }]}
        >
          <View style={styles.iconRow}>
            <Image source={imageIndex.go} style={styles.goIcon} />
            <Image source={imageIndex.rightaArrow} style={styles.arrowIcon} />
          </View>
        </Animated.View>
      </View>
      {loading && (
        <Text style={{ color: '#fff', marginTop: 8 }}>Updating status...</Text>
      )}
    </View>
  );
};

export default OnlineSlideRight;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  slider: {
    width: '100%',
    height: 58,
    backgroundColor: '#000',
    borderRadius: 40,
    justifyContent: 'center',
  },
  arrowWrapper: {
    position: 'absolute',
    right: 25,
  },
  onlineText: {
    color: '#FFCC00',
    fontSize: 18,
    fontFamily: font.MonolithRegular,
  },
  button: {
    position: 'absolute',
    left: 0,
    width: 140,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goIcon: {
    height: 50,
    width: 50,
  },
  arrowIcon: {
    height: 22,
    width: 22,
    marginLeft: 8,
  },
});
