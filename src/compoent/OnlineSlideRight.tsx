// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Animated,
//   PanResponder,
//   Dimensions,
//   Image,
//   Alert,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Geolocation from '@react-native-community/geolocation';
 
// import imageIndex from '../assets/imageIndex';
// import font from '../theme/font';

// const { width } = Dimensions.get('window');

// interface SlideButtonProps {
//   title?: string;
//   onSlideSuccess?: () => void;
  
// }

// const OnlineSlideRight: React.FC<SlideButtonProps> = ({
//   title = 'Continue',
//   onSlideSuccess,
//   isOnline,
//    setIsOnline
// }) => {
//   const translateX = useRef(new Animated.Value(0)).current;
//   const maxSlide = width * 0.75;
//   const [statusData, setData] = useState(null);
//   // const [isOnline, setIsOnline] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState({ lat: null, lon: null });

//   // Fetch initial online status on component mount
//   // useEffect(() => {
//   //   const fetchInitialStatus = async () => {
//   //     try {
//   //       const token = await AsyncStorage.getItem('token');
//   //       if (!token) return;

//   //       const response = await fetch(
//   //         'https://aitechnotech.in/DAINA/api/driver/location',
//   //         {
//   //           method: 'GET',
//   //           headers: {
//   //             'Content-Type': 'application/json',
//   //             Authorization: `Bearer ${token}`,
//   //           },
//   //         }
//   //       );

//   //       const data = await response.json();
//   //       if (data.status && data?.data) {
//   //         setIsOnline(data?.data?.status === 'online');
//   //         setData(data?.data);
//   //       }
//   //     } catch (error) {
//   //       console.log('Fetch initial status error:', error);
//   //     }
//   //   };

//   //   fetchInitialStatus();
//   // }, []);

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,

//       onPanResponderMove: (_, gesture) => {
//         if (gesture.dx >= 0 && gesture.dx <= maxSlide - 70) {
//           translateX.setValue(gesture.dx);
//         }
//       },

//       onPanResponderRelease: (_, gesture) => {
//         if (gesture.dx > maxSlide - 120) {
//           Animated.timing(translateX, {
//             toValue: maxSlide - 70,
//             duration: 200,
//             useNativeDriver: true,
//           }).start(() => {
//             toggleOnlineStatus(); // Call API on slide success
//           });
//         } else {
//           Animated.spring(translateX, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;

// const toggleOnlineStatus = async () => {
//   try {
//     setLoading(true); // show loading while API works
//     const token = await AsyncStorage.getItem('token');

//     // Get current location
//     let lat = currentLocation.lat;
//     let lon = currentLocation.lon;

//     // If location not already fetched, get it now
//     if (!lat || !lon) {
//       await new Promise((resolve) => {
//         Geolocation.getCurrentPosition(
//           (position) => {
//             lat = position.coords.latitude.toString();
//             lon = position.coords.longitude.toString();
//             setCurrentLocation({ lat, lon });
//             resolve(null);
//           },
//           (error) => {
//             console.log('Location error:', error);
//             resolve(null);
//           },
//           { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
//         );
//       });
//     }

//     // Determine the new status based on current isOnline state
//     const newStatus = isOnline ? "online" : "offline";

//     const requestBody = {
//       lat: lat || "0",
//       lon: lon || "0",
//       status: newStatus,
//     };

//     console.log('Request Body:', requestBody);

//     const response = await fetch(
//       'https://aitechnotech.in/DAINA/api/driver/location',
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       }
//     );

//     const data = await response.json();
//     console.log('API Response:', data);

//     if (data.status) {
//       // Set status based on API response
//       setIsOnline(data?.data?.status === 'online');
//       setData(data?.data);
//       // Reset slider to initial state after successful update
//       Animated.spring(translateX, {
//         toValue: 0,
//         useNativeDriver: true,
//       }).start();
//       // onSlideSuccess()
//     } else {
//       // Alert.alert('Error', data.message || 'Something went wrong!');
//       // Reset slider if API fails
//       Animated.spring(translateX, {
//         toValue: 0,
//         useNativeDriver: true,
//       }).start();
//     }
//   } catch (error) {
//     console.log('Toggle Error:', error);
//     Animated.spring(translateX, {
//       toValue: 0,
//       useNativeDriver: true,
//     }).start();
//     // Alert.alert('Error', 'Unable to update status.');
//   } finally {
//     setLoading(false);
//   }
// };



