import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Share, // Import the Share API
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LikeButton from '../components/LikeButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUserData from '../hooks/useFectchUserData';
import {API_URL} from '../../env';
import moment from 'moment'; // Import moment for date formatting

const Home = ({route, navigation}) => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});
  const [loading, setLoading] = useState(true);

  const {userData, loading: userLoading} = useFetchUserData(); // Fetch user data

  useEffect(() => {
    if (!userLoading && userData) {
      fetchFollowedUsers();
      fetchPosts();
    }
  }, [userLoading, userData]);

  useEffect(() => {
    if (route.params?.newPost) {
      addNewPost(route.params.newPost);
    }
  }, [route.params?.newPost]);

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

  const fetchFollowedUsers = async () => {
    try {
      const token = await getData('userToken'); // Retrieve the token from AsyncStorage
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/followedUsers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        const followedUsersMap = {};
        data.followedUsers.forEach(user => {
          followedUsersMap[user._id] = true;
        });
        setFollowedUsers(followedUsersMap);
      } else {
        console.error('Error fetching followed users:', data.message);
      }
    } catch (error) {
      console.error('Error fetching followed users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();

      const processedData = data.map(post => ({
        id: post._id,
        userId: post.userId,
        user: post.username || 'Unknown User',
        time: moment(post.createdAt).fromNow(), // Format the creation time using moment
        text: post.desc || '',
        profilePhoto: post.profilePhoto
          ? post.profilePhoto
          : 'https://via.placeholder.com/50',
        image: post.img
          ? `${API_URL}/uploads/${post.img}`
          : 'https://via.placeholder.com/150',
        initialLikes: post.likes ? post.likes.length : 0,
        followed: followedUsers[post.userId] || false,
      }));
      console.log('all data', processedData);

      setPosts(processedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewPost = newPost => {
    setPosts(prevPosts => {
      const isDuplicate = prevPosts.some(post => post.id === newPost._id);
      if (isDuplicate) return prevPosts;

      return [
        {
          id: newPost._id,
          userId: newPost.userId,
          user: newPost.username,
          time: 'Just now',
          image: `${API_URL}/uploads/${newPost.img}`,
          text: newPost.desc,
          initialLikes: 0,
          followed: followedUsers[newPost.userId] || false,
          profilePhoto: newPost.profilePhoto,
        },
        ...prevPosts,
      ];
    });
  };

  const handleLike = (postId, isLiked) => {
    setLikedPosts(prevLikedPosts => ({
      ...prevLikedPosts,
      [postId]: isLiked,
    }));
  };

  const handleFollow = async userId => {
    if (userLoading) {
      console.log('User data is still loading');
      return;
    }

    try {
      const token = await getData('userToken'); // Retrieve the token from AsyncStorage
      const currentUserId = userData._id; // Get the current user ID

      console.log('Current user ID:', currentUserId);
      console.log('Follow token:', token);

      if (!token) {
        console.error('Token not found');
        return;
      }

      // Ensure the current user is not trying to follow themselves
      if (currentUserId === userId) {
        console.error('Cannot follow yourself');
        return;
      }

      const followed = followedUsers[userId];
      const url = `${API_URL}/api/user/follow/${userId}`;
      console.log('User id to be follow', userId);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setFollowedUsers(prevFollowedUsers => ({
          ...prevFollowedUsers,
          [userId]: !followed,
        }));
      } else {
        console.error('Error:', data.message);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleShare = async post => {
    try {
      const result = await Share.share({
        message: `${post.user} shared a post: ${post.text}\n\nCheck it out: ${post.image}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Post shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  if (loading || userLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Image source={{uri: item.profilePhoto}} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.user}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => handleFollow(item.userId)}>
                <Text style={styles.followButtonText}>
                  {followedUsers[item.userId] ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{uri: item.image}}
              style={styles.postImage}
              resizeMode="contain"
            />
            <Text style={styles.postText}>{item.text}</Text>
            <View style={styles.postFooter}>
              <TouchableOpacity
                style={styles.postFooterIcon}
                onPress={() => handleShare(item)}>
                <Icon name="share" size={20} color="#000" />
              </TouchableOpacity>
              <LikeButton
                postId={item.id}
                initialLikes={item.initialLikes}
                onLike={handleLike}
                // style={{left:30}}
              />
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CommentComponent', {
                    postId: item.id,
                    userId: userData._id, // Pass userId if needed
                    username: userData.username, // Pass username if needed
                    profilePhoto: userData.profilePhoto, // Pass profile photo if needed
                  })
                }>
                <View style={styles.postFooterIcon}>
                  <Icon name="comment" size={20} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <View style={{height: 20}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  time: {
    color: '#666',
    fontSize: 12,
    // bottom:6
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#26275B',
  },
  followButtonText: {
    color: '#fff',
    textAlign: 'center',
    // bottom: 2.5,
  },
  postImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: 'cover',
  },
  postText: {
    fontSize: 14,
    color: '#333',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '50%',
  },
  postFooterIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Home;
