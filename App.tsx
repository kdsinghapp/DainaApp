import React, {FunctionComponent} from 'react';
import {LogBox, Text,} from 'react-native';
import 'react-native-gesture-handler';
import AppNavigator from './src/navigators/AppNavigator';
import { TextInput } from 'react-native';
import 'react-native-reanimated';
// "react-native-maps": "^1.26.14",
// 

LogBox.ignoreAllLogs(); 
(Text as any).defaultProps = (Text as any).defaultProps || {};


(Text as any).defaultProps.allowFontScaling = false;
 
(TextInput as any).defaultProps = (TextInput as any).defaultProps || {};

(TextInput as any).defaultProps.allowFontScaling = false;

(TextInput as any).defaultProps.underlineColorAndroid = "transparent";

 
const App: FunctionComponent<any> = () => <AppNavigator />;

export default App;
 