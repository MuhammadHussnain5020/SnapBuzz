import React, {useState, useEffect} from 'react';
import {
  Image,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_URL} from '../../env';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CommentComponent = ({route, navigation}) => {
  const {postId, userId, username, profilePhoto} = route.params;
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchComments(); // Fetch comments when the component mounts
  }, []);

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(
        `${API_URL}/api/posts/${postId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleAddComment = async () => {
    if (commentText.trim() === '') return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${API_URL}/api/posts/${postId}/comments`,
        {
          userId,
          username,
          profilePhoto,
          text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setComments(response.data); // Set the updated comments list
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleDeleteComment = async commentId => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.delete(
        `${API_URL}/api/posts/${postId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setComments(response.data); // Update the comments list after deletion
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const renderComment = ({item}) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Image source={{uri: item.profilePhoto}} style={styles.profilePhoto} />
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <View style={styles.commentBottom}>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={() => handleDeleteComment(item._id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
      </View>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity style={styles.sendIcon} onPress={handleAddComment}>
          <Icon name="send" size={24} color="#26275B" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#26275B',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#fff',
  },
  commentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: '90%',
    padding: 10,
    marginBottom: 30,
    borderRadius: 5,
  },
  commentContainer: {
    marginBottom: 10,
  },
  commentHeader: {
    paddingTop:10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  deleteIcon: {
    // marginLeft: 10,
    marginTop: 10,
  },
  commentText: {
    fontSize: 16,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 5,
    width: '80%',
    left: 30,
    top: 5,
  },
  sendIcon: {
    left: 10,
    bottom: 13,
  },
});

export default CommentComponent;
