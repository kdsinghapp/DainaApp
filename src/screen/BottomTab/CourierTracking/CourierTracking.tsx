// import React, { useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Animated,
//   Linking,
//   Dimensions,
//   ScrollView,
// } from "react-native";
// import MapView, { Marker, Polyline } from "react-native-maps";
// import StatusBarComponent from "../../../compoent/StatusBarCompoent";
// import CustomHeader from "../../../compoent/CustomHeader";
// import { SafeAreaView } from "react-native-safe-area-context";
// import imageIndex from "../../../assets/imageIndex";
// import font from "../../../theme/font";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import ScreenNameEnum from "../../../routes/screenName.enum";

// const { width, height } = Dimensions.get('window');

// const CourierTrackingScreen = () => {
//   const nav = useNavigation();
//   const rou: any = useRoute();
//   const { item } = rou.params || "";

//   // Animation refs
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(height * 0.4)).current;

//   // Panel states
//   const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);

//   // Route coordinates for polyline
//   const routeCoordinates = [
//     { latitude: 28.6139, longitude: 77.209 }, // Start point
//     { latitude: 28.6145, longitude: 77.210 },
//     { latitude: 28.6150, longitude: 77.211 },
//     { latitude: 28.6155, longitude: 77.212 },
//     { latitude: 28.6160, longitude: 77.213 },
//     { latitude: 28.6165, longitude: 77.214 },
//     { latitude: 28.6170, longitude: 77.215 }, // Courier current position
//     { latitude: 28.6175, longitude: 77.216 },
//     { latitude: 28.6180, longitude: 77.217 },
//     { latitude: 28.6185, longitude: 77.218 },
//     { latitude: 28.6190, longitude: 77.219 },
//     { latitude: 28.6195, longitude: 77.220 },
//     { latitude: 28.6200, longitude: 77.220 }, // End point
//   ];

//   // Delivery progress steps
//   const deliverySteps = [
//     {
//       id: 1,
//       status: "Order Placed",
//       completed: true,
//       time: "10:30 AM",
//       description: "Your order has been confirmed"
//     },
//     {
//       id: 2,
//       status: "Picked Up",
//       completed: true,
//       time: "11:15 AM",
//       description: "Courier has picked up your package"
//     },
//     {
//       id: 3,
//       status: "In Transit",
//       completed: true,
//       time: "11:45 AM",
//       description: "Package is on the way"
//     },
//     {
//       id: 4,
//       status: "Out for Delivery",
//       completed: false,
//       time: "Expected 12:30 PM",
//       description: "Courier is in your area"
//     },
//     {
//       id: 5,
//       status: "Delivered",
//       completed: false,
//       time: "Expected 1:00 PM",
//       description: "Package will be delivered"
//     },
//   ];

//   const completedSteps = deliverySteps.filter(step => step.completed).length;
//   const totalSteps = deliverySteps.length;

//   useEffect(() => {
//     // Pulse animation for courier marker
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 1.2,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();

//     // Fade in animation for content
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       useNativeDriver: true,
//     }).start();
//   }, [scaleAnim, fadeAnim]);

//   const togglePanel = () => {
//     const toValue = isPanelExpanded ? height * 0.4 : height * 0.75;

//     Animated.spring(slideAnim, {
//       toValue: toValue,
//       useNativeDriver: false,
//       tension: 50,
//       friction: 8,
//     }).start();

//     setIsPanelExpanded(!isPanelExpanded);
//   };

//   const handleCall = () => {
//     const phoneNumber = "tel:+911234567890";
//     Linking.openURL(phoneNumber).catch((err) =>
//       console.log("Error opening dialer:", err)
//     );
//   };

//   // Package details
//   const packageDetails = [
//     { label: "Delivery Type", value: "Express Delivery", icon: "🚚" },
//     { label: "Package Weight", value: "4 Kg", icon: "📦" },
//     { label: "Tracking ID", value: "#TRK123456", icon: "🔍" },
//     { label: "Package Size", value: "Medium", icon: "📏" },
//   ];

