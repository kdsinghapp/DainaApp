import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";

const { width, height } = Dimensions.get('window');

const CourierTrackingScreen = () => {
  const nav = useNavigation();
  const rou: any = useRoute();
  const { item } = rou.params || "";
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height * 0.4)).current;

  // Panel states
  const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);

  // Route coordinates for polyline
  const routeCoordinates = [
    { latitude: 28.6139, longitude: 77.209 }, // Start point
    { latitude: 28.6145, longitude: 77.210 },
    { latitude: 28.6150, longitude: 77.211 },
    { latitude: 28.6155, longitude: 77.212 },
    { latitude: 28.6160, longitude: 77.213 },
    { latitude: 28.6165, longitude: 77.214 },
    { latitude: 28.6170, longitude: 77.215 }, // Courier current position
    { latitude: 28.6175, longitude: 77.216 },
    { latitude: 28.6180, longitude: 77.217 },
    { latitude: 28.6185, longitude: 77.218 },
    { latitude: 28.6190, longitude: 77.219 },
    { latitude: 28.6195, longitude: 77.220 },
    { latitude: 28.6200, longitude: 77.220 }, // End point
  ];

  // Delivery progress steps
  const deliverySteps = [
    { 
      id: 1, 
      status: "Order Placed", 
      completed: true, 
      time: "10:30 AM",
      description: "Your order has been confirmed"
    },
    { 
      id: 2, 
      status: "Picked Up", 
      completed: true, 
      time: "11:15 AM",
      description: "Courier has picked up your package"
    },
    { 
      id: 3, 
      status: "In Transit", 
      completed: true, 
      time: "11:45 AM",
      description: "Package is on the way"
    },
    { 
      id: 4, 
      status: "Out for Delivery", 
      completed: false, 
      time: "Expected 12:30 PM",
      description: "Courier is in your area"
    },
    { 
      id: 5, 
      status: "Delivered", 
      completed: false, 
      time: "Expected 1:00 PM",
      description: "Package will be delivered"
    },
  ];

  const completedSteps = deliverySteps.filter(step => step.completed).length;
  const totalSteps = deliverySteps.length;

  useEffect(() => {
    // Pulse animation for courier marker
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation for content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, fadeAnim]);

  const togglePanel = () => {
    const toValue = isPanelExpanded ? height * 0.4 : height * 0.75;
    
    Animated.spring(slideAnim, {
      toValue: toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
    
    setIsPanelExpanded(!isPanelExpanded);
  };

  const handleCall = () => {
    const phoneNumber = "tel:+911234567890";
    Linking.openURL(phoneNumber).catch((err) =>
      console.log("Error opening dialer:", err)
    );
  };

  // Package details
  const packageDetails = [
    { label: "Delivery Type", value: "Express Delivery", icon: "🚚" },
    { label: "Package Weight", value: "4 Kg", icon: "📦" },
    { label: "Tracking ID", value: "#TRK123456", icon: "🔍" },
    { label: "Package Size", value: "Medium", icon: "📏" },
  ];

  // Render progress steps in horizontal row
  const renderProgressSteps = () => {
    return (
      <View style={styles.horizontalProgressContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {deliverySteps.map((step, index) => (
            <View key={step.id} style={styles.horizontalStep}>
              <View style={styles.stepContentHorizontal}>
                <View style={[
                  styles.stepIconHorizontal,
                  step.completed ? styles.stepCompleted : styles.stepPending
                ]}>
                  {step.completed ? (
                    <Text style={styles.stepIconText}>✓</Text>
                  ) : (
                    <Text style={styles.stepIconText}>{step.id}</Text>
                  )}
                </View>
                <View style={styles.stepInfoHorizontal}>
                  <Text style={[
                    styles.stepStatus,
                    step.completed && styles.stepStatusCompleted
                  ]}>
                    {step.status}
                  </Text>
                  </View>
              </View>
              {index < deliverySteps.length - 1 && (
                <View style={[
                  styles.stepConnectorHorizontal,
                  step.completed && styles.connectorCompleted
                ]} />
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader label={"Track Your Package"} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 28.6159,
              longitude: 77.2145,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
          >
            {/* Start Marker */}
            <Marker
              coordinate={routeCoordinates[0]}
              title="Pickup Location"
              description="Your package pickup point"
            >
              <View style={[styles.markerBase, styles.markerStart]}>
                <Image source={imageIndex.userLogo} style={styles.markerIcon} />
              </View>
            </Marker>

            {/* End Marker */}
            <Marker
              coordinate={routeCoordinates[routeCoordinates.length - 1]}
              title="Delivery Location"
              description="Your delivery address"
            >
              <View style={[styles.markerBase, styles.markerEnd]}>
                <Image source={imageIndex.deliver} style={styles.markerIcon} />
              </View>
            </Marker>

            {/* Current Location Marker with animation */}
            <Marker
              coordinate={routeCoordinates[6]} // Courier current position
              title="Courier Location"
              description="Your courier is here"
            >
              <Animated.View style={[styles.courierMarker, { transform: [{ scale: scaleAnim }] }]}>
                <Image
                  source={imageIndex.deliver}
                  style={styles.courierImage}
                />
                <View style={styles.livePulse} />
              </Animated.View>
            </Marker>

            {/* Completed Route Polyline */}
            <Polyline
              coordinates={routeCoordinates.slice(0, 7)} // Completed route
              strokeColor="#FFCC00"
              strokeWidth={2}
              lineDashPattern={[1, 0]} // Solid line for completed
            />

            {/* Remaining Route Polyline */}
            <Polyline
              coordinates={routeCoordinates.slice(6)} // Remaining route
              strokeColor="#FF6B35"
              strokeWidth={4}
              lineDashPattern={[5, 5]} // Dashed line for remaining
            />
          </MapView>

         

         
         
        </View>

        {/* Slide-up Panel */}
        <Animated.View 
          style={[
            styles.slideUpPanel,
            {
              height: slideAnim,
            }
          ]}
        >
 
          <ScrollView 
            style={styles.panelContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Delivery Progress - Horizontal */}
            <View style={styles.progressContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Progress</Text>
              </View>
              
              {renderProgressSteps()}
            </View>

            {/* Courier Information */}
            <View style={styles.courierCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Courier</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>4.8 ★</Text>
                </View>
              </View>
              
              <View style={styles.courierInfo}>
                <View style={styles.courierProfile}>
                  <Image
                    source={{ uri: "https://randomuser.me/api/portraits/men/41.jpg" }}
                    style={styles.avatar}
                  />
                  <View style={styles.courierDetails}>
                    <Text style={styles.courierName}>Marcus Aminoff </Text>
                    <Text style={styles.courierRole}>Professional Courier </Text>
                    <View style={styles.statsContainer}>
                       <Text style={styles.courierStats}>📦 247 Deliveries</Text>
                    </View>
                  </View>
                   <TouchableOpacity 
                     onPress={handleCall}
                  >
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                      <Image source={imageIndex.Calls} style={styles.buttonIcon} />
                    </Animated.View>
                   </TouchableOpacity>
                        <TouchableOpacity 
               
                    onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}
                  >
                    <Image source={imageIndex.messtrcker} style={styles.buttonIcon} />
                   </TouchableOpacity>
                </View>
     

                {/* Additional Info */}
                <View style={styles.additionalInfo}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Vehicle</Text>
                    <Text style={styles.infoValue}>🏍️ Motorcycle</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Distance</Text>
                    <Text style={styles.infoValue}>2.3 km</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Last Update</Text>
                    <Text style={styles.infoValue}>2 mins ago</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Package Information */}
            <View style={styles.packageCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Package Information</Text>
                <View style={styles.priorityBadge}>
                  <Text style={styles.priorityText}>EXPRESS</Text>
                </View>
              </View>
              
              <View style={styles.packageGrid}>
                {packageDetails.map((detail, index) => (
                  <View key={index} style={styles.detailCard}>
                    <Text style={styles.detailIcon}>{detail.icon}</Text>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                    <Text style={styles.detailValue}>{detail.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Safety Features */}
            <View style={styles.safetyCard}>
              <Text style={styles.safetyTitle}>Safety First</Text>
              <View style={styles.safetyFeatures}>
                <Text style={styles.safetyText}>• Contactless delivery available</Text>
                <Text style={styles.safetyText}>• Courier follows safety protocols</Text>
                <Text style={styles.safetyText}>• Real-time tracking for your security</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CourierTrackingScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.5,
    borderRadius: 0,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  markerBase: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  markerStart: {
    backgroundColor: '#FFCC00',
  },
  markerEnd: {
    backgroundColor: '#FFCC00',
  },
  markerIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  courierMarker: {
    width: 33,
    height: 33,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
     borderWidth: 1,
    borderColor: '#FFCC00',
  },
  courierImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  livePulse: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFCC00',
    opacity: 0.5,
  },
  liveBadge: {
    
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  etaBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  etaTitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: font.MonolithRegular,
  },
  etaTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginTop: 2,
  },
  progressIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontFamily: font.MonolithRegular,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  // Slide-up Panel Styles
  slideUpPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  panelContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: font.MonolithRegular,
  },
  progressCount: {
    fontSize: 14,
    color: '#FFCC00',
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
     padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  // Horizontal Progress Steps
  horizontalProgressContainer: {
   },
  horizontalScrollContent: {
    paddingRight: 20,
  },
  horizontalStep: {
    flexDirection: 'row',
    alignItems: 'center',
   },
  stepContentHorizontal: {
    alignItems: 'center',
   },
  stepIconHorizontal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCompleted: {
    backgroundColor: '#FFCC00',
  },
  stepPending: {
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#BDBDBD',
  },
  stepIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepInfoHorizontal: {
    alignItems: 'center',
  },
  stepStatus: {
    fontSize: 12,
    color: '#666',
     textAlign: 'center',
    fontFamily: font.MonolithRegular,
  },
  stepStatusCompleted: {
    color: 'black',
        fontSize: 15,
    fontFamily: font.MonolithRegular,
 

  },
  stepTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: font.MonolithRegular,
  },
  stepDescription: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
    fontFamily: font.MonolithRegular,
  },
  stepConnectorHorizontal: {
    width: 20,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
  },
  connectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  packageCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityBadge: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailCard: {
    width: (width - 80) / 3,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontFamily: font.MonolithRegular,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: font.MonolithRegular,
  },
  courierCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  ratingContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
     color: 'white',
     fontFamily:font.MonolithRegular
  },
  courierInfo: {
    marginTop: 8,
  },
  courierProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFCC00',
  },
  courierDetails: {
    flex: 1,
  },
  courierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  courierRole: {
    fontSize: 14,
    color: '#FFCC00',
    marginBottom: 8,
    fontFamily: font.MonolithRegular,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courierStats: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: font.MonolithRegular,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: '#E8F5E8',
 
 
  },
  chatButton: {
    backgroundColor: '#E3F2FD',
 
  },
  buttonIcon: {
    width: 39,
    height: 39,
    resizeMode:"cover" ,
    margin:5
  },
  buttonText: {
    fontSize: 12,
     color: '#333',
     fontFamily:font.MonolithRegular
  },
  additionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontFamily: font.MonolithRegular,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: font.MonolithRegular,
  },
  safetyCard: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  safetyFeatures: {
    gap: 4,
  },
  safetyText: {
    fontSize: 12,
    color: '#2E7D32',
    fontFamily: font.MonolithRegular,
  },
});