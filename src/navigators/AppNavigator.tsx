import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RegistrationRoutes from './RegistrationRoutes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../redux/store';
 import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import NetworkStatusModal from '../compoent/NetworkStatusModal';
 

const AppNavigator: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
 
  // NetInfo listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
           <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
               <NetworkStatusModal
                modalVisible={!isConnected}
                offlineText="No Internet! Please check your connection."
              />
              <RegistrationRoutes />
             </NavigationContainer>
          </GestureHandlerRootView>
       </PersistGate>
    </Provider>
  );
};

export default AppNavigator;