//   /* ================= UI ================= */

//   return (
//     <View style={styles.container}>
//       <View style={styles.slider}>
//         <View style={styles.arrowWrapper}>
//           <Text style={styles.onlineText}>
//             {/* {isOnline ? 'ONLINE' : 'OFFLINE'} */}
//             {statusData?.status}
//           </Text>
//         </View>

//         <Animated.View
//           {...panResponder.panHandlers}
//           style={[styles.button, { transform: [{ translateX }] }]}
//         >
//           <View style={styles.iconRow}>
//             <Image source={imageIndex.go} style={styles.goIcon} />
//             <Image source={imageIndex.rightaArrow} style={styles.arrowIcon} />
//           </View>
//         </Animated.View>
//       </View>
//       {loading && (
//         <Text style={{ color: '#fff', marginTop: 8 }}>Updating status...</Text>
//       )}
//     </View>
//   );
// };

// export default OnlineSlideRight;

// const styles = StyleSheet.create({
//   container: {
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   slider: {
//     width: '100%',
//     height: 58,
//     backgroundColor: '#000',
//     borderRadius: 40,
//     justifyContent: 'center',
//   },
//   arrowWrapper: {
//     position: 'absolute',
//     right: 25,
//   },
//   onlineText: {
//     color: '#FFCC00',
//     fontSize: 18,
//     fontFamily: font.MonolithRegular,
//   },
//   button: {
//     position: 'absolute',
//     left: 0,
//     width: 140,
//     height: 50,
//     backgroundColor: '#000',
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   goIcon: {
//     height: 50,
//     width: 50,
//   },
//   arrowIcon: {
//     height: 22,
//     width: 22,
//     marginLeft: 8,
//   },
// });


import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import font from '../theme/font';
import { base_url } from '../Api';

interface Props {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
}

const FloatingOnlineButton: React.FC<Props> = ({ isOnline, setIsOnline }) => {
  const insets = useSafeAreaInsets();
  
  // Existing button scale
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // New Animation: Pulse Effect
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: string | null;
    lon: string | null;
  }>({ lat: null, lon: null });

  // Pulse Loop Logic
  useEffect(() => {
    if (isOnline && !loading) {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isOnline, loading]);

  const pressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const toggleOnlineStatus = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      let lat = currentLocation.lat;
      let lon = currentLocation.lon;

      if (!lat || !lon) {
        await new Promise((resolve) => {
          Geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude.toString();
              lon = position.coords.longitude.toString();
              setCurrentLocation({ lat, lon });
              console.log(position)
              resolve(null);
            },
            (error) => { resolve(null); },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
          );
        });
      }

      const requestBody = {
        lat: lat || '0',
        lon: lon || '0',
        status: isOnline ? 'offline' : 'online',
      };

      const response = await fetch(`${base_url}/driver/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(data)
      if (data?.status) {
        setIsOnline(data?.data?.status === 'online');
      }
    } catch (error) {
      console.log('Toggle Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Interpolate pulse values
  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6], // Grows to 1.6x the size
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0], // Fades out
  });

  return (
    <View style={[styles.container, { bottom: insets.bottom + 80 }]}>
      <View style={styles.buttonWrapper}>
        
        {/* Animated Pulse Circle */}
        {isOnline && !loading && (
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
        )}

        {/* Main Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleOnlineStatus}
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={[
              styles.button,
              { backgroundColor: isOnline ? '#000' : '#000' }
            ]}
          >
            <Text style={styles.buttonText}>
              {isOnline ? 'GO \n OFFLINE' : 'GO \n ONLINE'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* <Text style={styles.statusText}>
        {loading
          ? 'Updating...'
          : isOnline
          ? 'You are Online'
          : 'You are Offline'}
      </Text> */}
    </View>
  );
};

export default FloatingOnlineButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  buttonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100, // Extra space for the pulse
    width: 100,
  },
  pulseCircle: {
    position: 'absolute',
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#000', // Matches online color
    borderWidth: 2,
    borderColor: '#000',
  },
  button: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 5,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily:font.MonolithRegular
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: '#000', // Changed to black for visibility on white bg, change back if needed
    fontFamily: font.MonolithRegular,
  },
});