//   // Render progress steps in horizontal row
//   const renderProgressSteps = () => {
//     return (
//       <View style={styles.horizontalProgressContainer}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.horizontalScrollContent}
//         >
//           {deliverySteps.map((step, index) => (
//             <View key={step.id} style={styles.horizontalStep}>
//               <View style={styles.stepContentHorizontal}>
//                 <View style={[
//                   styles.stepIconHorizontal,
//                   step.completed ? styles.stepCompleted : styles.stepPending
//                 ]}>
//                   {step.completed ? (
//                     <Text style={styles.stepIconText}>✓</Text>
//                   ) : (
//                     <Text style={styles.stepIconText}>{step.id}</Text>
//                   )}
//                 </View>
//                 <View style={styles.stepInfoHorizontal}>
//                   <Text style={[
//                     styles.stepStatus,
//                     step.completed && styles.stepStatusCompleted
//                   ]}>
//                     {step.status}
//                   </Text>
//                   </View>
//               </View>
//               {index < deliverySteps.length - 1 && (
//                 <View style={[
//                   styles.stepConnectorHorizontal,
//                   step.completed && styles.connectorCompleted
//                 ]} />
//               )}
//             </View>
//           ))}
//         </ScrollView>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBarComponent />
//       <CustomHeader label={"Track Your Package"} />

//       <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
//         {/* Map Section */}
//         <View style={styles.mapContainer}>
//           <MapView
//             style={styles.map}
//             initialRegion={{
//               latitude: 28.6159,
//               longitude: 77.2145,
//               latitudeDelta: 0.03,
//               longitudeDelta: 0.03,
//             }}
//           >
//             {/* Start Marker */}
//             <Marker
//               coordinate={routeCoordinates[0]}
//               title="Pickup Location"
//               description="Your package pickup point"
//             >
//               <View style={[styles.markerBase, styles.markerStart]}>
//                 <Image source={imageIndex.userLogo} style={styles.markerIcon} />
//               </View>
//             </Marker>

//             {/* End Marker */}
//             <Marker
//               coordinate={routeCoordinates[routeCoordinates.length - 1]}
//               title="Delivery Location"
//               description="Your delivery address"
//             >
//               <View style={[styles.markerBase, styles.markerEnd]}>
//                 <Image source={imageIndex.deliver} style={styles.markerIcon} />
//               </View>
//             </Marker>

//             {/* Current Location Marker with animation */}
//             <Marker
//               coordinate={routeCoordinates[6]} // Courier current position
//               title="Courier Location"
//               description="Your courier is here"
//             >
//               <Animated.View style={[styles.courierMarker, { transform: [{ scale: scaleAnim }] }]}>
//                 <Image
//                   source={imageIndex.deliver}
//                   style={styles.courierImage}
//                 />
//                 <View style={styles.livePulse} />
//               </Animated.View>
//             </Marker>

//             {/* Completed Route Polyline */}
//             <Polyline
//               coordinates={routeCoordinates.slice(0, 7)} // Completed route
//               strokeColor="#FFCC00"
//               strokeWidth={2}
//               lineDashPattern={[1, 0]} // Solid line for completed
//             />

//             {/* Remaining Route Polyline */}
//             <Polyline
//               coordinates={routeCoordinates.slice(6)} // Remaining route
//               strokeColor="#FF6B35"
//               strokeWidth={4}
//               lineDashPattern={[5, 5]} // Dashed line for remaining
//             />
//           </MapView>

//         </View>

//         {/* Slide-up Panel */}
//         <Animated.View
//           style={[
//             styles.slideUpPanel,
//             {
//               height: slideAnim,
//             }
//           ]}
//         >

//           <ScrollView
//             style={styles.panelContent}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.scrollContent}
//           >
//             {/* Delivery Progress - Horizontal */}
//             <View style={styles.progressContainer}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Delivery Progress</Text>
//               </View>

//               {renderProgressSteps()}
//             </View>

//             {/* Courier Information */}
//             <View style={styles.courierCard}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Your Courier</Text>
//                 <View style={styles.ratingContainer}>
//                   <Text style={styles.ratingText}>4.8 ★</Text>
//                 </View>
//               </View>

//               <View style={styles.courierInfo}>
//                 <View style={styles.courierProfile}>
//                   <Image
//                     source={{ uri: "https://randomuser.me/api/portraits/men/41.jpg" }}
//                     style={styles.avatar}
//                   />
//                   <View style={styles.courierDetails}>
//                     <Text style={styles.courierName}>Marcus Aminoff </Text>
//                     <Text style={styles.courierRole}>Professional Courier </Text>
//                     <View style={styles.statsContainer}>
//                        <Text style={styles.courierStats}>📦 247 Deliveries</Text>
//                     </View>
//                   </View>
//                    <TouchableOpacity
//                      onPress={handleCall}
//                   >
//                     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//                       <Image source={imageIndex.Calls} style={styles.buttonIcon} />
//                     </Animated.View>
//                    </TouchableOpacity>
//                         <TouchableOpacity

//                     onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}
//                   >
//                     <Image source={imageIndex.messtrcker} style={styles.buttonIcon} />
//                    </TouchableOpacity>
//                 </View>

