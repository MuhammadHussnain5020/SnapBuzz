import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {API_URL} from '../../env';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigation = useNavigation();

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: email.trim()}),
      });

      if (response.ok) {
        setIsEmailVerified(true);
        Alert.alert(
          'Success',
          'Email verified, you can now reset your password',
        );
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Email not found');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'An error occurred while verifying the email');
    }
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

  return (
    <View style={styles.container}>
      {!isEmailVerified ? (
        <>
          <Text style={styles.title}>Reset Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
            <Text style={styles.buttonText}>Verify Email</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Set New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#26275B',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ForgetPassword;
