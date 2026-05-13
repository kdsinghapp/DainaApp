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
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerIconWrapper}>
            <View style={styles.headerIconCircle}>
              <Icon
                name={isCounterOffer ? "cash-outline" : "cube"}
                size={wp(7)}
                color={color.primary}
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
          {(data?.price || data?.amount || data?.offer_price) && (
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.priceLabel}>{isCounterOffer ? strings.OfferPrice : strings.EstimatedEarnings}</Text>
                <Text style={styles.priceValue}>₮ {data?.price || data?.amount || data?.offer_price}</Text>
              </View>

            </View>
          )}

          {/* Location Path (Timeline) */}
          {(data?.pickup?.location || data?.sender?.address || data?.pickupLocation || data?.drop?.location || data?.receiver?.address || data?.dropLocation) ? (
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
                      {data?.pickup?.location || data?.sender?.address || data?.pickupLocation || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.pathSpacer} />

                  <View style={styles.pathBlock}>
                    <Text style={styles.pathLabel}>{strings.Drop || 'Drop Address'}</Text>
                    <Text style={styles.pathAddress} numberOfLines={2}>
                      {data?.drop?.location || data?.receiver?.address || data?.dropLocation || 'N/A'}
                    </Text>
                  </View>
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
              {/* {data?.distance && (
                <View style={styles.infoBox}>
                  <Icon name="navigate-outline" size={wp(4.5)} color="#64748B" />
                  <View>
                    <Text style={styles.infoBoxLabel}>{strings.Distance}</Text>
                    <Text style={styles.infoBoxValue}>{data.distance} km</Text>
                  </View>
                </View>
              )} */}
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
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: wp(9),
    borderTopRightRadius: wp(9),
    paddingHorizontal: wp(6),
    paddingBottom: Platform.OS === 'ios' ? hp(5) : hp(3.5),
    paddingTop: hp(1.5),
    maxHeight: hp(92),

    width: SCREEN_WIDTH,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
    }),
  },
  handleBar: {
    width: wp(12),
    height: 5,
    backgroundColor: '#E2E8F0',
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
    fontSize: wp(5.2),
    color: '#0F172A',
    fontFamily: font.MonolithRegular,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trackingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trackingIdText: {
    fontSize: wp(3),
    color: '#64748B',
    fontFamily: font.MonolithRegular,
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
    borderRadius: wp(5),
    padding: wp(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: wp(3.5),
    fontFamily: font.MonolithRegular,
    marginBottom: 4,
  },
  priceValue: {
    color: '#FFCC00',
    fontSize: wp(6.5),
    fontFamily: font.MonolithRegular,
  },
  priceIconBg: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(4),
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
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
    borderWidth: 1.5,
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
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
  },
  pathLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 6,
  },
  pathContent: {
    flex: 1,
    marginLeft: wp(5),
  },
  pathBlock: {
    flex: 1,
  },
  pathLabel: {
    fontSize: wp(3),
    color: '#94A3B8',
    fontFamily: font.MonolithRegular,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pathAddress: {
    fontSize: wp(4),
    color: '#1E293B',
    fontFamily: font.MonolithRegular,
    lineHeight: wp(5.5),
  },
  pathSpacer: {
    height: hp(3.5),
  },
  footer: {
    flexDirection: 'row',
    gap: wp(4),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnLater: {
    flex: 1,
    height: hp(7.5),
    borderRadius: wp(4.5),
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
    height: hp(7.5),
    borderRadius: wp(4.5),
    backgroundColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFCC00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  btnActionText: {
    fontSize: wp(4.2),
    color: '#000000',
    fontFamily: font.MonolithRegular,
  },
});

export default NewOrderNotificationModal;
