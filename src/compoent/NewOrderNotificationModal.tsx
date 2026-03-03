import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import imageIndex from '../assets/imageIndex';
import font from '../theme/font';
import ScreenNameEnum from '../routes/screenName.enum';
import { STATUS } from '../utils/Constant';
import { useDeliveryContext } from '../context/DeliveryContext';

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

  if (!newOrderNotification?.visible) return null;

  const data = newOrderNotification?.data as {
    type?: string;
    title?: string;
    message?: string;
    offerId?: number;
    user?: { name?: string; profileImage?: string };
  };

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={() => setNewOrderNotification(null)}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalCard}>
            <View style={styles.accentBar} />

            <View style={styles.iconWrap}>
              <Image
                source={imageIndex?.icons || imageIndex?.earing}
                style={styles.notifIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>
              {data?.type === 'counter_offer'
                ? (data?.title ?? 'Counter Offer Received')
                : 'New delivery request'}
            </Text>

            <Text style={styles.message}>
              {data?.type === 'counter_offer'
                ? (data?.message ?? 'User sent a counter offer. Tap to view and respond.')
                : 'A parcel pickup is nearby. Tap below to see details and send your offer.'}
            </Text>

            {data?.user?.profileImage && (
              <View style={styles.profileRow}>
                <Image
                  source={{
                    uri: data?.user?.profileImage || 'https://via.placeholder.com/50',
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.userName}>{data?.user?.name || 'Unknown User'}</Text>
                </View>
              </View>
            )}

            <View style={styles.buttonRow}>
              {data?.type === 'counter_offer' ? (
                <>
                  <TouchableOpacity
                    style={styles.btnDismiss}
                    onPress={() => {
                      if (data?.offerId != null) {
                        RejectcounterOffer(data.offerId);
                      } else {
                        setNewOrderNotification(null);
                      }
                    }}
                    activeOpacity={0.8}
                    disabled={acceptCounterOfferLoading}
                  >
                    <Text style={styles.btnDismissText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.btnView}
                    onPress={() => {
                      if (data?.offerId != null) {
                        acceptCounterOffer(data.offerId);
                      } else {
                        setNewOrderNotification(null);
                      }
                    }}
                    activeOpacity={0.8}
                    disabled={acceptCounterOfferLoading}
                  >
                    <Text style={styles.btnViewText}>Accept</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.btnDismiss}
                    onPress={() => setNewOrderNotification(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnDismissText}>Later</Text>
                  </TouchableOpacity>
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
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnViewText}>View order</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  userName: { fontSize: 16, fontWeight: '600', color: '#222' },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
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
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
  },
  btnViewText: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: '#FFFFFF',
  },
});

export default NewOrderNotificationModal;
