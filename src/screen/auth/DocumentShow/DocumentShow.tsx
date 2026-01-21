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

 

  const handleDownload = (imageUrl, title:any) => {
    Alert.alert('Download', `Download ${title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Download', onPress: () => console.log('Download:', imageUrl) }
    ]);
  };

  const DocumentCard = ({ title, imageUrl, icon, status = 'verified' }:any) => (
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

  const getDocumentIcon = (title:any) => {
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
        <ActivityIndicator size="large" color="#d0b500ff" />
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
 