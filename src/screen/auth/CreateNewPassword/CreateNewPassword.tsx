import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ImageBackground
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loading from '../../../utils/Loader';
import imageIndex from '../../../assets/imageIndex';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import CustomButton from '../../../compoent/CustomButton';
import CustomInput from '../../../compoent/CustomInput';
import Icon from '../../../compoent/Icon';
import localizationStrings from '../../../localization/LocalizationString';
 import { styles } from './style';
import { validateConfirmPassword, validatePassword } from '../../../utils/validation';
import { useCreateNewPassword } from './useCreateNewPassword';

export default function CreatePassword() {
  const {
    password,
    confirmPassword,
    passwordError,
    confirmPasswordError,
    isLoading,
    handlePassText,
    handleCPassText,
    handleSetPassword,
    navigation
  } = useCreateNewPassword()

  return (
    <ImageBackground
      source={imageIndex.AuthBg}
      style={styles.background}
      resizeMode="stretch"
    >
      <SafeAreaView style={styles.container}>
        <StatusBarComponent />
        {isLoading && <Loading />}
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={imageIndex.leftCircle} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text  allowFontScaling={false}   style={styles.title}>{localizationStrings.createPasTitle}</Text>
            <Text  allowFontScaling={false}   style={styles.description}>{localizationStrings.createPassDes}</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              placeholder={localizationStrings.passPlace}
              leftIcon={<Icon source={imageIndex.lock} size={20} colorIcon="#A59F9F" />}
              value={password}
              onChangeText={handlePassText}
              secureTextEntryToggle
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <CustomInput
              placeholder={localizationStrings.cPasswordPlac}
              leftIcon={<Icon source={imageIndex.lock} size={20} colorIcon="#A59F9F" />}
              value={confirmPassword}
              onChangeText={handleCPassText}
              secureTextEntryToggle
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>
        </ScrollView>

        <CustomButton title={localizationStrings.submit} onPress={handleSetPassword} />
      </SafeAreaView>
    </ImageBackground>
  );
}
