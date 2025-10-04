import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  ImageBackground,
} from 'react-native';
import React, { useState } from 'react';
import {
  CodeField,
  Cursor,
  
} from 'react-native-confirmation-code-field';
 import imageIndex from '../../../assets/imageIndex';
import CustomButton from '../../../compoent/CustomButton';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import { styles } from './style';
import { useOtpVerification } from './useOTPVerification';
 import { hp } from '../../../utils/Constant';
  import { color } from '../../../constant';
import CustomHeader from '../../../compoent/CustomHeader';

export default function OtpScreen() {
  const {
    value,
    isLoading,
    errorMessage,
    ref,
    props,
    getCellOnLayoutHandler,
    handleChangeText,
    handleVerifyOTP,
    handleResendOTP,
    navigation,
  } = useOtpVerification()
   return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}

    >
               <StatusBarComponent />
               <CustomHeader label={"Back"}/>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.txtHeading}>Enter the verification code</Text>
            <Text style={styles.txtDes}>We sent you a 4-digit code to +91 8305611387
            </Text>
           </View>

          <View style={styles.otpFieldContainer}>
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={handleChangeText}
              cellCount={4}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View key={index} style={styles.cellWrapper}>
                  <Text
                    style={[styles.cell, isFocused && styles.focusCell]}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
            {/* {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null} */}
          </View>
          <Text 
          // onPress={()=>handleResendOTP()} 
          style={[styles.txtDes, { textAlign: 'center' }]}>Don't received the OTP ? {""}<Text style={{ color: color.primary }}> RESEND OTP</Text>
          </Text>
        </ScrollView>
        {/* <Image source={imageIndex.otp} style={{ width: '80%', height: hp(45), alignSelf: 'center', marginBottom: 30 }} /> */}

        <CustomButton
          title={"Continue"}
          // onPress={() => {
          //   if (type == "signup") {
          //     navigation.navigate(ScreenNameEnum.LoginScreen)

          //   } else {
          //     navigation.navigate(ScreenNameEnum.PasswordReset)


          //   }
          // }
          // }
          onPress={handleVerifyOTP}
          style={styles.submitButton}
        />

      </View>
    </SafeAreaView>
  );
}