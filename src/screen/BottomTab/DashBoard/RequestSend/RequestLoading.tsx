import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import StatusBarComponent from '../../../../compoent/StatusBarCompoent';
import imageIndex from '../../../../assets/imageIndex';
import ScreenNameEnum from '../../../../routes/screenName.enum';

const { width } = Dimensions.get('window');

interface RouteParams {
  parcelId: {
    parcel: {
      id: string;
    };
  };
}

interface WSMessage {
  type?: string;
  offers?: any[];
  status?: string;
}

const RequestLoading = () => {
  // Animation refs
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // State
  const [driverStatus, setDriverStatus] = useState('Searching for available drivers...');
  const [statusDetails, setStatusDetails] = useState('Connecting to delivery network');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;

  // Navigation
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { parcelId } = (route?.params as RouteParams) || {};

  // Update status details based on driver status
  const updateStatusDetails = (status: string) => {
    const statusMap: Record<string, string> = {
      DRIVER_FOUND: 'Driver confirmed • Preparing pickup',
      ON_THE_WAY: 'Driver en route • ETA calculating',
      PICKED_UP: 'Parcel collected • In transit',
      DELIVERED: 'Parcel delivered successfully',
    };
    setStatusDetails(statusMap[status] || 'Connecting to delivery network');
  };

  // WebSocket connection function
  const connectSocket = async (token: string): Promise<void> => {
    try {
      if (!parcelId?.parcel?.id) {
        throw new Error('Parcel ID not found');
      }

      const wsUrl = `wss://aitechnotech.in/DAINA/ws/parcel/${parcelId.parcel.id}?token=${token}&role=user`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        setRetryCount(0);
        socketRef.current = ws;
      };

      ws.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          console.log('📨 Received:', data);

          if (data?.type === 'offers_update') {
            navigation.replace(ScreenNameEnum.OfferOR, {
              Parcelid: data.offers,
              id: parcelId,
            });
          }

          if (data?.status) {
            setDriverStatus(data.status);
            updateStatusDetails(data.status);
          }
        } catch (e) {
          console.warn('Failed to parse message:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setError('Connection error. Retrying...');
      };

      ws.onclose = (event) => {
        console.log('⚠️ WebSocket closed:', event.reason);
        setIsConnected(false);
        
        // Auto-reconnect logic
        if (retryCount < maxRetries) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            handleReconnect();
          }, Math.min(1000 * Math.pow(2, retryCount), 10000));
        } else {
          setError('Connection failed. Please try again.');
        }
      };

      socketRef.current = ws;
    } catch (error) {
      console.error('Socket connection error:', error);
      setError('Failed to connect. Please check your internet.');
      throw error;
    }
  };

  // Reconnect handler
  const handleReconnect = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await connectSocket(token);
      }
    } catch (error) {
      console.error('Reconnect failed:', error);
    }
  };

  // Manual retry
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    handleReconnect();
  };

  // Initialize animations
  useEffect(() => {
    // Spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      })
    ).start();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const init = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }
        await connectSocket(token);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();

    return () => {
      console.log('🛑 Cleaning up...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  // Interpolations
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.4],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Request</Text>
          <Text style={styles.headerSubtitle}>
            We're finding the best match for you
          </Text>
        </View>

        {/* Animated Loader */}
        <Animated.View 
          style={[
            styles.loaderSection,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.circleContainer}>
            {/* Pulse circles */}
            <Animated.View
              style={[
                styles.pulseCircle,
                { 
                  opacity: pulseOpacity, 
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseCircle,
                styles.pulseCircle2,
                { 
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            
            {/* Main spinner */}
            <Animated.View 
              style={[
                styles.mainCircle,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <View style={styles.innerCircle}>
                <Image 
                  source={imageIndex.Location} 
                  style={styles.locationIcon} 
                  resizeMode="contain"
                />
              </View>
            </Animated.View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressFill, { width: progressWidth }]}
              />
            </View>
            <Text style={styles.progressText}>Searching in progress...</Text>
          </View>
        </Animated.View>

        {/* Status Information */}
        <View style={styles.infoSection}>
          <Text style={styles.primaryStatus}>{driverStatus}</Text>
          <Text style={styles.secondaryStatus}>{statusDetails}</Text>
          
          {/* Status Timeline */}
          <View style={styles.statusIndicators}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, styles.dotActive]} />
              <Text style={styles.statusLabel}>Request Sent</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <View style={[
                styles.statusDot, 
                driverStatus.includes('DRIVER') || driverStatus.includes('FOUND')
                  ? styles.dotActive 
                  : styles.dotInactive
              ]} />
              <Text style={styles.statusLabel}>Driver Matching</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <View style={[
                styles.statusDot,
                driverStatus.includes('PICKED') 
                  ? styles.dotActive 
                  : styles.dotInactive
              ]} />
              <Text style={styles.statusLabel}>Pickup</Text>
            </View>
          </View>
        </View>

        {/* Connection Status */}
        <Animated.View 
          style={[
            styles.connectionStatus,
            { 
              opacity: fadeAnim,
              backgroundColor: error ? '#FFF5F5' : '#F8F8FA',
              borderColor: error ? '#FF3B30' : isConnected ? '#34C759' : '#FF9500',
            }
          ]}
        >
          <View style={[
            styles.connectionDot, 
            error ? styles.error : isConnected ? styles.connected : styles.connecting
          ]} />
          <Text style={[
            styles.connectionText,
            error && { color: '#FF3B30' }
          ]}>
            {error || (isConnected ? 'Live tracking active' : 'Connecting...')}
          </Text>
          {error && retryCount < maxRetries && (
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Info Note */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteIcon}>⏱️</Text>
          <Text style={styles.noteText}>
            This usually takes 1-2 minutes. Please wait while we find the perfect driver.
          </Text>
        </View>

        {/* Retry count indicator (for debugging) */}
        {retryCount > 0 && (
          <View style={styles.retryInfo}>
            <ActivityIndicator size="small" color="#FF9500" />
            <Text style={styles.retryInfoText}>
              Reconnecting... Attempt {retryCount}/{maxRetries}
            </Text>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6E6E73',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loaderSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pulseCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
  },
  pulseCircle2: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#5856D6',
  },
  mainCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    width: 40,
    height: 40,
    tintColor: '#007AFF',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFCC00',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6E6E73',
    fontWeight: '500',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryStatus: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  secondaryStatus: {
    fontSize: 16,
    color: '#6E6E73',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  dotActive: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  dotInactive: {
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  statusLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusDivider: {
    width: 30,
    height: 2,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 8,
    marginBottom: 18,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connected: {
    backgroundColor: '#34C759',
  },
  connecting: {
    backgroundColor: '#FF9500',
  },
  error: {
    backgroundColor: '#FF3B30',
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFCC00',
    alignItems: 'flex-start',
  },
  noteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#6E6E73',
    lineHeight: 20,
  },
  retryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
  },
  retryInfoText: {
    fontSize: 12,
    color: '#FF9500',
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default RequestLoading;