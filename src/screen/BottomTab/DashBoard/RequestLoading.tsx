import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io, { Socket } from 'socket.io-client';
import { useNavigation, useRoute } from '@react-navigation/native';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import imageIndex from '../../../assets/imageIndex';
import ScreenNameEnum from '../../../routes/screenName.enum';
import font from '../../../theme/font';

const RequestLoading = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [driverStatus, setDriverStatus] = useState('Waiting for driver confirmation');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const route: any = useRoute()
  const { parcelId } = route?.params || ""
  const navigation:any = useNavigation()


  const connectSocket = (token: string,) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const wsUrl = `wss://aitechnotech.in/DAINA/ws/parcel/${parcelId?.parcel?.id}?token=${token}&role=user`;
        const ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          setIsConnected(true);
          socketRef.current = ws;
          resolve();
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.type == "offers_update") {
              navigation.navigate(ScreenNameEnum.OfferOR, {
                Parcelid: data?.offers,
                id: parcelId
              });
            }
            if (data?.status) {
              setDriverStatus(data.status);
            }
          } catch (e) {
            console.warn('Failed to parse message:', e);
          }
        };
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
          reject(error);
        };

        ws.onclose = (event) => {
          console.log('⚠️ WebSocket closed:', event.reason);
          setIsConnected(false);
        };
      } catch (error) {
        console.log('⚠️ error closed:', error);

        reject(error);
      }
    });
  };


   useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

   useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
           return;
        }
        await connectSocket(token);
        socketRef.current?.on('parcelStatusUpdate', (data: any) => {
          console.log('📦 Parcel status update:', data);
          if (data?.status) {
            setDriverStatus(data.status);
          }
        });
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    };

    init();

    return () => {
      console.log('🛑 Disconnecting socket...');
      socketRef.current?.disconnect();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.loaderContainer}>
          <Animated.View style={[styles.circle, { transform: [{ rotate: spin }] }]}>
            <Image source={imageIndex.Location} style={styles.locationIcon} />
          </Animated.View>

          <Animated.View
            style={[
              styles.pulseCircle,
              { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseCircle,
              styles.pulseCircle2,
              { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
            ]}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.loadingTitle}>Finding Your Perfect Delivery</Text>
          <Text style={styles.driverStatus}>{driverStatus}</Text>
        </View>

        <Animated.View style={[styles.statusContainer, { opacity: pulseOpacity }]}>
          <Text style={styles.statusText}>✓ Request Sent • Live tracking active</Text>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFCC00' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    position: 'relative',
    height: 200,
    width: 200,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locationIcon: { height: 60, width: 60, tintColor: '#FFCC00' },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  pulseCircle2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  textContainer: { alignItems: 'center', marginBottom: 32 },
  loadingTitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontFamily: font.MonolithRegular
  },
  driverStatus: { color: 'white', marginTop: 8, fontSize: 16 },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  statusText: { fontSize: 15, color: 'black', fontWeight: '600', letterSpacing: 0.3 },
});

export default RequestLoading;