//                 {/* Additional Info */}
//                 <View style={styles.additionalInfo}>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Vehicle</Text>
//                     <Text style={styles.infoValue}>🏍️ Motorcycle</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Distance</Text>
//                     <Text style={styles.infoValue}>2.3 km</Text>
//                   </View>
//                   <View style={styles.infoItem}>
//                     <Text style={styles.infoLabel}>Last Update</Text>
//                     <Text style={styles.infoValue}>2 mins ago</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* Package Information */}
//             <View style={styles.packageCard}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Package Information</Text>
//                 <View style={styles.priorityBadge}>
//                   <Text style={styles.priorityText}>EXPRESS</Text>
//                 </View>
//               </View>

//               <View style={styles.packageGrid}>
//                 {packageDetails.map((detail, index) => (
//                   <View key={index} style={styles.detailCard}>
//                     <Text style={styles.detailIcon}>{detail.icon}</Text>
//                     <Text style={styles.detailLabel}>{detail.label}</Text>
//                     <Text style={styles.detailValue}>{detail.value}</Text>
//                   </View>
//                 ))}
//               </View>
//             </View>

//             {/* Safety Features */}
//             <View style={styles.safetyCard}>
//               <Text style={styles.safetyTitle}>Safety First</Text>
//               <View style={styles.safetyFeatures}>
//                 <Text style={styles.safetyText}>• Contactless delivery available</Text>
//                 <Text style={styles.safetyText}>• Courier follows safety protocols</Text>
//                 <Text style={styles.safetyText}>• Real-time tracking for your security</Text>
//               </View>
//             </View>
//           </ScrollView>
//         </Animated.View>
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// export default CourierTrackingScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa"
//   },
//   content: {
//     flex: 1,
//   },
//   mapContainer: {
//     height: height * 0.5,
//     borderRadius: 0,
//     overflow: 'hidden',
//   },
//   map: {
//     flex: 1,
//   },
//   markerBase: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 8,
//   },
//   markerStart: {
//     backgroundColor: '#FFCC00',
//   },
//   markerEnd: {
//     backgroundColor: '#FFCC00',
//   },
//   markerIcon: {
//     width: 20,
//     height: 20,
//     tintColor: 'white',
//   },
//   markerText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   courierMarker: {
//     width: 33,
//     height: 33,
//     borderRadius: 25,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//      borderWidth: 1,
//     borderColor: '#FFCC00',
//   },
//   courierImage: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//   },
//   livePulse: {
//     position: 'absolute',
//     top: -5,
//     left: -5,
//     right: -5,
//     bottom: -5,
//     borderRadius: 30,
//     borderWidth: 2,
//     borderColor: '#FFCC00',
//     opacity: 0.5,
//   },
//   liveBadge: {

//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 6,
//   },
//   liveDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'white',
//     marginRight: 6,
//   },
//   liveText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   etaBadge: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     backgroundColor: 'white',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 12,
//     elevation: 8,
//     alignItems: 'center',
//   },
//   etaTitle: {
//     fontSize: 12,
//     color: '#666',
//     fontFamily: font.MonolithRegular,
//   },
//   etaTime: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#FFCC00',
//     marginTop: 2,
//   },
//   progressIndicator: {
//     position: 'absolute',
//     bottom: 16,
//     left: 16,
//     right: 16,
//     backgroundColor: 'white',
//     padding: 12,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 8,
//     fontFamily: font.MonolithRegular,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 3,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: '#4CAF50',
//     borderRadius: 3,
//   },
//   // Slide-up Panel Styles
//   slideUpPanel: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 20,
//     elevation: 20,
//     overflow: 'hidden',
//   },
//   dragHandle: {
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//   },
//   handleBar: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#E0E0E0',
//     borderRadius: 2,
//   },
//   panelContent: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     fontFamily: font.MonolithRegular,
//   },
//   progressCount: {
//     fontSize: 14,
//     color: '#FFCC00',
//     fontWeight: '600',
//   },
//   progressContainer: {
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//      padding: 20,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   // Horizontal Progress Steps
//   horizontalProgressContainer: {
//    },
//   horizontalScrollContent: {
//     paddingRight: 20,
//   },
//   horizontalStep: {
//     flexDirection: 'row',
//     alignItems: 'center',
//    },
//   stepContentHorizontal: {
//     alignItems: 'center',
//    },
//   stepIconHorizontal: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   stepCompleted: {
//     backgroundColor: '#FFCC00',
//   },
//   stepPending: {
//     backgroundColor: '#E0E0E0',
//     borderWidth: 2,
//     borderColor: '#BDBDBD',
//   },
//   stepIconText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   stepInfoHorizontal: {
//     alignItems: 'center',
//   },
//   stepStatus: {
//     fontSize: 12,
//     color: '#666',
//      textAlign: 'center',
//     fontFamily: font.MonolithRegular,
//   },
//   stepStatusCompleted: {
//     color: 'black',
//         fontSize: 15,
//     fontFamily: font.MonolithRegular,

