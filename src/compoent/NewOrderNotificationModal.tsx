import React from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import font from '../theme/font';
import ScreenNameEnum from '../routes/screenName.enum';
import strings from '../localization/Localization';
import { STATUS } from '../utils/Constant';
import { useDeliveryContext } from '../context/DeliveryContext';
import { stopNotificationSound } from '../utils/soundPlayer';
import { color } from '../constant';

import { useSelector } from 'react-redux';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NewOrderNotificationModal: React.FC = () => {
  const ctx = useDeliveryContext();
  const navigation = useNavigation();
  const userData = useSelector((state: any) => state.auth.userData);

  if (!ctx || userData?.type !== 'Delivery') return null;

  const {
    newOrderNotification,
    setNewOrderNotification,
    acceptCounterOffer,
    acceptCounterOfferLoading,
    RejectcounterOffer,
  } = ctx;

  const rawData = newOrderNotification?.data as any;
  // Robustly merge parcel data if it exists nested
  const data = { ...rawData, ...(rawData?.parcel ?? {}) };
  const pickupAddress = data?.pickup?.location || data?.sender?.address || data?.pickupLocation;
  const dropAddress = data?.drop?.location || data?.receiver?.address || data?.dropLocation;

  if (!newOrderNotification?.visible) return null;

  const isCounterOffer = data?.type === 'counter_offer';

  const closeNotification = () => {
    setNewOrderNotification(null);
    stopNotificationSound();
  };

  return (
    <Modal
      isVisible={!!newOrderNotification?.visible}
      onBackdropPress={closeNotification}
      onBackButtonPress={closeNotification}
      animationIn="none"
      animationOut="none"
      backdropOpacity={0.4}
      deviceHeight={SCREEN_HEIGHT}
      deviceWidth={SCREEN_WIDTH}
      useNativeDriver
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={styles.modalContainer}
    >
      <View style={styles.modalCard}>
        {/* Header indicator or icon can go here, handleBar removed for centered modal */}

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <View style={styles.headerIconCircle}>
              <Icon
                name={isCounterOffer ? "cash-outline" : "cube"}
                size={wp(7)}
                color={color.black}
              />
            </View>
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >

          {/* Price/Value Section */}
          {/* {(data?.price || data?.amount || data?.offer_price) && (
            <View style={styles.priceContainer}>
              <View style={styles.priceIndicator} />
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>{isCounterOffer ? strings.OfferPrice : strings.EstimatedEarnings}</Text>
                <Text style={styles.priceValue}>₮ {data?.price || data?.amount || data?.offer_price}</Text>
              </View>

            </View>
          )} */}

          {/* Location Path (Timeline) */}
          {(pickupAddress || dropAddress) ? (
            <View style={styles.pathContainer}>
              <View style={styles.pathTimeline}>
                <View style={styles.pathDotContainer}>
                  {pickupAddress && (
                    <View style={styles.iconCircle}>
                      <Icon name="ellipse" size={wp(2.5)} color="#10B981" />
                    </View>
                  )}

                  {pickupAddress && dropAddress && (
                    <View style={styles.pathLineContainer}>
                      <View style={styles.pathLineDashed} />
                    </View>
                  )}

                  {dropAddress && (
                    <View style={styles.iconCircle}>
                      <Icon name="location" size={wp(3.5)} color="#EF4444" />
                    </View>
                  )}
                </View>

                <View style={styles.pathContent}>
                  {pickupAddress && (
                    <View style={styles.pathBlock}>
                      <Text style={styles.pathLabel}>{strings.Pickup || 'Pickup Address'}</Text>
                      <Text style={styles.pathAddress} numberOfLines={3}>
                        {pickupAddress}
                      </Text>
                    </View>
                  )}

                  {pickupAddress && dropAddress && <View style={styles.pathSpacer} />}

                  {dropAddress && (
                    <View style={styles.pathBlock}>
                      <Text style={styles.pathLabel}>{strings.Drop || 'Drop Address'}</Text>
                      <Text style={styles.pathAddress} numberOfLines={3}>
                        {dropAddress}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ) : null}

          {/* Additional Info Grid */}
          {(data?.weight || data?.distance) && (
            <View style={styles.infoGrid}>
              {data?.weight && (
                <View style={styles.infoBox}>
                  <Icon name="scale-outline" size={wp(4.5)} color="#64748B" />
                  <View>
                    <Text style={styles.infoBoxLabel}>{strings.Weight}</Text>
                    <Text style={styles.infoBoxValue}>{data.weight} kg</Text>
                  </View>
                </View>
              )}

            </View>
          )}

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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: wp(5),
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(8),
    paddingHorizontal: wp(6),
    paddingVertical: hp(3),
    maxHeight: hp(85),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  handleBar: {
    width: wp(12),
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: hp(2.5),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(3),
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
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: wp(4),
  },
  headerTitle: {
    fontSize: wp(5.5),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trackingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackingIdText: {
    fontSize: wp(3.2),
    color: '#475569',
    fontFamily: font.MonolithRegular,
    fontWeight: '600',
  },
  closeIconButton: {
    padding: wp(2.5),
    backgroundColor: '#F8FAFC',
    borderRadius: wp(3.5),
  },
  scrollContent: {
    paddingBottom: hp(2),
  },
  priceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(4),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.5),
    padding: wp(4),

  },
  priceIndicator: {
    width: 4,
    height: '70%',
    backgroundColor: '#FFCC00',
    borderRadius: 2,
    marginRight: wp(3),
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    color: '#64748B',
    fontSize: wp(3.2),
    fontFamily: font.MonolithRegular,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    color: '#0F172A',
    fontSize: wp(6.5),
    fontFamily: font.MonolithRegular,
    fontWeight: '700',
  },
  priceIconCircle: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: wp(4),
    marginBottom: hp(2),
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: wp(4),
    paddingVertical: wp(3.5),
    paddingHorizontal: wp(3),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 8,
  },
  infoBoxLabel: {
    fontSize: wp(2.6),
    color: '#64748B',
    fontFamily: font.MonolithRegular,
    marginBottom: 2,
  },
  infoBoxValue: {
    fontSize: wp(3.5),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
  },
  pathContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(5),
    padding: wp(5),
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: hp(2.5),

  },
  pathTimeline: {
    flexDirection: 'row',
  },
  pathDotContainer: {
    alignItems: 'center',
    width: wp(8),
    marginRight: wp(3),
  },
  iconCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pathLineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: wp(8),
  },
  pathLineDashed: {
    width: 0,
    height: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  pathContent: {
    flex: 1,
    marginLeft: wp(4),
  },
  pathBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  pathLabel: {
    fontSize: wp(3),
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  pathAddress: {
    fontSize: wp(3.8),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
    lineHeight: wp(5),
  },
  pathSpacer: {
    height: hp(3),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(4),
    paddingTop: hp(2),

  },
  btnLater: {
    flex: 1,
    height: hp(6.9),
    borderRadius: wp(2.9),
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
    height: hp(6.9),
    borderRadius: wp(2.9),
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',

  },
  btnActionText: {
    fontSize: wp(4.5),
    color: '#000000',
    fontFamily: font.MonolithRegular,

  },
});

export default NewOrderNotificationModal;
