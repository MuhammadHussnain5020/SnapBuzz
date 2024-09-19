import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useFetchUserData from '../hooks/useFectchUserData'; // Ensure the hook is imported correctly
import { API_URL } from '../../env';
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

const LikeButton = ({postId, initialLikes, onLike}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const {userData, loading: userLoading} = useFetchUserData(); // Fetch user data

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (userLoading || !userData) return;

      try {
        const token = await getData('userToken');
        if (!token) {
          console.error('Token not found');
          return;
        }

        const response = await axios.get(
          `${API_URL}/api/posts/${postId}/like-status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              userId: userData._id,
            },
          },
        );

        if (response.data.liked) {
          setLiked(true);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    fetchLikeStatus();
  }, [userLoading, userData, postId]);

  const handlePress = async () => {
    if (userLoading) {
      console.log('User data is still loading');
      return;
    }

    try {
      const token = await getData('userToken');
      if (!token) {
        console.error('Token not found');
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/posts/${postId}/like`,
        {userId: userData._id}, // Include the user ID
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token if your backend requires it
          },
        },
      );

      const newLikes = liked ? likes - 1 : likes + 1;
      setLikes(newLikes);
      setLiked(!liked);
      onLike(postId, !liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.likeButton} onPress={handlePress}>
      <Icon name={liked ? 'heart' : 'heart-o'} size={20} color="#e74c3c" />
      <Text style={styles.likeCount}>{likes}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
});

export default LikeButton;