//   },
//   stepTime: {
//     fontSize: 10,
//     color: '#999',
//     marginTop: 2,
//     textAlign: 'center',
//     fontFamily: font.MonolithRegular,
//   },
//   stepDescription: {
//     fontSize: 9,
//     color: '#666',
//     marginTop: 2,
//     textAlign: 'center',
//     fontFamily: font.MonolithRegular,
//   },
//   stepConnectorHorizontal: {
//     width: 20,
//     height: 2,
//     backgroundColor: '#E0E0E0',
//     marginHorizontal: 5,
//   },
//   connectorCompleted: {
//     backgroundColor: '#4CAF50',
//   },
//   packageCard: {
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginTop: 16,
//     padding: 20,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   priorityBadge: {
//     backgroundColor: '#FFCC00',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   priorityText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   packageGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   detailCard: {
//     width: (width - 80) / 3,
//     backgroundColor: '#f8f9fa',
//     padding: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   detailIcon: {
//     fontSize: 20,
//     marginBottom: 4,
//   },
//   detailLabel: {
//     fontSize: 10,
//     color: '#666',
//     textAlign: 'center',
//     fontFamily: font.MonolithRegular,
//   },
//   detailValue: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginTop: 2,
//     fontFamily: font.MonolithRegular,
//   },
//   courierCard: {
//     backgroundColor: 'white',
//     marginHorizontal: 20,
//     marginTop: 16,
//     padding: 20,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   ratingContainer: {
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 10,
//   },
//   ratingText: {
//     fontSize: 12,
//      color: 'white',
//      fontFamily:font.MonolithRegular
//   },
//   courierInfo: {
//     marginTop: 8,
//   },
//   courierProfile: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatar: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     marginRight: 16,
//     borderWidth: 3,
//     borderColor: '#FFCC00',
//   },
//   courierDetails: {
//     flex: 1,
//   },
//   courierName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 2,
//   },
//   courierRole: {
//     fontSize: 14,
//     color: '#FFCC00',
//     marginBottom: 8,
//     fontFamily: font.MonolithRegular,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   courierStats: {
//     fontSize: 11,
//     color: '#666',
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//     fontFamily: font.MonolithRegular,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   actionButton: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 12,
//     borderRadius: 16,
//     backgroundColor: '#f8f9fa',
//     marginHorizontal: 4,
//   },
//   callButton: {
//     backgroundColor: '#E8F5E8',

//   },
//   chatButton: {
//     backgroundColor: '#E3F2FD',

//   },
//   buttonIcon: {
//     width: 39,
//     height: 39,
//     resizeMode:"cover" ,
//     margin:5
//   },
//   buttonText: {
//     fontSize: 12,
//      color: '#333',
//      fontFamily:font.MonolithRegular
//   },
//   additionalInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#f8f9fa',
//     padding: 16,
//     borderRadius: 12,
//   },
//   infoItem: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   infoLabel: {
//     fontSize: 11,
//     color: '#666',
//     marginBottom: 4,
//     fontFamily: font.MonolithRegular,
//   },
//   infoValue: {
//     fontSize: 12,
//     fontWeight: 'bold',
//     color: '#333',
//     fontFamily: font.MonolithRegular,
//   },
//   safetyCard: {
//     backgroundColor: '#E8F5E8',
//     marginHorizontal: 20,
//     marginTop: 16,
//     padding: 16,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   safetyTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#2E7D32',
//     marginBottom: 8,
//   },
//   safetyFeatures: {
//     gap: 4,
//   },
//   safetyText: {
//     fontSize: 12,
//     color: '#2E7D32',
//     fontFamily: font.MonolithRegular,
//   },
// });
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Animated,
//   Linking,
//   Dimensions,
//   ScrollView,
//   Platform,
//   PanResponder,
// } from "react-native";
// import MapView, { Marker, AnimatedRegion } from "react-native-maps";
// import MapViewDirections from 'react-native-maps-directions';
// import StatusBarComponent from "../../../compoent/StatusBarCompoent";
// import CustomHeader from "../../../compoent/CustomHeader";
// import { SafeAreaView } from "react-native-safe-area-context";
// import imageIndex from "../../../assets/imageIndex";
// import font from "../../../theme/font";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import ScreenNameEnum from "../../../routes/screenName.enum";
// import { GOOGLE_MAPS_APIKEY, WebSocket_Url } from "../../../Api";

