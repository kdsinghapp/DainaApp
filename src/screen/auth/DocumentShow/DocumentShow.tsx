import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
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





  const DocumentCard = ({ title, imageUrl, icon, status = 'verified' }: any) => {





    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <Text style={styles.cardTitle}>{title}</Text>
          </View>

        </View>

        <TouchableOpacity
          style={styles.docImageWrapper}
          onPress={() => imageUrl && setSelectedImage(imageUrl)}
          activeOpacity={0.9}
        >
          <Image
            source={imageUrl ? { uri: imageUrl } : imageIndex.Addressicone}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.overlayText}>Tap to enlarge</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const VehicleCard = ({ data }: any) => {
    if (!data) return <EmptyState />;

    return (
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Icon name="directions-car" size={24} color="#FFCC00" />
            </View>
            <Text style={styles.cardTitle}>Vehicle Information</Text>
          </View>

        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Type</Text>
            <Text style={styles.infoValue}>{data?.vehicleType || ''}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Vehicle Number</Text>
            <Text style={styles.infoValue}>{data?.vehicleNumber || ''}</Text>
          </View>
          {data?.vehicleModel && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Model</Text>
              <Text style={styles.infoValue}>{data?.vehicleModel}</Text>
            </View>
          )}
          {data?.vehicleColor && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Color</Text>
              <Text style={styles.infoValue}>{data?.vehicleColor}</Text>
            </View>
          )}
        </View>

        {data?.vehicleRegistration && (
          <TouchableOpacity
            style={styles.docImageWrapper}
            onPress={() => setSelectedImage(data?.vehicleRegistration)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: data?.vehicleRegistration }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.overlayText}>Registration Paper</Text>
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  const BankCard = ({ data }: any) => {
    if (!data) return <EmptyState />;

    return (
      <Animated.View style={[styles.bankCard, { opacity: fadeAnim }]}>
        <View style={styles.bankHeader}>
          <Text style={styles.bankName}>{data.bankName || 'Your Bank'}</Text>
          <View style={styles.bankChip} />
        </View>

        <Text style={styles.accountNumber}>
          {data.bankAccountNumber ? `**** **** ${data.bankAccountNumber.slice(-4)}` : '**** **** **** ****'}
        </Text>

        <View style={styles.bankFooter}>
          <View>
            <Text style={styles.bankLabel}>Account Holder</Text>
            <Text style={styles.bankValue}>DRIVER PARTNER</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bankLabel}>IFSC Code</Text>
            <Text style={styles.bankValue}>{data.bankIfscCode || 'N/A'}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  const getDocumentIcon = (title: any) => {
    const iconMap = {
      'Driving License': 'assignment-ind',
      'ID Document': 'badge',
      'Vehicle Papers': 'description',
    };

    return (
      <Icon
        name={iconMap[title] || 'insert-drive-file'}
        size={22}
        color="#FFCC00"
      />
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cloud-off" size={64} color="#E0E0E0" />
      <Text style={styles.emptyTitle}>No Data Found</Text>
      <Text style={styles.emptySubtitle}>
        Information will appear here once it has been processed.
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFCC00" />
        <Text style={styles.loadingText}>Fetching details...</Text>
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
        <View style={styles.tabContainer}>
          {['identity', 'vehicle', 'bank'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'identity' && (
          <>
            <Text style={styles.sectionTitle}>Identification</Text>
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
            ) : <EmptyState />}
          </>
        )}

        {activeTab === 'vehicle' && (
          <>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <VehicleCard data={vehicleInfo} />
          </>
        )}

        {activeTab === 'bank' && (
          <>
            <Text style={styles.sectionTitle}>Banking</Text>
            <BankCard data={bankInfo} />
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
