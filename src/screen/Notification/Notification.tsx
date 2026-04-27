import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '../../compoent/CustomHeader';
import imageIndex from '../../assets/imageIndex';
import { useNavigation } from '@react-navigation/native';
import strings from '../../localization/Localization';
import { GetNotifications } from '../../Api/apiRequest';
import { color } from '../../constant';
import moment from 'moment';
import { RefreshControl } from 'react-native';


const NotificationItem = ({ item }) => {
  return (
    <View
      style={[
        styles.itemContainer,
        (item.isRead === false || item.isRead === 0) && styles.unreadBackground
      ]}
    >
      <View style={[styles.dot, (item.isRead === true || item.isRead === 1) && { backgroundColor: '#E0E0E0' }]} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body}>{item.body}</Text>
        <Text style={styles.date}>{moment(item.createdAt).fromNow()}</Text>
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const groupNotifications = (data) => {
    const grouped = [
      { title: strings.Today || 'Today', data: [] },
      { title: strings.Yesterday || 'Yesterday', data: [] },
      { title: strings.Earlier || 'Earlier', data: [] },
    ];

    data.forEach(item => {
      const date = moment(item.createdAt);
      if (date.isSame(moment(), 'day')) {
        grouped[0].data.push(item);
      } else if (date.isSame(moment().subtract(1, 'days'), 'day')) {
        grouped[1].data.push(item);
      } else {
        grouped[2].data.push(item);
      }
    });

    return grouped.filter(section => section.data.length > 0);
  };

  const fetchNotifications = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    const res = await GetNotifications(setLoading);

    console.log("Notifications Screen Response:", res);
    if (res && (res.status === 1 || res.status === "1")) {
      const groupedData = groupNotifications(res.notifications || []);
      setSections(groupedData);
    }
    setRefreshing(false);
    setLoading(false);
  };

  const onRefresh = () => {
    fetchNotifications(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        label={strings.Notifications || "Notification"}
      />
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color.green} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => <NotificationItem item={item} />}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{strings.NoNotifications || "No notifications found"}</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[color.green]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
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
    fontWeight: '600',
    color: '#333',
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
});

export default NotificationsScreen;
