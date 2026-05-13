import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import font from '../../../theme/font';
import strings from '../../../localization/Localization';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { logout } from '../../../redux/feature/authSlice';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import { GetProfileApi } from '../../../Api/apiRequest';
import { loginSuccess } from '../../../redux/feature/authSlice';

const { width } = Dimensions.get('window');

const VerificationPending: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1800 }),
        withTiming(1, { duration: 1800 })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1800 }),
        withTiming(0.3, { duration: 1800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onRefresh = async () => {
    setRefreshing(true);
    buttonScale.value = withSequence(withSpring(0.95), withSpring(1));
    try {
      const response = await GetProfileApi(() => { });
      if (response) {
        dispatch(loginSuccess({ userData: response }));
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

  const StepItem = ({ icon, title, subtitle, status, index }: any) => {
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';

    return (
      <Animated.View 
        entering={FadeInRight.delay(400 + (index * 150)).springify()}
        style={[styles.stepItem, isCurrent && styles.activeStepItem]}
      >
        <View style={[styles.stepIconContainer, isCompleted && styles.completedIconContainer]}>
          <Icon 
            name={isCompleted ? "checkmark-circle" : icon} 
            size={22} 
            color={isCompleted ? "#10B981" : (isCurrent ? "#FFCC00" : "#94A3B8")} 
          />
        </View>
        <View style={styles.stepTextContent}>
          <Text style={[styles.stepTitle, isCurrent && styles.activeStepTitle]}>{title}</Text>
          <Text style={styles.stepSubtitle}>{subtitle}</Text>
        </View>
        {isCurrent && (
          <View style={styles.activeIndicator}>
            <Animated.View style={[styles.activeDot, { opacity: pulseOpacity }]} />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBarComponent backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
           <Icon name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Status</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate(ScreenNameEnum.HelpSupport)}>
           <Icon name="help-circle-outline" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#FFCC00" 
            colors={["#FFCC00"]} 
          />
        }
      >
        <View style={styles.content}>
          {/* Animated Illustration Section */}
          <View style={styles.illustrationSection}>
            <Animated.View style={[styles.pulseCircle, animatedPulseStyle]} />
            <Animated.View style={[styles.pulseCircle, animatedPulseStyle, { transform: [{ scale: 1.1 }] }]} />
            <Animated.View entering={ZoomIn.duration(800)} style={styles.mainIconContainer}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>UNDER REVIEW</Text>
              </View>
              <Icon name="shield-checkmark" size={70} color="#FFCC00" />
            </Animated.View>
          </View>

          {/* Typography Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.textSection}>
            <Text style={styles.mainTitle}>{strings.VerificationPending || "Verification Pending"}</Text>
            <Text style={styles.mainSubtitle}>
              {strings.VerificationSubtitle || "Your profile is currently being reviewed by our administrative team. We appreciate your patience."}
            </Text>
          </Animated.View>

          {/* Timeline Section */}
          <View style={styles.timelineContainer}>
            <StepItem 
              index={0}
              icon="document-text-outline" 
              title="Identity & Documents" 
              subtitle="All documents received successfully." 
              status="completed" 
            />
            <View style={styles.connector} />
            <StepItem 
              index={1}
              icon="search-outline" 
              title="Manual Review" 
              subtitle="Admin is currently verifying your profile." 
              status="current" 
            />
            <View style={styles.connector} />
            <StepItem 
              index={2}
              icon="rocket-outline" 
              title="Start Earning" 
              subtitle="Get access to nearby parcel requests." 
              status="pending" 
            />
          </View>

          {/* Detailed Info Card */}
          <Animated.View entering={FadeInUp.delay(1000)} style={styles.infoCard}>
             <View style={styles.infoIconBox}>
                <Icon name="time-outline" size={20} color="#FFCC00" />
             </View>
             <View style={styles.infoTextBox}>
                <Text style={styles.infoTitle}>Why the delay?</Text>
                <Text style={styles.infoDesc}>
                  Verification typically takes 24-48 hours. We ensure all partners meet our safety standards.
                </Text>
             </View>
          </Animated.View>
        </View>

        {/* Action Section */}
        <Animated.View entering={FadeInDown.delay(1200)} style={styles.footer}>
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}
              activeOpacity={0.8}
              disabled={refreshing}
            >
              <Text style={styles.refreshBtnText}>Refresh Status</Text>
              <Icon name="sync-outline" size={18} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.supportLink} 
            onPress={() => navigation.navigate(ScreenNameEnum.HelpSupport)}
          >
            <Text style={styles.supportLinkText}>Need help? Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: '#0F172A',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    alignItems: 'center',
    paddingTop: 30,
  },
  illustrationSection: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pulseCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFCC00',
  },
  mainIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    }),
  },
  statusBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: font.MonolithRegular,
    letterSpacing: 1,
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  mainTitle: {
    fontSize: 28,
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    marginBottom: 10,
  },
  mainSubtitle: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: font.MonolithRegular,
    textAlign: 'center',
    lineHeight: 22,
  },
  timelineContainer: {
    width: '100%',
    marginBottom: 30,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeStepItem: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FEF3C7',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#FFCC00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  completedIconContainer: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  stepTextContent: {
    flex: 1,
    marginLeft: 15,
  },
  stepTitle: {
    fontSize: 15,
    color: '#334155',
    fontFamily: font.MonolithRegular,
  },
  activeStepTitle: {
    color: '#0F172A',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
    marginTop: 2,
  },
  connector: {
    width: 2,
    height: 15,
    backgroundColor: '#F1F5F9',
    marginLeft: 37,
  },
  activeIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFCC00',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '100%',
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextBox: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 14,
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: font.MonolithRegular,
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  refreshBtn: {
    flexDirection: 'row',
    backgroundColor: '#FFCC00',
    width: width - 48,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFCC00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  refreshBtnText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: font.MonolithRegular,
  },
  supportLink: {
    marginTop: 20,
    padding: 10,
  },
  supportLinkText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: font.MonolithRegular,
    textDecorationLine: 'underline',
  },
});

export default VerificationPending;
