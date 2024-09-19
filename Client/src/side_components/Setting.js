import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {API_URL} from '../../env';

const getData = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error('Error fetching data from AsyncStorage:', error);
    return null;
  }
};

const Settings = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch current user's email when the component mounts
  useEffect(() => {
    const fetchUserEmail = async () => {
      const token = await getData('userToken');
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setCurrentUserEmail(response.data.email);
        } else {
          Alert.alert('Error', 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserEmail();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = await getData('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found');
        return;
      }

      const data = {
        username: username.trim(),
      };

      const response = await axios.patch(
        `${API_URL}/api/user/me/username`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully');
        setUsername('');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (email.trim() !== currentUserEmail) {
      Alert.alert(
        'Error',
        'The email you entered does not match your current email',
      );
      return;
    }

    setIsEmailVerified(true);
    Alert.alert('Success', 'Email verified, you can now reset your password');
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Password updated successfully');
        setNewPassword('');
        setEmail('');
        setIsEmailVerified(false);
        navigation.replace('Login');
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update password');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'An error occurred while updating the password');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      Alert.alert('Success', 'Logged out successfully');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={30} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.inputRow}>
        <Icon name="person" size={24} color="#26275B" />
        <TextInput
          style={styles.input}
          placeholder="Update Username"
          value={username}
          onChangeText={setUsername}
        />
      </View>
      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdate}
        disabled={loading}>
        <Text style={styles.updateButtonText}>
          {loading ? 'Updating...' : 'Update Username'}
        </Text>
      </TouchableOpacity>

      {/* Email Verification and Password Reset */}
      {!isEmailVerified ? (
        <>
          <View style={styles.inputRow}>
            <Icon name="mail" size={24} color="#26275B" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email to reset password"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleVerifyEmail}>
            <Text style={styles.updateButtonText}>Verify Email</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputRow}>
            <Icon name="lock-closed" size={24} color="#26275B" />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleResetPassword}
            disabled={loading}>
            <Text style={styles.updateButtonText}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="exit-outline" size={30} color="#FFF" style={styles.icon} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 10,
    left:10
  },
  updateButton: {
    backgroundColor: '#26275B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection:'row',
    justifyContent:'center',
    
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    position:'absolute',
    bottom:5,
    right:20,
    width :"100%"
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default Settings;