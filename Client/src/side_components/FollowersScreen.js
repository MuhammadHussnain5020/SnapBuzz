import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../env';
import axios from 'axios';

const FollowersScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }

        const response = await axios.get(`${API_URL}/api/user/followers`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        // Directly access the data from axios response
        const data = response.data;
        if (response.status === 200) {
          setFollowers(data.followers);
          console.log('all data:', data);
        } else {
          console.error('Error fetching followers:', data.message);
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26275B" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="#26275B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Followers</Text>
      </View>
      {followers.length ? (
        followers.map(follower => (
          <TouchableOpacity
            key={follower._id}
            style={styles.followerContainer}
            onPress={() => {
              navigation.navigate('FollowerProfileScreen', {followerId: follower._id});
            }}>
            <Image
              style={styles.followerImage}
              source={
                follower.profilePhoto
                  ? {uri: `${API_URL}/${follower.profilePhoto}`}
                  : require('../../assets/images/images.png')
              }
            />
            <View style={styles.followerInfo}>
              {/* <Text style={styles.followerName}>{follower.name}</Text> */}
              <Text style={styles.followerUsername}>{follower.username}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noFollowersText}>No followers available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#26275B',
  },
  followerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  followerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderColor: '#26275B',
    borderWidth: 1,
  },
  followerInfo: {
    flexDirection: 'column',
  },
  followerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#26275B',
  },
  followerUsername: {
    fontSize: 16,
    color: '#888',
  },
  noFollowersText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});

export default FollowersScreen;
