import React from 'react';
import { View, Text, StyleSheet, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../compoent/CustomHeader';
import imageIndex from '../../assets/imageIndex';
import { useNavigation } from '@react-navigation/native';

const notifications = [
  {
    title: 'Today',
    data: [
      {
        id: '1',
        title: 'Your weekly review has been answered',
        date: 'Jun 2, 2024 at 09:41 AM',
        unread: false,
      },
      {
        id: '2',
        title: 'Unread notification title',
        date: 'Date',
        unread: true,
      },
    ],
  },
  {
    title: 'This week',
    data: [
      {
        id: '3',
        title: 'Unread notification title',
        date: 'Date',
        unread: true,
      },
      {
        id: '4',
        title: 'Notification title',
        date: 'Date',
        unread: false,
      },
      {
        id: '5',
        title: 'Notification title',
        date: 'Date',
        unread: false,
      },
    ],
  },
];

const NotificationItem = ({ item }) => {
  return (
    <View
      style={[
        styles.itemContainer,
        item.unread && styles.unreadBackground
      ]}
    >
      <View style={styles.dot} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
    const navigation = useNavigation()
  return (
    <SafeAreaView style={styles.container}>
            <CustomHeader
                label={"Notification"}
                menuIcon={imageIndex.left}
                leftPress={true}
                navigation={navigation}
                // rightIcons={[
                //     { icon: imageIndex.close, onPress:()=>navigation.navigate(ScreenNameEnum.NotificationsScreen)}
                // ]}
            />
      <SectionList
        sections={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#555',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  unreadBackground: {
    backgroundColor: '#F0F8F5',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6FCF97',
    marginTop: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});

export default NotificationsScreen;
