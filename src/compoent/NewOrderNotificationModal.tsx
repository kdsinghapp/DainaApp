import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import imageIndex from '../assets/imageIndex';
import font from '../theme/font';
import strings from '../localization/Localization';
import ScreenNameEnum from '../routes/screenName.enum';
import { STATUS } from '../utils/Constant';
import { useDeliveryContext } from '../context/DeliveryContext';
import { stopNotificationSound } from '../utils/soundPlayer';

const NewOrderNotificationModal: React.FC = () => {
  const ctx = useDeliveryContext();
  const navigation = useNavigation();
  // console.log("ctx  --- ", ctx)
  if (!ctx) return null;

  const {
    newOrderNotification,
    setNewOrderNotification,
    acceptCounterOffer,
    acceptCounterOfferLoading,
    RejectcounterOffer,
  } = ctx;

  console.log("newOrderNotification ---- ", newOrderNotification)
  // console.log("acceptCounterOffer ---- ", acceptCounterOffer)
  // console.log("acceptCounterOfferLoading ---- ", acceptCounterOfferLoading)

  // if (!newOrderNotification?.visible) return null; // Modal handles its own visibility

  const data = newOrderNotification?.data as {
    type?: string;
    title?: string;
    message?: string;
    offerId?: number;
    user?: { name?: string; profileImage?: string };
  };

  return (
    <Modal
      isVisible={!!newOrderNotification?.visible}
      onBackdropPress={() => {
        setNewOrderNotification(null);
        stopNotificationSound();
      }}
      onBackButtonPress={() => {
        setNewOrderNotification(null);
        stopNotificationSound();
      }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modalContainer}
    >
      <View style={styles.modalCard}>
        <View style={styles.accentBar} />

        <Animated.View entering={ZoomIn.delay(200).duration(500)} style={styles.iconWrap}>
          <Image
            source={imageIndex?.icons || imageIndex?.earing}
            style={styles.notifIcon}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.title}>
            {data?.type === 'counter_offer'
              ? (data?.title ?? strings.CounterOfferReceived)
              : strings.NewDeliveryRequest}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.message}>
            {data?.type === 'counter_offer'
              ? (data?.message ?? strings.CounterOfferMessage)
              : strings.NewDeliveryRequestMessage}
          </Text>
        </Animated.View>

        {data?.user?.profileImage && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.profileRow}>
            <Image
              source={{
                uri: data?.user?.profileImage || 'https://via.placeholder.com/50',
              }}
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.userName}>{data?.user?.name || 'Unknown User'}</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View style={styles.buttonRow}>
          {data?.type === 'counter_offer' ? (
            <>
              <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.btnDismiss}
                  onPress={() => {
                    if (data?.offerId != null) {
                      RejectcounterOffer(data.offerId);
                      stopNotificationSound();
                    } else {
                      setNewOrderNotification(null);
                      stopNotificationSound();
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={acceptCounterOfferLoading}
                >
                  <Text style={styles.btnDismissText}>{strings.Cancel}</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.btnView}
                  onPress={() => {
                    if (data?.offerId != null) {
                      acceptCounterOffer(data.offerId);
                      stopNotificationSound();
                    } else {
                      setNewOrderNotification(null);
                      stopNotificationSound();
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={acceptCounterOfferLoading}
                >
                  <Text style={styles.btnViewText}>{strings.Accept}</Text>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(600).duration(500)} style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.btnDismiss}
                  onPress={() => {
                    setNewOrderNotification(null);
                    stopNotificationSound();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnDismissText}>{strings.Later}</Text>
                </TouchableOpacity>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(700).duration(500)} style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.btnView}
                  onPress={() => {
                    if (newOrderNotification?.data != null) {
                      navigation.navigate(ScreenNameEnum.ParcelDetails as never, {
                        item: {
                          data: newOrderNotification.data,
                          deliveryStatus: STATUS.PENDING,
                        },
                      } as never);
                      setNewOrderNotification(null);
                      stopNotificationSound();
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnViewText}>{strings.ViewOrder}</Text>
                </TouchableOpacity>
              </Animated.View></>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 0,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  accentBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#22C55E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 20,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  notifIcon: { width: 36, height: 36 },
  title: {
    fontSize: 22,
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: font.MonolithRegular,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
    fontFamily: font.MonolithRegular,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
  },
  textContainer: { marginLeft: 12 },
  userName: { fontSize: 16, fontFamily: font.MonolithRegular, color: '#222' },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    height: 55,
    justifyContent: "center",
    alignItems: "center"
  },
  btnDismiss: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  btnDismissText: {
    fontSize: 16,
    color: '#64748B',
    fontFamily: font.MonolithRegular,
  },
  btnView: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: "center"
  },
  btnViewText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: '#FFFFFF',
  },
});

export default NewOrderNotificationModal;
