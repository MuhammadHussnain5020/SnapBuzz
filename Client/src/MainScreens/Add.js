import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Alert,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import useFetchUserData from '../hooks/useFectchUserData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../env';

const Add = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const {userData} = useFetchUserData();

  const openCameraAndGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('Image picker error: ', response.errorMessage);
      } else {
        setImage(response.assets[0]);
      }
    });
  };

  const handleUploadPost = async () => {
    if (!description || !image) {
      Alert.alert('Error', 'Please add a description and an image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userId', userData._id);
      formData.append('username', userData.username);
      formData.append('profilePhoto', userData.profilePhoto);
      formData.append('desc', description);
      formData.append('img', {
        uri: image.uri,
        name: image.fileName || 'image.jpg',
        type: image.type,
      });

      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post upload response:', response.data);
      Alert.alert('Success', 'Your post has been uploaded!');

      setDescription('');
      setImage(null);

      navigation.navigate('Home', {
        newPost: response.data,
      });
    } catch (error) {
      console.error('Error uploading post:', error);
      Alert.alert('Error', 'Failed to upload post');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{padding: 20}}>
        <Text style={{fontSize: 18, marginBottom: 10, color: '#26275B'}}>
          Add a Post
        </Text>
        <TextInput
          placeholder="Write a description..."
          value={description}
          onChangeText={setDescription}
          style={{
            height: 100,
            borderColor: 'gray',
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            textAlignVertical: 'top',
          }}
          multiline
        />
        {image && (
          <Image
            source={{uri: image.uri}}
            style={{
              width: '100%',
              height: 200,
              marginTop: 10,
              borderRadius: 20,
            }}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={openCameraAndGallery}>
          <Icon name="image" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Choose Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUploadPost}>
          <Icon name="upload" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Upload Post</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', // Arrange icon and text in a row
    backgroundColor: '#26275B',
    marginTop: 30,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center the content
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10, // Space between icon and text
  },
});

export default Add;
