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
