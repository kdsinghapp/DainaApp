import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import imageIndex from '../../../assets/imageIndex';
import { base_url } from '../../../Api';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomHeader from '../../../compoent/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { styles } from './style';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function DocumentShow() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState({});
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [uploadedAt, setUploadedAt] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [bankInfo, setBankInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('identity'); // 'identity', 'vehicle', 'bank'

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setError('Authentication required. Please login.');
        setLoading(false);
        return;
      }

      // Fetch Documents
      const docResponse = await fetch(`${base_url}/upload-document`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const docResult = await docResponse.json();
      console.log('Document API Response:', docResult);

      if (docResult.status == 1) {
        setDocuments(docResult?.documents || {});
        setVerificationStatus(docResult?.verificationStatus || '');
        setUploadedAt(docResult?.uploadedAt || '');
      } else if (docResult.status == 0 && docResult.message === "Not authenticated") {
        setError("Your session has expired. Please log in again.");
        return;
      }

      // Fetch Vehicle Setup
      const vehicleResponse = await fetch(`${base_url}/vehicle-setup`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const vehicleResult = await vehicleResponse.json();
      console.log('Vehicle API Response:', vehicleResult);

      if (vehicleResult.status == 1) {
        setVehicleInfo(vehicleResult?.data || vehicleResult);
      } else if (vehicleResult.status == 0 && !error) {
        // Only set error if docResult didn't already fail
        console.warn('Vehicle Setup Error:', vehicleResult.message);
      }

      // Fetch Bank Setup
      const bankResponse = await fetch(`${base_url}/bank-setup`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const bankResult = await bankResponse.json();
      console.log('Bank API Response:', bankResult);

      if (bankResult.status == 1) {
        setBankInfo(bankResult?.data || bankResult);
      }

    } catch (err) {
      console.log('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };



  const handleDownload = (imageUrl, title: any) => {
    Alert.alert('Download', `Download ${title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => console.log('Download:', imageUrl) }
    ]);
  };

  const DocumentCard = ({ title, imageUrl, icon, status = 'verified' }: any) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'verified': return styles.verifiedBadge;
        case 'in_review': return styles.reviewBadge;
        default: return styles.pendingBadge;
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'verified': return 'Verified';
        case 'in_review': return 'In Review';
        default: return 'Pending';
      }
    };

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconTitleWrapper}>
              {icon}
              <Text style={[styles.cardTitle, { marginLeft: 12 }]}>{title}</Text>
            </View>
            <View style={[styles.statusBadge, getStatusStyle()]}>
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => imageUrl && setSelectedImage(imageUrl)}
            activeOpacity={0.8}
          >
            <Image
              source={imageUrl ? { uri: imageUrl } : imageIndex.Addressicone}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const getDocumentIcon = (title: any) => {
    const iconMap = {
      'Driving License': 'directions-car',
      'ID Document': 'badge',
      'Vehicle Papers': 'description',
    };

    return (
      <Icon
        name={iconMap[title] || 'insert-drive-file'}
        size={24}
        color="#FFCC00"
      />
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="folder-open" size={80} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No Documents Found</Text>
      <Text style={styles.emptySubtitle}>
        It seems you haven't uploaded any documents yet.
      </Text>
      {/* <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.7}>
        <Text style={styles.uploadBtnText}>Upload Documents</Text>
      </TouchableOpacity> */}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#d0b500ff" />
        <Text style={styles.loadingText}>Loading your documents...</Text>
      </View>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label="My Documents" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'identity' && styles.activeTabButton]}
            onPress={() => setActiveTab('identity')}
          >
            <Text style={[styles.tabText, activeTab === 'identity' && styles.activeTabText]}>Identity</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vehicle' && styles.activeTabButton]}
            onPress={() => setActiveTab('vehicle')}
          >
            <Text style={[styles.tabText, activeTab === 'vehicle' && styles.activeTabText]}>Vehicle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'bank' && styles.activeTabButton]}
            onPress={() => setActiveTab('bank')}
          >
            <Text style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Identity Tab Content */}
        {activeTab === 'identity' && (
          <>
            <Text style={styles.sectionTitle}>Identification Documents</Text>
            {documents.drivingLicense || documents.idDocument || documents.vehiclePapers ? (
              <>
                <DocumentCard
                  title="Driving License"
                  imageUrl={documents?.drivingLicense}
                  icon={getDocumentIcon('Driving License')}
                  status={verificationStatus}
                />
                <DocumentCard
                  title="ID Document"
                  imageUrl={documents?.idDocument}
                  icon={getDocumentIcon('ID Document')}
                  status={verificationStatus}
                />
                <DocumentCard
                  title="Vehicle Papers"
                  imageUrl={documents?.vehiclePapers}
                  icon={getDocumentIcon('Vehicle Papers')}
                  status={verificationStatus}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </>
        )}

        {/* Vehicle Tab Content */}
        {activeTab === 'vehicle' && (
          <View>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            {vehicleInfo ? (
              <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#FFCC00' }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleContainer}>
                    <View style={styles.iconTitleWrapper}>
                      <Icon name="directions-car" size={24} color="#FFCC00" />
                      <Text style={[styles.cardTitle, { marginLeft: 12, fontWeight: '700' }]}>Information</Text>
                    </View>
                    <View style={[styles.statusBadge, vehicleInfo.verificationStatus === 'verified' ? styles.verifiedBadge : styles.reviewBadge]}>
                      <Text style={styles.statusText}>{vehicleInfo.verificationStatus === 'in_review' ? 'In Review' : 'Verified'}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ paddingVertical: 8 }}>
                  <View style={styles.infoRowDetail}>
                    <Text style={styles.infoLabel}>Vehicle Type</Text>
                    <Text style={styles.infoValue}>{vehicleInfo?.vehicleType || 'N/A'}</Text>
                  </View>
                  <View style={[styles.infoRowDetail, { marginTop: 12 }]}>
                    <Text style={styles.infoLabel}>Vehicle Number</Text>
                    <Text style={styles.infoValue}>{vehicleInfo?.vehicleNumber || 'N/A'}</Text>
                  </View>
                  {vehicleInfo?.vehicleModel && (
                    <View style={[styles.infoRowDetail, { marginTop: 12 }]}>
                      <Text style={styles.infoLabel}>Vehicle Model</Text>
                      <Text style={styles.infoValue}>{vehicleInfo?.vehicleModel}</Text>
                    </View>
                  )}
                  {vehicleInfo?.vehicleColor && (
                    <View style={[styles.infoRowDetail, { marginTop: 12 }]}>
                      <Text style={styles.infoLabel}>Vehicle Color</Text>
                      <Text style={styles.infoValue}>{vehicleInfo?.vehicleColor}</Text>
                    </View>
                  )}
                </View>

                {vehicleInfo?.vehicleRegistration && (
                  <TouchableOpacity
                    style={[styles.imageContainer, { marginTop: 16 }]}
                    onPress={() => setSelectedImage(vehicleInfo?.vehicleRegistration)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: vehicleInfo?.vehicleRegistration }}
                      style={[styles.image, { width: '100%', height: 180 }]}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlayText}>
                      <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Registration Paper</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ) : <EmptyState />}
          </View>
        )}

        {/* Bank Tab Content */}
        {activeTab === 'bank' && (
          <View>
            <Text style={styles.sectionTitle}>Bank Information</Text>
            {bankInfo ? (
              <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#4CAF50' }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconTitleWrapper}>
                    <Icon name="account-balance" size={24} color="#4CAF50" />
                    <Text style={[styles.cardTitle, { marginLeft: 12, fontWeight: '700' }]}>Account Details</Text>
                  </View>
                </View>

                <View style={{ paddingVertical: 8 }}>
                  <View style={styles.infoRowDetail}>
                    <Text style={styles.infoLabel}>Bank Name</Text>
                    <Text style={styles.infoValue}>{bankInfo?.bankName || 'N/A'}</Text>
                  </View>
                  <View style={[styles.infoRowDetail, { marginTop: 16 }]}>
                    <Text style={styles.infoLabel}>Account Number</Text>
                    <Text style={styles.infoValue}>{bankInfo?.bankAccountNumber || 'N/A'}</Text>
                  </View>
                  <View style={[styles.infoRowDetail, { marginTop: 16 }]}>
                    <Text style={styles.infoLabel}>IFSC Code</Text>
                    <Text style={styles.infoValue}>{bankInfo?.bankIfscCode || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            ) : <EmptyState />}
          </View>
        )}
      </ScrollView>

      {/* Enhanced Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="slide"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
              activeOpacity={0.7}
            >
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainerModal}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalActionBtn}
              onPress={() => handleDownload(selectedImage, 'Document')}
              activeOpacity={0.7}
            >
              <Icon name="file-download" size={20} color="#FFCC00" />
              <Text style={styles.modalActionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalActionBtn}
              activeOpacity={0.7}
            >
              <Icon name="share" size={20} color="#FFCC00" />
              <Text style={styles.modalActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
