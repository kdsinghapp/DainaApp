import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ActivityIndicator, Platform, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import font from '../theme/font';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import strings from '../localization/Localization';
import { base_url, WebSocket_Url } from '../Api';
import { GetProfileApi } from '../Api/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/feature/authSlice';

const { width } = Dimensions.get('window');

interface Props {
  isOnline: boolean;
  setIsOnline: (val: boolean) => void;
  coords?: { lat?: number; lon?: number };
  onSlideSuccess?: (newStatus: boolean) => void;
}

const OnlineOfflineButton: React.FC<Props> = ({
  isOnline,
  setIsOnline,
  coords,
  onSlideSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const userData: any = useSelector((state: any) => state.auth.userData);
  const dispatch = useDispatch();

  // Pulse animation when online
  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
      sessionRef.current = setInterval(() => setSessionSeconds(s => s + 1), 1000);
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      if (sessionRef.current) clearInterval(sessionRef.current);
      setSessionSeconds(0);
    }
    return () => {
      if (sessionRef.current) clearInterval(sessionRef.current);
    };
  }, [isOnline]);

  const formatSession = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getProfileApi = async () => {
    try {
      const response = await GetProfileApi(setIsProfileLoading);
      if (response) dispatch(loginSuccess({ userData: response }));
    } catch (_) { }
  };

  const toggleOnlineStatus = async () => {
    if (loading) return;
    const targetOnline = !isOnline;
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const lat = coords?.lat ?? 0;
      const lon = coords?.lon ?? 0;
      const statusStr = targetOnline ? 'online' : 'offline';

      const response = await axios.post(
        `${base_url}/driver/location`,
        { status: statusStr, lat, lon },
        { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
      );

      // WebSocket notification (fire-and-forget)
      try {
        const ws = new WebSocket(`${WebSocket_Url}/driver-live?token=${token}`);
        ws.onopen = () => {
          ws.send(JSON.stringify({ status: statusStr, lat, lon }));
          setTimeout(() => ws.close(), 1500);
        };
      } catch (_) { }

      if (response.data?.status === 1 || response.status === 200) {
        setIsOnline(targetOnline);
        onSlideSuccess?.(targetOnline);
        await getProfileApi();
      }
    } catch (error) {
      console.error('❌ Status Toggle Error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      {/* Status badge */}
      <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
        <Animated.View
          style={[
            styles.dot,
            isOnline ? styles.dotOnline : styles.dotOffline,
            isOnline && { transform: [{ scale: pulseAnim }] },
          ]}
        />
        <Text style={[styles.badgeText, { color: isOnline ? '#0f6e56' : '#5F5E5A' }]}>
          {userData?.onlineStatus}
        </Text>
      </View>

      {/* Toggle button */}
      <TouchableOpacity
        onPress={toggleOnlineStatus}
        disabled={loading}
        activeOpacity={0.85}
        style={[
          styles.button,
          isOnline ? styles.buttonOnline : styles.buttonOffline,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isOnline ? '#FFF' : '#7B3F00'} />
        ) : (
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="power"
              size={22}
              color={isOnline ? '#FFF' : '#7B3F00'}
              style={styles.icon}
            />
            <Text style={[styles.text, { color: isOnline ? '#FFF' : '#7B3F00' }]}>
              {isOnline ? strings.SlideToGoOffline : strings.SlideToGoOnline}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Hint */}


    </View>
  );
};

export default OnlineOfflineButton;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeOnline: { backgroundColor: '#e1f5ee' },
  badgeOffline: { backgroundColor: '#F1EFE8' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOnline: { backgroundColor: '#1d9e75' },
  dotOffline: { backgroundColor: '#888780' },
  badgeText: { fontSize: 13, fontFamily: font.MonolithRegular, fontWeight: '500' },
  button: {
    width: width * 0.85,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOnline: {
    backgroundColor: '#FFCC00',
    ...Platform.select({
      ios: { shadowColor: '#7B3F00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
    }),
  },
  buttonOffline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontFamily: font.MonolithRegular, letterSpacing: 0.3 },
  hint: { fontSize: 13, color: '#888780', fontFamily: font.MonolithRegular },
  card: {
    width: width * 0.85,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: 4,

  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#F1EFE8',
  },
  statLabel: { fontSize: 13, color: '#888780' },
  statValue: { fontSize: 13, fontWeight: '500', color: '#2C2C2A' },
});