import React, { FunctionComponent } from 'react';
import { LogBox, Text, } from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigators/AppNavigator';
import { TextInput } from 'react-native';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/services/queryClient';
// "react-native-maps": "^1.26.14",
// 

LogBox.ignoreAllLogs();
(Text as any).defaultProps = (Text as any).defaultProps || {};



(Text as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};

(TextInput as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps.underlineColorAndroid = "transparent";


const App: FunctionComponent<any> = () =>
    <QueryClientProvider client={queryClient}>
        <AppNavigator />
    </QueryClientProvider>


export default App;



// Option 1: Short & Engaging (For Instagram Reels/YouTube Shorts - 30 to 45 Seconds)
// [दृश्य (Visuals)] वीडियो की शुरुआत में एक व्यक्ति आँखें बंद करके और हाथ में माला लिए ध्यान कर रहा है। फिर वह ध्यान भंग (distract) होकर अपनी संख्या भूल जाता है।
// [वॉयसओवर (Voiceover - शांत और आध्यात्मिक आवाज़ में)] क्या आप भी जाप करते समय अपनी माला की गिनती भूल जाते हैं? या सफर के दौरान अपनी साधना पूरी नहीं कर पाते?
// [दृश्य (Visuals)] स्क्रीन पर 'JAPA Sadhna Counter' ऐप का लोगो और सुंदर इंटरफ़ेस आता है। कोई स्क्रीन पर टैप कर रहा है और काउंटर बढ़ रहा है। साथ में 'शंख' और 'फूलों की बारिश' वाला एनीमेशन दिखता है।
// [वॉयसओवर (Voiceover - उत्साह के साथ)] अब अपनी साधना को बनाएं और भी सरल 'JAPA Sadhna Counter' ऐप के साथ! एक डिजिटल माला जो आपको दे: ✨ बिना किसी भटकाव (Distraction) के जाप का अनुभव। ✨ अपनी रोज़ाना की साधना का पूरा रिकॉर्ड। ✨ और माला पूरी होने पर शंख की मधुर ध्वनि!
// [दृश्य (Visuals)] कोई व्यक्ति मेट्रो या पार्क में शांति से इयरफ़ोन लगाकर ऐप पर टैप करते हुए जाप कर रहा है।
// [वॉयसओवर (Voiceover)] चाहे घर पर हों या सफर में, भगवान का नाम अब हमेशा आपके साथ। आज ही 'JAPA Sadhna Counter' ऐप डाउनलोड करें और अपनी आध्यात्मिक यात्रा को एक नई दिशा दें!
// [ऑन-स्क्रीन टेक्स्ट (On-screen Text & Call to Action)] ऐप स्टोर और गूगल प्ले का लोगो "अभी डाउनलोड करें - JAPA Sadhna Counter" (नीचे डाउनलोड का बटन)
 
// Option 2: Feature-Focused (For Facebook/YouTube Ads - 60 Seconds)
// [दृश्य (Visuals)] सुबह का शांत माहौल, एक दिया जल रहा है। बैकग्राउंड में हल्की सी बांसुरी या ॐ की ध्वनि।
// [वॉयसओवर (Voiceover)] ईश्वर का नाम लेना मन की सबसे बड़ी शांति है। लेकिन आज की भागदौड़ भरी ज़िंदगी में, क्या आप अपनी दैनिक साधना के लिए समय निकाल पा रहे हैं?
// [दृश्य (Visuals)] ऐप के अलग-अलग फीचर्स को स्क्रीन पर दिखाया जा रहा है। जैसे: काउंटर, प्रोग्रेस ट्रैकर, और सेटिंग्स।
// [वॉयसओवर (Voiceover)] प्रस्तुत है JAPA Sadhna Counter - आपका अपना डिजिटल आध्यात्मिक साथी। इस ऐप के ज़रिए आप: 1️⃣ डिजिटल जाप: अपनी स्क्रीन पर बस एक टैप से अपने मंत्रों की गिनती कर सकते हैं। 2️⃣ प्रोग्रेस ट्रैकिंग: जानिए आपने दिनभर में या महीने में कितनी माला का जाप किया। 3️⃣ पूर्ण होने का आनंद: हर माला पूरी होने पर फूलों की वर्षा और शंख की दिव्य ध्वनि का अनुभव करें।
// [दृश्य (Visuals)] एक युवा व्यक्ति ऑफिस ब्रेक में ऐप का इस्तेमाल कर रहा है और एक बुज़ुर्ग घर पर।
// [वॉयसओवर (Voiceover)] यह ऐप पूरी तरह से सुरक्षित है और बिना किसी इंटरनेट के (Offline) भी काम करता है। आपका डेटा सिर्फ आपके फ़ोन में रहता है।
// [दृश्य (Visuals)] ऐप का लोगो और डाउनलोड लिंक स्क्रीन पर पॉप-अप होता है।
// [वॉयसओवर (Voiceover)] ईश्वर से जुड़े रहने का ये आधुनिक तरीक़ा। अभी प्ले स्टोर पर जाएँ और सर्च करें JAPA Sadhna Counter। आइए, रोज़ाना कुछ पल प्रभु के नाम करें।
 
// Caption (वीडियो पोस्ट करने के लिए शीर्षक/विवरण)
// क्या आपकी रोज़ाना की साधना अधूरी रह जाती है? 🙏 'JAPA Sadhna Counter' के साथ अब कभी भी, कहीं भी प्रभु का स्मरण करें। 🌸 शंख की ध्वनि, डिजिटल काउंटर और आपकी पूरी प्रोग्रेस रिपोर्ट एक ही ऐप में! आज ही डाउनलोड करें और अपनी आध्यात्मिक यात्रा शुरू करें! ✨
// #JapaSadhna #MalaCounter #DigitalJapa #Hinduism #Meditation #SpiritualApp #JapaCounter
 