// const { width, height } = Dimensions.get('window');
// const MIN_PANEL_HEIGHT = 100;
// const MAX_PANEL_HEIGHT = height * 0.7;

// const CourierTrackingScreen = () => {
//   const nav = useNavigation();
//   const rou: any = useRoute();
//   const { item } = rou.params || {};

//   const driver = item?.assignedDriver;
//   const status = item?.deliveryStatus; // 'assigned' or 'picked_up'

//   // Coordinates
//   const pickup = {
//     latitude: parseFloat(item?.pickupLocationLon),
//     longitude: parseFloat(item?.pickupLocationLat),
//   };
//   const dropoff = {
//     latitude: parseFloat(item?.dropLocationLat),
//     longitude: parseFloat(item?.dropLocationLon),
//   };

//   // States
//   const [currentCoords, setCurrentCoords] = useState(pickup);
//   const [driverLocation] = useState(new AnimatedRegion({
//     ...pickup,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   }));
//   const [eta, setEta] = useState("Calculating...");

//   // Draggable Animation
//   const pan = useRef(new Animated.ValueXY({ x: 0, y: height - 250 })).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: Animated.event([null, { dy: pan.y }], { useNativeDriver: false }),
//       onPanResponderRelease: (e, gestureState) => {
//         if (gestureState.dy < -100) {
//           // Snap to Top
//           Animated.spring(pan, { toValue: { x: 0, y: height * 0.3 }, useNativeDriver: false }).start();
//         } else {
//           // Snap to Bottom
//           Animated.spring(pan, { toValue: { x: 0, y: height - 250 }, useNativeDriver: false }).start();
//         }
//       },
//     })
//   ).current;

//   useEffect(() => {
//     const socket = new WebSocket(`${WebSocket_Url}/${item.trackingId}`);
//     socket.onmessage = (e) => {
//       try {
//         const data = JSON.parse(e.data);
//         if (data.latitude && data.longitude) {
//           const newPoint = { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) };
//           setCurrentCoords(newPoint);
//           driverLocation.timing({ ...newPoint, duration: 2000, useNativeDriver: false }).start();
//         }
//       } catch (err) { console.log(err); }
//     };
//     return () => socket.close();
//   }, [item.trackingId]);

//   return (
//     <View style={styles.container}>
//       <StatusBarComponent />
//       <View style={styles.headerFixed}>
//          <CustomHeader label={`Track Order`} />
//       </View>

//       <MapView
//         style={styles.map}
//         initialRegion={{ ...pickup, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
//       >
//         <Marker coordinate={pickup} title="Pickup" pinColor="green" />
//         <Marker coordinate={dropoff} title="Drop-off" pinColor="red" />

//         <Marker.Animated
//           key="live-driver"
//           coordinate={driverLocation as any}
//           anchor={{ x: 0.5, y: 0.5 }}
//         >
//           <View style={styles.courierMarker}>
//             <Image source={imageIndex.deliver} style={styles.courierImage} />
//           </View>
//         </Marker.Animated>

//         {/* DYNAMIC ROUTE LOGIC */}
//         {status === "assigned" ? (
//           <MapViewDirections
//             origin={currentCoords}
//             destination={pickup}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="#2196F3" // Blue: Driver going to pickup
//             onReady={res => setEta(`${Math.ceil(res.duration)} mins to pickup`)}
//           />
//         ) : (
//           <MapViewDirections
//             origin={currentCoords}
//             destination={dropoff}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={4}
//             strokeColor="#FFCC00" // Yellow: Driver going to dropoff
//             onReady={res => setEta(`${Math.ceil(res.duration)} mins to destination`)}
//           />
//         )}
//       </MapView>

//       {/* DRAGGABLE PANEL */}
//       <Animated.View
//         style={[styles.draggablePanel, { transform: [{ translateY: pan.y }] }]}
//         {...panResponder.panHandlers}
//       >
//         <View style={styles.dragHandle} />

//         <ScrollView style={styles.panelContent}>
//           <View style={styles.driverHeader}>
//             <Image source={{ uri: driver?.image }} style={styles.avatar} />
//             <View style={{ flex: 1 }}>
//               <Text style={styles.driverName}>{driver?.name}</Text>
//               <Text style={styles.etaText}>{eta}</Text>
//             </View>
//             <View style={styles.actionRow}>
//                <TouchableOpacity style={styles.iconCircle} onPress={() => Linking.openURL(`tel:${driver?.phone}`)}>
//                  <Image source={imageIndex.Calls} style={styles.icon} />
//                </TouchableOpacity>
//                <TouchableOpacity style={styles.iconCircle} onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}>
//                  <Image source={imageIndex.messtrcker} style={styles.icon} />
//                </TouchableOpacity>
//             </View>
//           </View>

