import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import strings from '../../../localization/Localization';
import { saveLanguage, getLanguage } from '../../../localization/localeStorage';
import font from '../../../theme/font';
import { color } from '../../../constant';
import StatusBarComponent from '../../../compoent/StatusBarCompoent';
import ScreenNameEnum from '../../../routes/screenName.enum';
import { useDispatch } from 'react-redux';
import { setAppLanguage } from '../../../redux/feature/authSlice';
import CustomHeader from '../../../compoent/CustomHeader';

const LanguageSelection = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const isFirstTime = route.params?.isFirstTime || false;
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const lang = await getLanguage();
    setSelectedLanguage(lang);
  };

  const handleLanguageSelect = async (lang: string) => {
    setSelectedLanguage(lang);
    await saveLanguage(lang);
    strings.setLanguage(lang);
    dispatch(setAppLanguage(lang));
  };

  const onConfirm = () => {
    if (isFirstTime) {
      navigation.replace(ScreenNameEnum.OnboardingScreen);
    } else {
      navigation.goBack();
    }
  };

  const languages = [
    { code: 'en', name: 'English', subName: 'English', flag: '🇺🇸', },
    { code: 'mn', name: 'Монгол', subName: 'Mongolian', flag: '🇲🇳' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarComponent />
      <CustomHeader
        label={isFirstTime ? strings.SelectLanguage : strings.ChangeLanguage}
      />


      <ScrollView contentContainerStyle={styles.content}>
        {/* <Text style={styles.subtitle}>
          {isFirstTime
            ? "Welcome! Please select your language to continue"
            : "Please select your preferred language"}
        </Text> */}
        <View style={{ height: 120 }} />
        {languages.map((item) => (
          <TouchableOpacity
            key={item.code}
            style={[
              styles.languageItem,
              selectedLanguage === item.code && styles.selectedItem,
            ]}
            onPress={() => handleLanguageSelect(item.code)}
          >
            <View style={styles.languageInfo}>
              <Text style={[
                styles.languageName,
                selectedLanguage === item.code && styles.selectedText
              ]}>
                {item.flag}  {item.name}
              </Text>
              <Text style={styles.languageSubName}>{item.subName}</Text>
            </View>
            <View style={[
              styles.radioOutline,
              selectedLanguage === item.code && styles.radioOutlineSelected
            ]}>
              {selectedLanguage === item.code && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
        >
          <Text style={styles.confirmButtonText}>
            {isFirstTime ? (strings.Continue || 'Continue') : (strings.Done || 'Done')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: font.MonolithRegular,
    color: '#000',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 17,
    color: 'black',
    marginBottom: 24,
    fontFamily: font.MonolithRegular,
    textAlign: "center",
    paddingTop: 30
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 16,
    backgroundColor: '#F9F9F9',
  },
  selectedItem: {
    borderColor: color.primary,
    backgroundColor: '#FFFBE6',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontFamily: font.MonolithRegular,
    color: '#333',
  },
  selectedText: {
    color: color.primary,
  },
  languageSubName: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    fontFamily: font.MonolithRegular,
  },
  radioOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOutlineSelected: {
    borderColor: color.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: color.primary,
  },
  footer: {
    padding: 20,

  },
  confirmButton: {
    backgroundColor: color.primary,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',

  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: font.MonolithRegular,
  },
});

export default LanguageSelection;
