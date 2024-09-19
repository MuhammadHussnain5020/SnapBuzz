import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {API_URL} from '../../env';

const FollowerFollowingItem = ({username, profilePhoto, userId}) => {
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await fetch(`${API_URL}/api/user/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            setCurrentUserId(data._id);
          } else {
            console.error('Error fetching current user data:', data.message);
          }
        } else {
          console.error('Token not found');
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      }
    };

    fetchCurrentUserId();
  }, []);

  const handlePress = async () => {
    try {
      if (currentUserId) {
        navigation.navigate('ChatScreen', {
          userId: currentUserId,
          receiverId: userId,
          receiverName: username,
          receiverProfilePhoto: profilePhoto,
        });
      } else {
        console.error('Current user ID not found');
      }
    } catch (error) {
      console.error('Error navigating to ChatScreen:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={handlePress}>
      <View style={styles.profileImageContainer}>
        <Image
          source={{uri: profilePhoto || require('../../assets/images/tom.png')}}
          style={styles.profileImage}
        />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{username}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Message = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mergedUsers, setMergedUsers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchFollowersAndFollowing();
      logAsyncStorage();
    }, []),
  );

  const getData = async key => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    } catch (e) {
      console.error('Error retrieving data from AsyncStorage:', e);
    }
    return null;
  };

  const fetchFollowersAndFollowing = async () => {
    try {
      const token = await getData('userToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/followers-following`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        const combined = [...data.followers, ...data.following];
        const uniqueUsers = Array.from(
          new Set(combined.map(user => user._id)),
        ).map(id => combined.find(user => user._id === id));
        setMergedUsers(uniqueUsers || []);
      } else {
        console.error('Error fetching followers and following:', data.message);
      }
    } catch (error) {
      console.error('Error fetching followers and following:', error);
    }
  };

  const logAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage data:', result);
    } catch (error) {
      console.error('Error logging AsyncStorage data:', error);
    }
  };

  const filteredUsers = mergedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversation</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <ScrollView style={styles.conversationsList}>
          {filteredUsers.map(user => (
            <FollowerFollowingItem
              key={user._id}
              userId={user._id}
              username={user.username}
              profilePhoto={`${API_URL}/${user.profilePhoto}`}
            />
          ))}
          <View style={{height: 100}} />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  conversationsList: {
    flex: 1,
    padding: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 50,
    overflow: 'hidden',
    marginRight: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Message;
