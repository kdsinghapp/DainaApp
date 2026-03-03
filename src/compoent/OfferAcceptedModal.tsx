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
import font from '../theme/font';
import { useDashboardContext } from '../context/DashboardContext';

const OfferAcceptedModal: React.FC = () => {
  const ctx = useDashboardContext();
  if (!ctx) return null;

  const { counterOfferAcceptedModal, setCounterOfferAcceptedModal } = ctx;

  const closeModal = () => {
    setCounterOfferAcceptedModal({ visible: false, data: null });
  };

  if (!counterOfferAcceptedModal?.visible) return null;

  const data = counterOfferAcceptedModal?.data;
  const driver = data?.driver as { name?: string; image?: string } | undefined;

  return (
    <Modal visible transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={closeModal}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalCard}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>
              {data?.title ?? 'Offer Accepted'}
            </Text>
            {driver != null && (
              <Text style={styles.extra}>{driver?.name}</Text>
            )}
            {driver?.image != null && driver.image !== '' && (
              <Image
                source={{ uri: driver.image }}
                style={styles.driverImage}
              />
            )}
            <Text style={styles.message}>
              {data?.message ?? "Driver has accepted your counter offer."}
            </Text>
            {data?.parcelId != null && (
              <Text style={styles.extra}>Order #{data.parcelId}</Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.btnDismiss}
                onPress={closeModal}
                activeOpacity={0.8}
              >
                <Text style={styles.btnDismissText}>OK</Text>
              </TouchableOpacity>
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
    marginBottom: 12,
    paddingHorizontal: 8,
    fontFamily: font.MonolithRegular,
  },
  extra: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    fontFamily: font.MonolithRegular,
  },
  driverImage: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
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
});

export default OfferAcceptedModal;
