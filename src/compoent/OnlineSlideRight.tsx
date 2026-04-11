 
// import React, { useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Animated,
//   Easing,
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import Geolocation from '@react-native-community/geolocation';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import font from '../theme/font';
// import { base_url } from '../Api';

// interface Props {
//   isOnline: boolean;
//   setIsOnline: (val: boolean) => void;
// }

// const FloatingOnlineButton: React.FC<Props> = ({ isOnline, setIsOnline }) => {
//   const insets = useSafeAreaInsets();
  
//   // Existing button scale
//   const scaleAnim = useRef(new Animated.Value(1)).current;
  
//   // New Animation: Pulse Effect
//   const pulseAnim = useRef(new Animated.Value(0)).current;

//   const [loading, setLoading] = useState(false);
//   const [currentLocation, setCurrentLocation] = useState<{
//     lat: string | null;
//     lon: string | null;
//   }>({ lat: null, lon: null });

//   // Pulse Loop Logic – with cleanup to avoid leaks
//   useEffect(() => {
//     if (!isOnline || loading) {
//       pulseAnim.setValue(0);
//       return;
//     }
//     const loop = Animated.loop(
//       Animated.timing(pulseAnim, {
//         toValue: 1,
//         duration: 2000,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       })
//     );
//     loop.start();
//     return () => loop.stop();
//   }, [isOnline, loading]);

//   const pressIn = () => {
//     Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
//   };

//   const pressOut = () => {
//     Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
//   };

//   const toggleOnlineStatus = async () => {
//     if (loading) return;
//     const token = await AsyncStorage.getItem('token');
//     if (!token) return;

//     // Optimistic: UI toggle turant
//     const nextOnline = !isOnline;
//     setIsOnline(nextOnline);
//     setLoading(true);

//     try {
//       let lat = currentLocation.lat;
//       let lon = currentLocation.lon;

//       if (!lat || !lon) {
//         await new Promise<void>((resolve) => {
//           Geolocation.getCurrentPosition(
//             (position) => {
//               lat = position.coords.latitude.toString();
//               lon = position.coords.longitude.toString();
//               setCurrentLocation({ lat, lon });
//               resolve();
//             },
//             () => resolve(),
//             { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
//           );
//         });
//       }

//       const requestBody = {
//         lat: lat || '0',
//         lon: lon || '0',
//         status: nextOnline ? 'online' : 'offline',
//       };

//       const response = await fetch(`${base_url}/driver/location`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(requestBody),
//       });
 
//       const data = await response.json();
//             console.log("data",data)

//       if (data?.status) {
//         setIsOnline(data?.data?.status === 'online');
//       } else {
//         // API fail → revert UI
//         setIsOnline(!nextOnline);
//       }
//     } catch (error) {
//       __DEV__ && console.warn('Toggle Error:', error);
//       setIsOnline(!nextOnline);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Interpolate pulse values
//   const pulseScale = pulseAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.6], // Grows to 1.6x the size
//   });

//   const pulseOpacity = pulseAnim.interpolate({
//     inputRange: [0, 0.5, 1],
//     outputRange: [0.6, 0.3, 0], // Fades out
//   });

//   return (
//     <View style={[styles.container, { bottom: insets.bottom + 80 }]}>
//       <View style={styles.buttonWrapper}>
        
//         {/* Animated Pulse Circle */}
//         {isOnline && !loading && (
//           <Animated.View
//             style={[
//               styles.pulseCircle,
//               {
//                 transform: [{ scale: pulseScale }],
//                 opacity: pulseOpacity,
//               },
//             ]}
//           />
//         )}

//         {/* Main Button */}
//         <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleOnlineStatus}
//             onPressIn={pressIn}
//             onPressOut={pressOut}
//             disabled={loading}
//             style={[
//               styles.button,
//               {
//                 backgroundColor: isOnline ? '#22c55e' : '#374151',
//                 opacity: loading ? 0.85 : 1,
//               },
//             ]}
//           >
//             <Text style={styles.buttonText}>
//               {isOnline ? 'GO \n OFFLINE' : 'GO \n ONLINE'}
//             </Text>
//           </TouchableOpacity>
//         </Animated.View>
//       </View>

