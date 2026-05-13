import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  FadeInDown,
  ZoomIn,
  FadeInRight,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import font from '../theme/font';
import strings from '../localization/Localization';
import ScreenNameEnum from '../routes/screenName.enum';
import { STATUS } from '../utils/Constant';
import { useDeliveryContext } from '../context/DeliveryContext';
import { stopNotificationSound } from '../utils/soundPlayer';

const { width, height } = Dimensions.get('window');

const PulseIndicator = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulseCircle, animatedStyle]} />
  );
};

const NewOrderNotificationModal: React.FC = () => {
  const ctx = useDeliveryContext();
  const navigation = useNavigation();

  if (!ctx) return null;

  const {
    newOrderNotification,
    setNewOrderNotification,
    acceptCounterOffer,
    acceptCounterOfferLoading,
    RejectcounterOffer,
  } = ctx;

  const data = newOrderNotification?.data as any;

  if (!newOrderNotification?.visible) return null;

  const isCounterOffer = data?.type === 'counter_offer';

  // Helper to render a data row
  const DataRow = ({ icon, label, value, color = "#64748B" }: { icon: string, label: string, value: string, color?: string }) => (
    <View style={styles.dataRow}>
      <View style={[styles.rowIconContainer, { backgroundColor: `${color}10` }]}>
        <Icon name={icon} size={wp(4)} color={color} />
      </View>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  const InfoBox = ({ label, value, icon, color = "#FFCC00" }: { label: string, value: string, icon: string, color?: string }) => (
    <View style={styles.infoBox}>
      <Icon name={icon} size={wp(4.5)} color={color} style={{ marginBottom: 4 }} />
      <Text style={styles.infoBoxLabel}>{label}</Text>
      <Text style={styles.infoBoxValue}>{value}</Text>
    </View>
  );

  const closeNotification = () => {
    setNewOrderNotification(null);
    stopNotificationSound();
  };

  return (
    <Modal
      isVisible={!!newOrderNotification?.visible}
      onBackdropPress={closeNotification}
      onBackButtonPress={closeNotification}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.4}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modalContainer}
    >
      <Animated.View entering={FadeInDown.springify().damping(15)} style={styles.modalCard}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <PulseIndicator />
            <Animated.View entering={ZoomIn.delay(300)} style={styles.headerIconCircle}>
              <Icon
                name={isCounterOffer ? "cash-outline" : "cube"}
                size={wp(7)}
                color="#000000"
              />
            </Animated.View>
          </View>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {isCounterOffer ? strings.CounterOfferReceived : strings.NewDeliveryRequest}
            </Text>
            <View style={styles.badgeRow}>

              {data?.trackingId && (
                <View style={styles.trackingBadge}>
                  <Text style={styles.trackingIdText}>#{data.trackingId}</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={closeNotification}
            style={styles.closeIconButton}
          >
            <Icon name="close" size={wp(5.5)} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Price/Value Section if available */}
          {(data?.price || data?.amount || data?.offer_price) && (
            <Animated.View entering={FadeInRight.delay(400)} style={styles.priceContainer}>
              <Text style={styles.priceLabel}>{isCounterOffer ? 'Offer Price' : 'Estimated Earnings'}</Text>
              <Text style={styles.priceValue}>₮{data?.price || data?.amount || data?.offer_price}</Text>
            </Animated.View>
          )}



          {/* Location Path (Timeline) */}
          <View style={styles.pathContainer}>
            <View style={styles.pathTimeline}>
              <View style={styles.pathDotContainer}>
                <View style={[styles.pathDot, { backgroundColor: '#10B981' }]} />
                <View style={styles.pathLine} />
                <View style={[styles.pathDot, { backgroundColor: '#EF4444' }]} />
              </View>

              <View style={styles.pathContent}>
                <View style={styles.pathBlock}>
                  <Text style={styles.pathLabel}>{strings.Pickup || 'Pickup Address'}</Text>
                  <Text style={styles.pathAddress} numberOfLines={2}>
                    {data?.pickup?.location || data?.sender?.address || 'N/A'}
                  </Text>
                </View>

                <View style={styles.pathSpacer} />

                <View style={styles.pathBlock}>
                  <Text style={styles.pathLabel}>{strings.Drop || 'Drop Address'}</Text>
                  <Text style={styles.pathAddress} numberOfLines={2}>
                    {data?.drop?.location || data?.receiver?.address || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>



        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.btnLater}
            onPress={() => {
              if (isCounterOffer && data?.offerId != null) {
                RejectcounterOffer(data.offerId);
              } else {
                setNewOrderNotification(null);
              }
              stopNotificationSound();
            }}
          >
            <Text style={styles.btnLaterText}>{strings.Later || strings.Cancel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnAction, acceptCounterOfferLoading && { opacity: 0.7 }]}
            activeOpacity={0.8}
            disabled={acceptCounterOfferLoading}
            onPress={() => {
              if (isCounterOffer) {
                if (data?.offerId != null) {
                  acceptCounterOffer(data.offerId);
                  stopNotificationSound();
                }
              } else {
                navigation.navigate(ScreenNameEnum.ParcelDetails as never, {
                  item: {
                    data: data,
                    deliveryStatus: STATUS.PENDING,
                  },
                } as never);
                setNewOrderNotification(null);
                stopNotificationSound();
              }
            }}
          >
            <Text style={styles.btnActionText}>
              {isCounterOffer ? strings.Accept : strings.ViewDetails || 'View Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(8),
    borderTopRightRadius: wp(8),
    paddingHorizontal: wp(6),
    paddingBottom: hp(4),
    paddingTop: hp(1.5),
    maxHeight: hp(85),

    width: '100%',

  },
  handleBar: {
    width: wp(12),
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  headerIconWrapper: {
    width: wp(15),
    height: wp(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconCircle: {
    width: wp(14),
    height: wp(14),
    borderRadius: wp(4.5),
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pulseCircle: {
    position: 'absolute',
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    backgroundColor: '#FFCC00',
    zIndex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: wp(4),

  },
  headerTitle: {
    fontSize: wp(5),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: wp(2.5),
    fontFamily: font.MonolithRegular,
    textTransform: 'uppercase',
  },
  trackingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trackingIdText: {
    fontSize: wp(2.8),
    color: '#64748B',
    fontFamily: font.MonolithRegular,
  },
  closeIconButton: {
    padding: wp(2),
    backgroundColor: '#F8FAFC',
    borderRadius: wp(3),
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  priceContainer: {
    backgroundColor: '#0F172A',
    borderRadius: wp(4),
    padding: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: wp(3.5),
    fontFamily: font.MonolithRegular,
  },
  priceValue: {
    color: '#FFCC00',
    fontSize: wp(5.5),
    fontFamily: font.MonolithRegular,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(3),
    marginBottom: hp(3),
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: wp(4),
    paddingVertical: wp(3),
    paddingHorizontal: wp(2),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoBoxLabel: {
    fontSize: wp(2.6),
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoBoxValue: {
    fontSize: wp(3.5),
    color: '#1E293B',
    fontFamily: font.MonolithRegular,
  },
  pathContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    padding: wp(4),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: hp(3),
  },
  pathTimeline: {
    flexDirection: 'row',
  },
  pathDotContainer: {
    alignItems: 'center',
    width: wp(4),
    paddingTop: wp(1.5),
  },
  pathDot: {
    width: wp(2.5),
    height: wp(2.5),
    borderRadius: wp(1.25),
  },
  pathLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
    borderStyle: 'dashed',
  },
  pathContent: {
    flex: 1,
    marginLeft: wp(4),
  },
  pathBlock: {
    flex: 1,
  },
  pathLabel: {
    fontSize: wp(2.8),
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pathAddress: {
    fontSize: wp(3.8),
    color: '#1E293B',
    fontFamily: font.MonolithRegular,
    lineHeight: wp(5),

  },
  pathSpacer: {
    height: hp(3),
  },
  detailsContainer: {
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    marginBottom: hp(1.5),
  },
  detailsList: {
    gap: hp(1.5),
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3.5),
  },
  rowIconContainer: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowLabel: {
    fontSize: wp(2.8),
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
  },
  rowValue: {
    fontSize: wp(3.5),
    color: '#334155',
    fontFamily: font.MonolithRegular,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: wp(3),
    padding: wp(3),
    gap: wp(2),
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  noteText: {
    flex: 1,
    fontSize: wp(3.2),
    color: '#92400E',
    fontFamily: font.MonolithRegular,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    gap: wp(3),
  },
  btnLater: {
    flex: 1,
    height: hp(7),
    borderRadius: wp(4),
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLaterText: {
    fontSize: wp(4),
    color: '#64748B',
    fontFamily: font.MonolithRegular,
  },
  btnAction: {
    flex: 2,
    height: hp(7),
    borderRadius: wp(4),
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',

  },
  btnActionText: {
    fontSize: wp(4),
    color: '#000000',
    fontFamily: font.MonolithRegular,
  },
});

export default NewOrderNotificationModal;

