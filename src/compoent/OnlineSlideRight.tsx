import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import font from '../theme/font';
import { base_url } from '../Api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import strings from '../localization/Localization';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.85;
const KNOB_SIZE = 54;
const SLIDE_DISTANCE = SLIDER_WIDTH - KNOB_SIZE - 10;

interface Props {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  coords?: any;
  onSlideSuccess?: () => void;
}

const OnlineSlideRight: React.FC<Props> = ({ isOnline, setIsOnline, coords, onSlideSuccess }) => {
  const pan = useRef(new Animated.Value(isOnline ? SLIDE_DISTANCE : 0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);

  // Initialize location from props if available
  const [currentLocation, setCurrentLocation] = useState<{
    lat: string | null;
    lon: string | null;
  }>({
    lat: coords?.lat?.toString() || null,
    lon: coords?.lon?.toString() || null,
  });

  // Update location if props change
  useEffect(() => {
    if (coords?.lat && coords?.lon) {
      setCurrentLocation({
        lat: coords.lat.toString(),
        lon: coords.lon.toString(),
      });
    }
  }, [coords]);

  useEffect(() => {
    Animated.spring(pan, {
      toValue: isOnline ? SLIDE_DISTANCE : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {
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
  }, [isOnline]);

  const toggleOnlineStatus = async (targetOnline: boolean) => {
    if (loading) return;
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    // Optimistic UI update
    setIsOnline(targetOnline);

    try {
      // Prioritize coords from props if available
      let lat = coords?.lat?.toString() || currentLocation.lat;
      let lon = coords?.lon?.toString() || currentLocation.lon;

      if (!lat || !lon) {
        try {
          const position = await new Promise<any>((resolve, reject) => {
            Geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 10000,
            });
          });
          lat = position.coords.latitude.toString();
          lon = position.coords.longitude.toString();
          setCurrentLocation({ lat, lon });
        } catch (locError) {
          console.warn('Location fetch failed:', locError);
          // If we still don't have location, we cannot go online
          if (targetOnline) {
            setIsOnline(false);
            setLoading(false);
            return;
          }
        }
      }

      // Final check: if we are going online, we MUST have location
      if (targetOnline && (!lat || !lon || lat === '0' || lon === '0')) {
        setIsOnline(false);
        setLoading(false);
        return;
      }

      const requestBody = {
        lat: lat || '0',
        lon: lon || '0',
        status: targetOnline ? 'online' : 'offline',
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
      console.log('📡 Driver Location API Response:', data);

      if (response.status === 200 || data.status === 1 || data.status === '1') {
        await AsyncStorage.setItem('driverOnlineStatus', targetOnline ? 'online' : 'offline');
        if (targetOnline && onSlideSuccess) {
          onSlideSuccess();
        }
      } else {
        // API rejected the status change
        console.warn('❌ API status update failed:', data.message);
        setIsOnline(!targetOnline);
      }
    } catch (error) {
      __DEV__ && console.warn('Toggle Error:', error);
      setIsOnline(!targetOnline);
    } finally {
      setLoading(false);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !loading,
      onMoveShouldSetPanResponder: () => !loading,
      onPanResponderMove: (_, gestureState) => {
        if (loading) return;
        let newX = isOnline ? SLIDE_DISTANCE + gestureState.dx : gestureState.dx;
        if (newX < 0) newX = 0;
        if (newX > SLIDE_DISTANCE) newX = SLIDE_DISTANCE;
        pan.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (loading) return;
        const threshold = SLIDE_DISTANCE / 2;
        const currentX = isOnline ? SLIDE_DISTANCE + gestureState.dx : gestureState.dx;

        if (!isOnline && currentX > threshold) {
          // Slide to Online
          Animated.spring(pan, {
            toValue: SLIDE_DISTANCE,
            useNativeDriver: true,
          }).start();
          toggleOnlineStatus(true);
        } else if (isOnline && currentX < threshold) {
          // Slide to Offline
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          toggleOnlineStatus(false);
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: isOnline ? SLIDE_DISTANCE : 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const bgInterpolation = pan.interpolate({
    inputRange: [0, SLIDE_DISTANCE],
    outputRange: ['#FFCC00', '#FFCC00'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.3, 0],
  });

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[styles.sliderTrack, { backgroundColor: bgInterpolation }]}>
        <Text style={styles.trackText}>
          {isOnline ? strings.SlideToGoOffline : strings.SlideToGoOnline}
        </Text>

        <Animated.View
          style={[
            styles.knobContainer,
            { transform: [{ translateX: pan }] },
          ]}
          {...panResponder.panHandlers}
        >
          {isOnline && (
            <Animated.View
              style={[
                styles.pulse,
                {
                  transform: [{ scale: pulseScale }],
                  opacity: pulseOpacity,
                },
              ]}
            />
          )}
          <View style={styles.knob}>
            {loading ? (
              <ActivityIndicator size="small" color={isOnline ? '#FFCC00' : '#374151'} />
            ) : (
              <MaterialCommunityIcons
                name={isOnline ? 'power' : 'chevron-right'}
                size={32}
                color={isOnline ? '#FFCC00' : '#374151'}
              />
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default OnlineSlideRight;

const styles = StyleSheet.create({
  outerContainer: {
    // position: 'absolute',
    // bottom: 20,
    width: '100%',
    alignItems: 'center',
    // zIndex: 1000,
    marginTop: 22,

  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    paddingHorizontal: 4,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  trackText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#FFF',
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  knobContainer: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pulse: {
    position: 'absolute',
    width: KNOB_SIZE + 20,
    height: KNOB_SIZE + 20,
    borderRadius: (KNOB_SIZE + 20) / 2,
    backgroundColor: '#FFCC00',
  },
});