import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import useFetchUserData from '../hooks/useFectchUserData';
import {API_URL} from '../../env';

const response = `${API_URL}/api/user`; // Replace with your API URL

const getData = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error('Error fetching data from AsyncStorage:', error);
    return null;
  }
};

const Profile = ({navigation}) => {
  const {userData, loading} = useFetchUserData();
  const [profileImageUri, setProfileImageUri] = useState(null);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (userData && !loading) {
      fetchUserPosts();
    }
  }, [userData, loading]);

  const fetchUserPosts = async () => {
    try {
      const token = await getData('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/posts/${userData._id}/posts`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const posts = await response.json();
      if (response.ok) {
        setUserPosts(posts);
      } else {
        console.error('Error fetching user posts:', posts.message);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Option',
      'Choose an option to select an image',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({mediaType: 'photo'}, async response => {
              if (response.didCancel) {
                console.log('User cancelled image picker');
              } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
              } else {
                const uri = response.assets[0]?.uri;
                if (typeof uri === 'string') {
                  setProfileImageUri(uri);
                  try {
                    const token = await getData('userToken');
                    if (!token) {
                      Alert.alert('Error', 'No token found');
                      return;
                    }

                    const formData = new FormData();
                    formData.append('profilePhoto', {
                      uri: profileImageUri,
                      type: 'image/jpeg',
                      name: 'profile.jpg',
                    });

                    await axios.patch(`${API_URL}/api/user/me`, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                      },
                    });
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    Alert.alert('Error', 'Failed to upload image');
                  }
                } else {
                  console.error('URI is not a string:', uri);
                }
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({mediaType: 'photo'}, async response => {
              if (response.didCancel) {
                console.log('User cancelled image picker');
              } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
              } else {
                const uri = response.assets[0]?.uri;
                if (typeof uri === 'string') {
                  setProfileImageUri(uri);
                  try {
                    const token = await getData('userToken');
                    if (!token) {
                      Alert.alert('Error', 'No token found');
                      return;
                    }

                    const formData = new FormData();
                    formData.append('profilePhoto', {
                      uri: uri,
                      type: 'image/jpeg',
                      name: 'profile.jpg',
                    });

                    await axios.patch(`${API_URL}/api/user/me`, formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                      },
                    });
                  } catch (error) {
                    console.error('Error uploading image:', error);
                    Alert.alert('Error', 'Failed to upload image');
                  }
                } else {
                  console.error('URI is not a string:', uri);
                }
              }
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const isValidUri = uri => uri && uri.startsWith('http');

  

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.FirstContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Setting');
              }}>
              <Icon
                name="settings-outline"
                size={30}
                color="#000"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.profileImageContainer}>
          <Image
            style={styles.profileImage}
            source={
              profileImageUri
                ? {uri: profileImageUri}
                : isValidUri(userData.profilePhoto)
                ? {uri: userData.profilePhoto}
                : require('../../assets/images/images.png') // Fallback image
            }
          />
          <TouchableOpacity
            onPress={handleImagePicker}
            style={styles.editIconContainer}>
            <Icon name="camera-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{userData.name}</Text>
        <Text style={styles.username}>{userData.username}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('FollowersScreen', {userId: userData._id});
              }}>
              <Text style={styles.statValue}>
                {userData.followers?.length || 0}
              </Text>
            </TouchableOpacity>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{userPosts.length || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('FollowingScreen', {userId: userData._id});
              }}>
              <Text style={styles.statValue}>
                {userData.following?.length || 0}
              </Text>
            </TouchableOpacity>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => {
              navigation.navigate('Messages');
            }}>
            <Icon name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity> */}
        </View>
      </View>
      <View style={styles.scrollContainer}>
        {userPosts.length ? (
          userPosts.map(post => (
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
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 140,
    backgroundColor: '#fff',
    padding:20
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    left: 10,
    bottom: 1,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  icon: {
    marginHorizontal: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode:'cover'
  },
  editIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    padding: 5,
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#26275B',
    padding: 10,
    borderRadius: 5,
  },
  messageButtonText: {
    marginLeft: 5,
    color: '#fff',
    textAlign: 'center',
    bottom: 2.5,
  },

  scrollContainer: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginHorizontal: -5,
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

export default Profile;
