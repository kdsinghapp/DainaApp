import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
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
 import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomHeader from '../../../compoent/CustomHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

export default function DocumentShow() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState({});
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

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

      const response = await fetch('https://aitechnotech.in/DAINA/api/upload-document', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.status === 1) {
        setDocuments(result?.documents || {});
      } else {
        setError(result?.message || 'Failed to load documents');
      }
    } catch (err) {
      console.log('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 

  const handleDownload = (imageUrl, title) => {
    Alert.alert('Download', `Download ${title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => console.log('Download:', imageUrl) }
    ]);
  };

  const DocumentCard = ({ title, imageUrl, icon, status = 'verified' }) => (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <View style={styles.iconTitleWrapper}>
            
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            status === 'verified' ? styles.verifiedBadge : styles.pendingBadge
          ]}>
            <Text style={styles.statusText}>
              {status === 'verified' ? 'Verified' : 'Pending'}
            </Text>
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

  const getDocumentIcon = (title) => {
    const iconMap = {
      'Driving License': 'directions-car',
      'ID Document': 'badge',
      'Vehicle Papers': 'description',
    };
    
    return (
      <Icon 
        name={iconMap[title] || 'insert-drive-file'} 
        size={24} 
        color="#007AFF" 
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
      <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.7}>
        <Text style={styles.uploadBtnText}>Upload Documents</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your documents...</Text>
      </View>
    );
  }

  if (error && !documents.drivingLicense && !documents.idDocument && !documents.vehiclePapers) {
    return (
      <View style={styles.center}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryBtn} 
            onPress={fetchDocuments}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
       

        {/* Documents List */}
        {documents.drivingLicense || documents.idDocument || documents.vehiclePapers ? (
          <>
            <DocumentCard 
              title="Driving License" 
              imageUrl={documents?.drivingLicense}
              icon={getDocumentIcon('Driving License')}
              status="verified"
            />
            <DocumentCard 
              title="ID Document" 
              imageUrl={documents?.idDocument}
              icon={getDocumentIcon('ID Document')}
              status="verified"
            />
            <DocumentCard 
              title="Vehicle Papers" 
              imageUrl={documents?.vehiclePapers}
              icon={getDocumentIcon('Vehicle Papers')}
              status="pending"
            />
          </>
        ) : (
          <EmptyState />
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
              <Icon name="file-download" size={20} color="#007AFF" />
              <Text style={styles.modalActionText}>Download</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalActionBtn}
              activeOpacity={0.7}
            >
              <Icon name="share" size={20} color="#007AFF" />
              <Text style={styles.modalActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
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
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent:"center"
  },
  imageContainer: {
 
 justifyContent:"center" ,
 alignItems:"center"
  },
  image: {
    width: 220,
    height: 200,
    borderRadius:20
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
    fontWeight: '600',
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
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  downloadBtn: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
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
    fontWeight: '600',
    fontSize: 14,
  },
  downloadBtnText: {
    color: '#007AFF',
    fontWeight: '600',
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  modalActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

// Add RefreshControl import
 