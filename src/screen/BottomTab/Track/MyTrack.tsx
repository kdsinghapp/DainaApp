// src/screens/InputMealScreen.js
import React, {useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, Dimensions } from 'react-native';
 import CustomHeader from '../../../compoent/CustomHeader';
import imageIndex from '../../../assets/imageIndex';
import { SafeAreaView } from 'react-native-safe-area-context';
import { color } from '../../../constant';
 import ScreenNameEnum from '../../../routes/screenName.enum';
import font from '../../../theme/font';
 import svgIndex from '../../../assets/svgIndex';
import { get_tasksMainAll } from '../../../Api/apiRequest';
import LoadingModal from '../../../utils/Loader';

export default function MyTrack({ navigation }: any) {
     
       const screenWidth = Dimensions.get('window').width;

      const flatListRef = useRef(null);
      const [currentIndex, setCurrentIndex] = useState(0);
      const [Loading,setLoading]= useState(false)
      const [data,setdata] = useState([])
      const datas= [1]; // Replace with your real data if needed
    
    
      useEffect((()=>{
        getPrivacyPolicy()
      }),[])
      const getPrivacyPolicy = async () => {
        try {
          const state = await get_tasksMainAll(setLoading);
          if (state) {
            
            
           }
        } catch (error) {
         }
      };
    
      const handleScroll = (event:any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
        setCurrentIndex(index);
      };
    
 
      
    
    return (
        <SafeAreaView style={[styles.container,{
       
        }]}>
 

                               <LoadingModal visible={Loading} />

            <ScrollView contentContainerStyle={{ 
                 backgroundColor:"#F5F5F5" }}>
                {/* Header / Coach Card */} 
                <View style={{
                  justifyContent:"center" ,
                  alignItems:"center"
                }}>
              
       </View>
      {/* <View style={{  bottom:62,     position:"relative" ,flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
        {data.map((_, index) => (
          <View
            key={index}
            style={{
              height: 10,
              width: currentIndex === index ? 20 : 10,
              borderRadius: currentIndex === index ? 5 : 5,
              backgroundColor: currentIndex === index ? '#4CBCA6' : 'white',
              marginHorizontal: 5,
              marginTop: 5,
         
            }}
          />
        ))}
      </View> */}
      

                {/* Input Sections */}
                <Text   allowFontScaling={false}  style={styles.sectionTitle}>Input your meal</Text>
                <View style={{
                          marginHorizontal:5,
                          marginTop:10

                }} >
                     
                   
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    coachCard: {
      borderRadius: 12,        // rounds the corners
      marginBottom: 24,        // spacing below the component
      marginLeft: 15,          // spacing from the left
      width: '100%',           // full width of parent
      padding: 8,              // inner padding
      overflow: 'hidden',     
    },
    coachTitle: {
        color: 'white',
        fontSize: 18,
         marginBottom: 8,
        lineHeight:30,
        fontFamily:font.TrialDemiBold
    },
    cameraButton: {
        backgroundColor: 'white',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        height:45,
        justifyContent:"center"
     },
    cameraButtonText: {
        color: '#4CBCA6',
         fontSize: 14,
         fontFamily:font.TrialMedium ,
 
    },
    sectionTitle: {
        fontSize: 16,
         marginBottom: 8,
        color: '#708090',
        fontFamily:font.TrialMedium,
        marginHorizontal:24
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        
    },
});
