import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../env';

const PostDetails = ({route, navigation}) => {
  const {postId} = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostDetails();
  }, []);

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

  const fetchPostDetails = async () => {
    try {
      const token = await getData('userToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPost(data);
        setComments(data.comments || []);
        setLikes(data.likes || []);
      } else {
        console.error('Error fetching post details:', data.message);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {post && (
        <>
          <View style={styles.postHeader}>
            <Image source={{uri: post.profilePhoto}} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{post.username}</Text>
              <Text style={styles.time}>{post.time}</Text>
            </View>
          </View>
          <Image
            source={{uri: `${API_URL}/uploads/${post.img}`}}
            style={styles.postImage}
            resizeMode="contain"
          />
          <Text style={styles.postText}>{post.desc}</Text>

          <View style={styles.likesSection}>
            <Text style={styles.sectionTitle}>Likes</Text>
            <FlatList
              data={likes}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <Text style={styles.likeItem}>{item.username}</Text>
              )}
            />
          </View>

          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <FlatList
              data={comments}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUser}>{item.username}:</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
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
  },
  postImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginVertical: 10,
  },
  postText: {
    fontSize: 16,
    marginBottom: 20,
  },
  likesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  likeItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  commentsSection: {
    marginBottom: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentText: {
    fontSize: 16,
  },
});

export default PostDetails;
