import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import font from '../../../theme/font';
import strings from '../../../localization/Localization';
import imageIndex from '../../../assets/imageIndex';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { logout } from '../../../redux/feature/authSlice';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import { GetProfileApi } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';

const VerificationPending: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await GetProfileApi(() => { });
      if (response) {
        dispatch(loginSuccess({ userData: response }));
        // If status changed to something else, navigation logic will handle it in App.tsx or TabNav
        // But for now, just updating state is good.
      }
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await AsyncStorage.removeItem('authData');
    navigation.replace(ScreenNameEnum.SPLASH_SCREEN);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFCC00" colors={["#FFCC00"]} />
        }
      >
        <View style={styles.content}>
          {/* Top Illustration/Icon */}
          <View style={styles.illustrationContainer}>
            <View style={styles.circleBg}>
              <Icon name="shield-checkmark-outline" size={80} color="#FFCC00" />
            </View>
            <View style={styles.pulseContainer}>
              <View style={styles.pulse} />
            </View>
          </View>

          {/* Text Content */}
          <Text style={styles.title}>{strings.VerificationTitle}</Text>
          <Text style={styles.subtitle}>{strings.VerificationSubtitle}</Text>

          <View style={styles.infoCard}>
            <Icon name="time-outline" size={24} color="#64748B" />
            <Text style={styles.description}>{strings.VerificationDescription}</Text>
          </View>

          {/* Steps / Checklist */}
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <Icon name="checkmark-circle" size={22} color="#10B981" />
              <Text style={styles.checkText}>Documents Uploaded</Text>
            </View>
            <View style={styles.checkItem}>
              <Icon name="ellipsis-horizontal-circle" size={22} color="#FFCC00" />
              <Text style={styles.checkText}>Admin Verification (In Progress)</Text>
            </View>
            <View style={styles.checkItem}>
              <Icon name="radio-button-off" size={22} color="#E2E8F0" />
              <Text style={styles.checkText}>Account Activation</Text>
            </View>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <Text style={styles.refreshBtnText}>Check Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutBtnText}>{strings.Logout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  illustrationContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FEF3C7',
    opacity: 0.5,
    zIndex: 1,
  },
  pulse: {
    // Simulating a pulse effect visually
  },
  title: {
    fontSize: 24,
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 40,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontFamily: font.MonolithRegular,
    marginLeft: 15,
    lineHeight: 20,
  },
  checklist: {
    width: '100%',
    paddingHorizontal: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  checkText: {
    fontSize: 14,
    color: '#334155',
    fontFamily: font.MonolithRegular,
    marginLeft: 12,
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
  },
  refreshBtn: {
    backgroundColor: '#FFCC00',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#FFCC00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  refreshBtnText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: font.MonolithRegular,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutBtnText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: font.MonolithRegular,
  },
});

export default VerificationPending;
