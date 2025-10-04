
import React, { useEffect, useState } from 'react'
import {
    Image, ScrollView, View,
    StyleSheet,
    useWindowDimensions,
    Text
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import HTML from 'react-native-render-html';
import Loading from '../../utils/Loader';
import imageIndex from '../../assets/imageIndex'
import StatusBarComponent from '../../compoent/StatusBarCompoent';
import CustomHeader from '../../compoent/CustomHeader';
import { useNavigation } from '@react-navigation/native';
 import { hp } from '../../utils/Constant';
import font from '../../theme/font';
const LegalPoliciesScreen = () => {
    const [isLoading, setLoading] = useState(false)
    const navigation = useNavigation()
    const [faqData, setFaqData] = useState([])
    useEffect(() => {
        // get_states_list()
    }, []);


    // const get_states_list = async () => {
    // try {
    //     const state = await Policies_Api(setLoading);
    //     if (state) {
    //         setFaqData(state?.result);  
    //     }
    // } catch (error) {
    //     setFaqData([]);
    // }
    // };

    const { width } = useWindowDimensions();

    return (
        <SafeAreaView style={[styles.container, {
        }]}>
            {isLoading ? <Loading /> : null}
            <StatusBarComponent />
            <CustomHeader


                
                label="Terms and Conditions" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
                <View style={styles.illustrationWrapper}>
                    <Image
                        source={imageIndex.aboutus}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>
                <View style={{ paddingHorizontal: 15 }}>
                    <Text style={{ color: "black",        fontFamily:font.MonolithRegular
, fontSize: 18 }}>Condition of Use</Text>
                    <Text style={{
                                fontFamily:font.MonolithRegular ,
                                marginTop:11

                    }}>This Privacy Policy describes Our policies and procedures on the
                        collection, use and disclosure of Your information when You use the
                        Service and tells You about Your privacy rights and how the law protects
                        You.We use Your Personal data to provide and improve the Service.
                        By using the Service, You agree to the collection and use of information
                        in accordance with this Privacy Policy.
                        This Privacy Policy has been created with the help of the</Text>


                    <Text style={{ color: "black",                                fontFamily:font.MonolithRegular , fontSize: 18, marginTop: 40 }}>Terms of Use</Text>
                    <Text 
                    
                    
                    style={{
                        fontFamily:font.MonolithRegular ,
marginTop:11
                    }}
                    >This Privacy Policy describes Our policies and procedures on the
                        collection, use and disclosure of Your information when You use the
                        Service and tells You about Your privacy rights and how the law protects
                        You.We use Your Personal data to provide and improve the Service.
                        By using the Service, You agree to the collection and use of information
                        in accordance with this Privacy Policy.
                        This Privacy Policy has been created with the help of the</Text>
                </View>
                {/* {faqData.length != 0 && (
                )} */}

                {/* {faqData &&
                    <HTML
                        source={{ html: faqData?.description || '<p>No content available</p>' }}
                        contentWidth={width}
                        tagsStyles={styles.htmlStyles}

                    />

                } */}

                {/* {faqData.length != 0 && (
                    <Text style={{marginTop:20, color: "black",fontWeight:"800" ,fontSize:18}}>Terms and Conditions</Text>
                )}

                {faqData &&
                    <HTML
                        source={{ html: faqData?.description || '<p>No content available</p>' }}
                        contentWidth={width}
                        tagsStyles={styles.htmlStyles}

                    />

                } */}
            </ScrollView>
        </SafeAreaView>

    )
}
const styles = StyleSheet.create({
    htmlStyles: {
        p: {
            fontSize: 14,
            color: '#333',
            lineHeight: 24,
            textAlign: 'justify',
            fontWeight: "500",
            marginTop: 8

        },
        h1: {
            fontSize: 22,
             color: '#000',
            marginBottom: 10,
            fontFamily:font.MonolithRegular

        },
        h2: {
            fontSize: 18,
             color: '#222',
            marginBottom: 8,
            fontFamily:font.MonolithRegular

        },
        a: {
            color: '#007bff',
            // textDecorationLine: 'underline',
        },
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 2,
        backgroundColor: '#FFF',
        // Add shadow on iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Add elevation on Android
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 70,
        alignItems: "center",
        marginHorizontal: 20
    },
    headerTitle: {
        fontSize: 18,
         color: '#333',
        fontFamily:font.MonolithRegular

    },
    contentContainer: {
        padding: 12,
    },
    illustrationWrapper: {
        alignItems: 'center',
        // marginBottom: 16,
    },
    illustration: {
        width: '80%',
        height: hp(30),
    },
    sectionTitle: {
        fontSize: 20,
         color: 'black',
        marginBottom: 10,
        lineHeight: 30,
        fontFamily:font.MonolithRegular

    },
    bodyText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
        textAlign: 'justify', 
        fontFamily:font.MonolithRegular
    },

});

export default LegalPoliciesScreen