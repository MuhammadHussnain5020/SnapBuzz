import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../env';
import {useFocusEffect} from '@react-navigation/native';

const NotificationScreen = ({navigation}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Fetched data:', data); // Log data to check its structure
      if (response.ok) {
        setNotifications(data.notifications || []);
        if (data.notifications.length > 0) {
          const userPhoto = data.notifications[0].user.profilePhoto;
          setUserProfilePhoto(userPhoto);
        }
      } else {
        console.error('Failed to fetch notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true); // Set loading to true every time screen is focused
      fetchNotifications();
    }, []),
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.profileImage}
          source={{
            uri:
              userProfilePhoto && userProfilePhoto.startsWith('http')
                ? userProfilePhoto
                : userProfilePhoto
                ? `${API_URL}/${userProfilePhoto}`
                : 'https://via.placeholder.com/40', // Fallback URL
          }}
        />
      </View>
      <View style={styles.not}>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.counter}>
          <Text style={styles.notificationCount}>
            {notifications.length || 0}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <Text style={styles.actionButton}>Show all Notifications</Text>
        {/* <Text style={styles.actionButton}>Mark all as read</Text> */}
      </View>
      {notifications.map((notification, index) => (
        <TouchableOpacity
          key={index}
          style={styles.notification}
          onPress={() => handleNotificationPress(notification, navigation)}>
          <Image
            style={styles.userImage}
            source={{
              uri: notification.fromUser.profilePhoto.startsWith('http')
                ? notification.fromUser.profilePhoto
                : `${API_URL}/${notification.fromUser.profilePhoto}`,
            }}
          />
          <View style={styles.notificationText}>
            <Text style={styles.userName}>
              {notification.fromUser.username}
            </Text>
            <Text style={styles.text}>
              {notification.type === 'like'
                ? 'Liked your post'
                : notification.type === 'follow'
                ? 'Started following you'
                : notification.type === 'comment'
                ? 'Commented on your post'
                : 'Notification'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{height: 70}} />
    </ScrollView>
  );
};

const handleNotificationPress = (notification, navigation) => {
  console.log('Notification Post ID:', notification.post);
  if (notification.type === 'like' || notification.type === 'comment') {
    navigation.navigate('PostDetails', {postId: notification.post});
  } else if (notification.type === 'follow') {
  console.log('Notification from user ID:', notification.fromUser._id);
    navigation.navigate('FollowersScreen', {userId: notification.fromUser._id, profilePhoto : notification.fromUser.profilePhoto});
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  not: {
    flexDirection: 'row',
  },
  counter: {
    alignSelf: 'center',
    backgroundColor: '#26275B',
    height: 35,
    width: 35,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    left: 10,
    top: 1,
  },
  notificationCount: {
    fontSize: 12,
    color: 'white',
    bottom: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    fontSize: 14,
    color: '#26275B',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  notificationText: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    color: '#555',
  },
});

export default NotificationScreen;
