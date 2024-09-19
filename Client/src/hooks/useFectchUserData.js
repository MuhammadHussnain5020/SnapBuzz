import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../env';

const respose =
  `${API_URL}/api/user`;

const useFetchUserData = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getToken();
        console.log('Using token:', token); // Debug log
        const response = await axios.get(`${respose}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User data response:', response.data); // Debug log
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading };
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Retrieved token:', token); // Debug log
    if (token === null) throw new Error('Token not found');
    return token;
  } catch (e) {
    console.error('Error reading token:', e);
    throw e;
  }
};

export default useFetchUserData;
