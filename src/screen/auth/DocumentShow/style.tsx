// style.ts
import { Dimensions, StyleSheet } from 'react-native';
import font from '../../../theme/font';
const { width, height } = Dimensions.get('window');
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfbff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: font.MonolithRegular
    ,
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  reviewBadge: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 12,
    fontFamily: font.MonolithRegular
    ,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: "center"
  },
  imageContainer: {

    justifyContent: "center",
    alignItems: "center"
  },
  image: {
    width: 220,
    height: 200,
    borderRadius: 20
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    fontFamily: font.MonolithRegular
    ,
    marginTop: 8,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActions: {
    flex: 1,
    marginLeft: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  viewBtn: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  downloadBtn: {
    backgroundColor: 'transparent',
    borderColor: '#FFCC00',
  },
  disabledBtn: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  btnIcon: {
    marginRight: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontFamily: font.MonolithRegular
    ,
    fontSize: 14,
  },
  downloadBtnText: {
    color: '#FFCC00',
    fontFamily: font.MonolithRegular
    ,
    fontSize: 14,
  },
  disabledText: {
    color: '#999',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
  },
  quickActions: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionBtn: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#000000',
    fontFamily: font.MonolithRegular
    ,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  uploadBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadBtnText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: font.MonolithRegular
    ,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'space-between',
  },
  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.95,
    height: height * 0.6,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,204,0,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalActionText: {
    color: '#FFFFFF',
    fontFamily: font.MonolithRegular,
    fontSize: 16,
    marginLeft: 8,
  },
  infoRowDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: font.MonolithRegular,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
    fontFamily: font.MonolithRegular,
  },
  imageOverlayText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    padding: 4,
    borderRadius: 30,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTabButton: {
    backgroundColor: '#FFCC00',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    fontFamily: font.MonolithRegular,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },

  // Premium Card styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    fontFamily: font.MonolithRegular,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadge: { backgroundColor: '#E1F8E9' },
  reviewBadge: { backgroundColor: '#E3F2FD' },
  pendingBadge: { backgroundColor: '#FFF3E0' },
  
  verifiedText: { color: '#34C759' },
  reviewText: { color: '#007AFF' },
  pendingText: { color: '#FF9500' },

  // Info Grid styles
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoItem: {
    width: '50%',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontFamily: font.MonolithRegular,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    fontFamily: font.MonolithRegular,
  },

  // Document Image styles
  docImageWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#F2F2F7',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Bank Card Specific
  bankCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bankChip: {
    width: 45,
    height: 35,
    backgroundColor: '#FFCC00',
    borderRadius: 8,
    opacity: 0.8,
  },
  accountNumber: {
    color: '#FFF',
    fontSize: 22,
    letterSpacing: 2,
    marginVertical: 20,
    fontFamily: 'Courier',
  },
  bankFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  bankLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bankValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    flex: 1,
    width: width,
  },

  // Header helpers
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 16,
    marginLeft: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#8E8E93',
    fontWeight: '500',
  }
});
