import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, View, Image } from 'react-native';
  import font from '../theme/font';
import SvgIndex from '../assets/svgIndex';
 import { useSafeAreaInsets } from 'react-native-safe-area-context';
 import DeliveryHome from '../screen/DeliveryBottomTab/Delivery/DeliveryHome/DeliveryHome';
 import DeliverOrders from '../screen/DeliveryBottomTab/Delivery/DeliverOrders/DeliverOrders';
 import Inbox from '../screen/BottomTab/Inbox/Inbox';
import DeliveryProfile from '../screen/DeliveryBottomTab/DeliveryProfile/DeliveryProfile';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  ["Home"]: {
    label: 'Home',
    iconActive: SvgIndex.HomeAtive, 
    iconInactive: SvgIndex.Home, 
  },
   
  Orders: {
    label: 'Orders',
    iconActive: SvgIndex.Box, 
    iconInactive: SvgIndex.Box1,  
  },
  Inbox: {
    label: 'Inbox',
    iconActive: SvgIndex.MessageActive, 
    iconInactive: SvgIndex.Message,
  },
  Profile: {
    label: 'Profile',
    iconActive: SvgIndex.UserActive, 
    iconInactive: SvgIndex.User,
  },
};

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 80 : 70;
const ICON_SIZE = 26;

export default function DeliveryTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TAB_CONFIG[route.name];
        return {
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <Text
              allowFontScaling={false}
              style={{
                fontSize: 12,
                color: focused ? '#FFCC00' : '#2F4858',
                marginTop: 4,
                fontFamily: font.MonolithRegular,
              }}
            >
              {tab?.label ?? route.name}
            </Text>
          ),
          tabBarIcon: ({ focused }) => {
            const Icon = focused ? tab?.iconActive : tab?.iconInactive;
            if (typeof Icon === 'function') {
              return <Icon width={ICON_SIZE} height={ICON_SIZE} />;
            } else {
              return (
                <Image
                  source={Icon}
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    resizeMode: 'contain',
                  }}
                />
              );
            }
          },
          tabBarStyle: {
            position: 'absolute',
            left: 20,
            right: 20,
             backgroundColor: 'white', // your desired background
            height: TAB_BAR_HEIGHT + insets.bottom, // safe height including bottom inset
            paddingBottom: insets.bottom,
            paddingTop: 8,
          
            // Rounded corners
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
          
            // Borders
        
            borderTopColor: 'rgba(125, 154, 155, 0.15)',
            borderLeftColor: 'rgba(125, 154, 155, 0.15)',
            borderRightColor: 'rgba(125, 154, 155, 0.15)',
          
            // Optional shadow for iOS
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
          
            // Optional elevation for Android
            elevation: 4,
          
       
          },
        };
      }}
    >
      <Tab.Screen name={"Home"} component={DeliveryHome} />
      {/* <Tab.Screen name="MyTrack" component={MyTrack} /> */}
       <Tab.Screen name="Orders" component={DeliverOrders} />
       <Tab.Screen name="Inbox" component={Inbox} />
       <Tab.Screen name="Profile" component={DeliveryProfile} />
     </Tab.Navigator>
  );
}