//           <View style={styles.statsRow}>
//              <View style={styles.statBox}><Text style={styles.statLabel}>Vehicle</Text><Text style={styles.statValue}>{driver?.vehicle?.vehicleNumber}</Text></View>
//              <View style={styles.statBox}><Text style={styles.statLabel}>Size</Text><Text style={styles.statValue}>{item?.packageSize}</Text></View>
//              <View style={styles.statBox}><Text style={styles.statLabel}>Status</Text><Text style={styles.statValue}>{status}</Text></View>
//           </View>

//           <Text style={styles.sectionTitle}>Delivery Locations</Text>
//           <View style={styles.locationList}>
//              <Text style={styles.locationText}>🟢 Pickup: {item?.pickupLocation}</Text>
//              <View style={styles.verticalLine} />
//              <Text style={styles.locationText}>🔴 Drop: {item?.dropLocation}</Text>
//           </View>
//         </ScrollView>
//       </Animated.View>
//     </View>
//   );
// };

// export default CourierTrackingScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFF" },
//   headerFixed: { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
//   map: { width: width, height: height },
//   courierMarker: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 2, borderColor: '#FFCC00' },
//   courierImage: { width: 25, height: 25, resizeMode: 'contain' },
//   draggablePanel: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     backgroundColor: 'white',
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     height: height,
//     elevation: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//   },
//   dragHandle: { width: 40, height: 5, backgroundColor: '#DDD', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
//   panelContent: { padding: 20 },
//   driverHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
//   avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
//   driverName: { fontSize: 18, fontWeight: 'bold' },
//   etaText: { color: '#FFCC00', fontWeight: '600' },
//   actionRow: { flexDirection: 'row', gap: 10 },
//   iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
//   icon: { width: 20, height: 20 },
//   statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
//   statBox: { alignItems: 'center', flex: 1 },
//   statLabel: { fontSize: 10, color: '#999' },
//   statValue: { fontSize: 12, fontWeight: 'bold' },
//   sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
//   locationList: { paddingLeft: 10 },
//   locationText: { fontSize: 13, color: '#444' },
//   verticalLine: { width: 1, height: 20, backgroundColor: '#EEE', marginLeft: 5, marginVertical: 5 }
// });

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
  Dimensions,
  Platform,
  PanResponder,
} from "react-native";
import MapView, { Marker, AnimatedRegion, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import StatusBarComponent from "../../../compoent/StatusBarCompoent";
import CustomHeader from "../../../compoent/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import imageIndex from "../../../assets/imageIndex";
import font from "../../../theme/font";
import { useNavigation, useRoute } from "@react-navigation/native";
import ScreenNameEnum from "../../../routes/screenName.enum";
import { GOOGLE_MAPS_APIKEY, WebSocket_Url } from "../../../Api";
import { STATUS } from "../../../utils/Constant";

const { width, height } = Dimensions.get("window");
const PANEL_PEEK_HEIGHT = 280;
const PANEL_OPEN_Y = height * 0.3;
const PANEL_CLOSED_Y = height - PANEL_PEEK_HEIGHT;

const CourierTrackingScreen = () => {
  const nav = useNavigation();
  const rou: any = useRoute();
  const { item } = rou.params || {};
  console.log(item, "this is new packag item");
  const driver = item?.assignedDriver;
  const status = item?.deliveryStatus;
useEffect(()=>{

},[item])
  // 1. Static Driver Coordinates for testing
  const staticDriverCoords = {
    latitude: 33.95, // 22.5028885,
    longitude: 117.4028, //75.0715906,
  };

  const DEFAULT_LAT = 28.6139;
  const DEFAULT_LNG = 77.209;
  const safeNum = (v: any, fallback: number) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const pickup = {
    latitude: safeNum(item?.pickupLocationLon, DEFAULT_LAT),
    longitude: safeNum(item?.pickupLocationLat, DEFAULT_LNG),
  };
  const dropoff = {
    latitude: safeNum(item?.dropLocationLat, DEFAULT_LAT),
    longitude: safeNum(item?.dropLocationLon, DEFAULT_LNG),
  };
  const [distance, setDistance] = useState(0);
  // 2. States - Initialize currentCoords with the static driver position
  const [currentCoords, setCurrentCoords] = useState(staticDriverCoords);
  const [driverLocation] = useState(
    new AnimatedRegion({
      ...staticDriverCoords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
  );
  const [eta, setEta] = useState("Calculating...");

  const mapRef = useRef<MapView>(null);
  const pan = useRef(new Animated.Value(PANEL_CLOSED_Y)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const newY = PANEL_CLOSED_Y + gestureState.dy;
        if (newY > PANEL_OPEN_Y) pan.setValue(newY);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy < -50) {
          Animated.spring(pan, {
            toValue: PANEL_OPEN_Y,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(pan, {
            toValue: PANEL_CLOSED_Y,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    const socket = new WebSocket(`${WebSocket_Url}/${item.trackingId}`);
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.latitude && data?.longitude) {
          const newPoint = {
            latitude: parseFloat(data?.latitude),
            longitude: parseFloat(data.longitude),
          };
          setCurrentCoords(newPoint); // This triggers the route update
          driverLocation
            .timing({ ...newPoint, duration: 2000, useNativeDriver: false })
            .start();
        }
      } catch (err) {
        console.log("Socket Error:", err);
      }
    };
    return () => socket.close();
  }, [item?.trackingId]);

  return (
    <View style={styles.container}>
      <StatusBarComponent />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...staticDriverCoords,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        <Marker coordinate={pickup} title="Pickup Point">
          <View style={[styles.dotMarker, { backgroundColor: "#4CAF50" }]} />
        </Marker>
        <Marker coordinate={dropoff} title="Drop-off Point">
          <View style={[styles.dotMarker, { backgroundColor: "#F44336" }]} />
        </Marker>

        <Marker.Animated
          key="driver-marker"
          coordinate={driverLocation as any}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.courierMarker}>
            <Image source={imageIndex.deliver} style={styles.courierImage} />
          </View>
        </Marker.Animated>

        {/* Base polyline – Rapido style: thick visible route line */}
        <MapViewDirections
          origin={currentCoords}
          destination={
            status === STATUS.ASSIGNED || status === STATUS.GOING_TO_PICKUP
              ? pickup
              : dropoff
          }
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={8}
          strokeColor={status === STATUS.ASSIGNED || status === STATUS.GOING_TO_PICKUP ? "#007AFF" : "#FF9500"}
          lineCap="round"
          lineJoin="round"
          onReady={(res) => {
            setDistance(res?.distance ?? 0);
            setEta(`${Math.ceil(res.duration ?? 0)} mins`);
            const dest =
              status === STATUS.ASSIGNED || status === STATUS.GOING_TO_PICKUP
                ? pickup
                : dropoff;
            mapRef.current?.fitToCoordinates(
              [currentCoords, dest],
              {
                edgePadding: { top: 80, right: 50, bottom: 320, left: 50 },
                animated: true,
              }
            );
          }}
        />
      </MapView>

      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <CustomHeader label="" />
      </SafeAreaView>

      <Animated.View style={[styles.draggablePanel, { top: pan }]}>
        <View {...panResponder.panHandlers} style={styles.dragArea}>
          <View style={styles.handleBar} />
        </View>

        <View style={styles.scrollContent}>
          <View style={styles.driverSection}>
            <Image source={{ uri: driver?.image }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {driver?.name || "Assigning..."}
              </Text>
              <Text style={styles.vehicleInfo}>
                {driver?.vehicle?.vehicleType} •{" "}
                {driver?.vehicle?.vehicleNumber}
              </Text>

              {/* Added Distance and ETA row */}
              <View style={styles.liveInfoRow}>
                <Text style={styles.etaBadge}>{eta}</Text>
                <Text style={styles.dotSeparator}> • </Text>
                <Text style={styles.distanceBadge}>
                  {distance + " km" || "0 km"}
                </Text>
              </View>
            </View>

            {/* Added OTP Section */}
            <View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.btnCall}
                  onPress={() => Linking.openURL(`tel:${driver?.phone}`)}
                >
                  <Image source={imageIndex.Calls} style={styles.iconBtn} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnChat}
                  onPress={() => nav.navigate(ScreenNameEnum.ChatScreen)}
                >
                  <Image
                    source={imageIndex.messtrcker}
                    style={styles.iconBtn}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.otpContainer}>
                <Text style={styles.otpLabel}>OTP: </Text>
                {/* <Text style={styles.otpValue}>{item?.deliveryStatus == 'assigned'? item?.pickupOtp : item?.deliveryOtp}</Text> */}
                <Text style={styles.otpValue}>
                  {item?.deliveryStatus === STATUS.ASSIGNED ||
                  item?.deliveryStatus === STATUS.GOING_TO_PICKUP
                    ? item?.pickupOtp
                    : item?.deliveryOtp}
                </Text>
              </View>
            </View>
          </View>

          {/* Rest of your Parcel Details and Address Box */}
          <View style={styles.parcelCard} {...panResponder.panHandlers}>
            <Text style={styles.sectionTitle}>Parcel Details</Text>
            <View style={styles.grid}>
              <StatBox label="Size" value={item?.packageSize} />
              <StatBox label="Type" value={item?.consignmentType} />
              <StatBox label="Service" value={item?.deliveryType} />
            </View>
          </View>

          {/* <View style={styles.addressBox} {...panResponder.panHandlers}>
       <Text style={styles.addressText}  >🟢 From: {item?.pickupLocation}</Text>
       <View style={styles.vLine} />
       <Text style={styles.addressText} >🔴 To: {item?.dropLocation}</Text>
    </View> */}
          <View style={styles.addressBox} {...panResponder.panHandlers}>
            {/* Pickup Row */}
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>🟢</Text>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>From</Text>
                <Text style={styles.addressText}>{item?.pickupLocation}</Text>
              </View>
            </View>

            {/* Vertical Connector Line */}
            <View style={styles.vLineContainer}>
              {/* <View style={styles.vLine} /> */}
            </View>

            {/* Drop-off Row */}
            <View style={styles.addressRow}>
              <Text style={styles.addressIcon}>🔴</Text>
              <View style={styles.addressTextContainer}>
                <Text style={styles.addressLabel}>To</Text>
                <Text style={styles.addressText}>{item?.dropLocation}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const StatBox = ({ label, value }: any) => (
  <View style={styles.gridItem}>
    <Text style={styles.gridLabel}>{label}</Text>
    <Text style={styles.gridValue}>{value}</Text>
  </View>
);

export default CourierTrackingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  map: { width: width, height: height },
  headerOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5 },
  dotMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "white",
  },
  courierMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    borderWidth: 2,
    borderColor: "#FFCC00",
  },
  courierImage: { width: 30, height: 30, resizeMode: "contain" },
  draggablePanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 25,
  },
  dragArea: { width: "100%", paddingVertical: 15, alignItems: "center" },
  handleBar: {
    width: 45,
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  driverName: { fontSize: 17, fontWeight: "bold", color: "#000" },
  vehicleInfo: { fontSize: 12, color: "#777" },
  etaBadge: {
    color: "#FFCC00",
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 4,
  },
  actionButtons: { flexDirection: "row", gap: 10 },
  btnCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  btnChat: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtn: { width: 20, height: 20, resizeMode: "contain" },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  gridItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 12,
    marginHorizontal: 3,
  },
  gridLabel: { fontSize: 9, color: "#999", marginBottom: 2 },
  gridValue: { fontSize: 11, fontWeight: "bold", color: "black" },
  // addressBox: { marginTop: 20, padding: 12, backgroundColor: '#FDFDFD', borderRadius: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  // addressText: { fontSize: 13, color: '#555' },
  // vLine: { width: 1, height: 10, backgroundColor: '#DDD', marginLeft: 4, marginVertical: 3 },
  parcelCard: { marginTop: 20 },
  liveInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  distanceBadge: {
    color: "#4CAF50", // Green for distance
    fontWeight: "bold",
    fontSize: 13,
  },
  dotSeparator: {
    color: "#CCC",
    marginHorizontal: 4,
  },
  otpContainer: {
    // backgroundColor: '#FFF9E5', // Light yellow background
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#FFCC00",
    borderStyle: "dashed",
    flexDirection: "row",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
  },
  otpLabel: {
    fontSize: 9,
    color: "#777",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  otpValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
  },
  addressBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    // Adding a slight shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    // elevation: 2,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start", // Keeps icons at the top of multi-line text
  },
  addressIcon: {
    fontSize: 12,
    marginRight: 12,
    marginTop: 4, // Aligns emoji with the first line of text
  },
  addressTextContainer: {
    flex: 1, // Crucial for multi-line wrapping
  },
  addressLabel: {
    fontSize: 10,
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18, // Improves readability for multi-line
    fontFamily: font.MonolithRegular,
  },
  vLineContainer: {
    marginLeft: 5, // Centers the line under the Green dot
    height: 20, // Adjust this height to control spacing between rows
    justifyContent: "center",
  },
  vLine: {
    width: 1,
    height: "100%",
    backgroundColor: "#DDD",
    borderStyle: "dashed", // Optional: looks more "logistics" style
    borderRadius: 1,
    flex: 1,
  },
});
