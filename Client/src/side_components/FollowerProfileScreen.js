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
import axios from 'axios';
import {API_URL} from '../../env';

const FollowerProfileScreen = ({route, navigation}) => {
  const {followerId} = route.params;
  const [followerData, setFollowerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followerPosts, setFollowerPosts] = useState([]);

  useEffect(() => {
    const fetchFollowerData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'No token found');
          return;
        }

        const response = await axios.get(`${API_URL}/api/user/follower/${followerId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setFollowerData(response.data);
          fetchFollowerPosts(response.data._id, token);
          console.log("total data:",response.data)
        } else {
          console.error('Error fetching follower data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching follower data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFollowerPosts = async ( token) => {
      try {
        const response = await axios.get(
          `${API_URL}/api/posts/${followerId}/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200) {
          setFollowerPosts(response.data);
        } else {
          console.error(
            'Error fetching follower posts:',
            response.data.message,
          );
        }
      } catch (error) {
        console.error('Error fetching follower posts:', error);
      }
    };

    fetchFollowerData();
  }, [followerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26275B" />
      </View>
    );
  }
  console.log('Follower Data:', followerData);
  console.log('Follower Posts:', followerPosts);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.FirstContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.profileImageContainer}>
          <Image
            style={styles.profileImage}
            source={
              followerData.follower.profilePhoto
                ? {uri: `${API_URL}/${followerData.follower.profilePhoto}`}
                : require('../../assets/images/images.png')
            }
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.name}>{followerData.follower.name}</Text>
          <Text style={styles.username}>{followerData.follower.username}</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {followerData.follower.followers?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{followerPosts.length || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {followerData.follower.following?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => {
              navigation.navigate('Messages');
            }}>
            <Icon name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.scrollContainer}>
        {followerPosts.length ? (
          followerPosts.map(post => (
            <View key={post._id} style={styles.imageWrapper}>
              <Image
                style={styles.image}
                source={{
                  uri: `${API_URL}/uploads/${post.img}`,
                }}
                resizeMode="contain"
              />
            </View>
          ))
        ) : (
          <Text>No posts available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  FirstContainer: {
    flexGrow: 1,
    // alignItems: 'center',
    backgroundColor: '#fff',
    // width:"50%"
  },
  container: {
    flexGrow: 1,
    paddingBottom: 210,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '55%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    left: 10,
    bottom: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#888',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  scrollContainer: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: -5,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26275B',
    padding: 10,
    borderRadius: 5,
    width:"30%"
  },
  messageButtonText: {
    marginLeft: 5,
    color: '#fff',
    textAlign: 'center',
    bottom: 2.5,
  },
  imageWrapper: {
    width: '30%',
    marginBottom: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 5,
    borderColor: '#000',
    borderWidth: 1,
  },
});

export default FollowerProfileScreen;