//       {/* <Text style={styles.statusText}>
//         {loading
//           ? 'Updating...'
//           : isOnline
//           ? 'You are Online'
//           : 'You are Offline'}
//       </Text> */}
//     </View>
//   );
// };

// export default FloatingOnlineButton;

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     left: 0,
//     right: 15,
//     alignItems: 'flex-end',
//     zIndex: 1000,
//   },
//   buttonWrapper: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 100, // Extra space for the pulse
//     width: 100,
//   },
//   pulseCircle: {
//     position: 'absolute',
//     height: 80,
//     width: 80,
//     borderRadius: 40,
//     backgroundColor: 'transparent',
//     borderWidth: 2,
//     borderColor: '#22c55e',
//   },
//   button: {
//     height: 80,
//     width: 80,
//     borderRadius: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // elevation: 5,
//     // shadowColor: '#000',
//     // shadowOffset: { width: 0, height: 2 },
//     // shadowOpacity: 0.25,
//     // shadowRadius: 3.84,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 14,
//     textAlign: 'center',
//     fontFamily: font.MonolithRegular,
//   },
//   statusText: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#000', // Changed to black for visibility on white bg, change back if needed
//     fontFamily: font.MonolithRegular,
//   },
// });



import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import font from '../theme/font';
import { base_url } from '../Api';
import { color } from '../constant';
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
  // Pulse Loop Logic – with cleanup to avoid leaks
  useEffect(() => {
    if (!isOnline || loading) {
      pulseAnim.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [isOnline, loading]);

  const pressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };
  const toggleOnlineStatus = async () => {
    if (loading) return;
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    // Optimistic: UI toggle turant
    const nextOnline = !isOnline;
    setIsOnline(nextOnline);
    setLoading(true);
    try {
      let lat = currentLocation.lat;
      let lon = currentLocation.lon;
      if (!lat || !lon) {
        await new Promise<void>((resolve) => {
          Geolocation.getCurrentPosition(
            (position) => {
              lat = position.coords.latitude.toString();
              lon = position.coords.longitude.toString();
              setCurrentLocation({ lat, lon });
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
          );
        });
      }
      const requestBody = {
        lat: lat || '0',
        lon: lon || '0',
        status: nextOnline ? 'online' : 'offline',
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
      if (response?.status == "200") {
        if (nextOnline == "online") {
          setIsOnline(nextOnline === 'online');
        }
        // setIsOnline(data?.data?.status === 'online');
      } else {
        // API fail → revert UI
        setIsOnline(!nextOnline);
      }
      // const data = await response.json();
      //       console.log("data",data)\
      // if (data?.status) {
      //   setIsOnline(data?.data?.status === 'online');
      // } else {
      //   // API fail → revert UI
      //   setIsOnline(!nextOnline);
      // }
    } catch (error) {
      __DEV__ && console.warn('Toggle Error:', error);
      setIsOnline(!nextOnline);
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
          {/* <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleOnlineStatus}
            onPressIn={pressIn}
            onPressOut={pressOut}
            disabled={loading}
            style={[
              styles.button,
              {
                backgroundColor: isOnline ? '#22c55e' : '#374151',
                opacity: loading ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.buttonText}>
              
              {isOnline ? 'GO \n OFFLINE' : 'GO \n ONLINE'}
            </Text>
          </TouchableOpacity> */}
          <View style={[
            styles.button,
            {
              backgroundColor: isOnline ? '#22c55e' : color.baground,


              opacity: loading ? 0.85 : 1,
            },
          ]}>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: '#9ca3af', true: 'white' }}
              thumbColor={isOnline ? '#22c55e' : 'white'}
              disabled={loading}
            />
            <Text style={[styles.buttonText, {
              color:   'white'
            }]}>

              {isOnline ? 'GO \n OFFLINE' : 'GO \n ONLINE'}
            </Text>
          </View>
        </Animated.View>

      </View>


    </View>
  );
};

export default FloatingOnlineButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 15,
    alignItems: 'flex-end',
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
    borderWidth: 2,
    borderColor: '#22c55e',


  },
  button: {
    height: 100,
    width: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    // elevation: 5,
    bottom:10
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: font.MonolithRegular,
    marginTop: 8,

  },
  statusText: {
    marginTop: 10,
    fontSize: 14,
    color: '#000', // Changed to black for visibility on white bg, change back if needed
    fontFamily: font.MonolithRegular,
  },
});