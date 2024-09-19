import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Grid from '../../assets/svg/gird1.svg';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../../env';

const SignUp = () => {
  const navigation = useNavigation();
  const [username, setusername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            password,
            phone,
          }),
        },
      );
  
      // Log the response text for debugging
      const responseText = await response.text();
      console.log('Response Text:', responseText);
  
      const data = JSON.parse(responseText); // Attempt to parse JSON
      if (response.ok) {
        Alert.alert('Success', 'User created successfully');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Grid style={styles.grid} />
        </View>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="username"
          placeholderTextColor="white"
          value={username}
          onChangeText={setusername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="white"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            placeholderTextColor="white"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon
              username={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="white"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.options}>
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.forgotPasswordText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#26275B',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    top: 10,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    color: 'white',
    padding: 10,
    marginBottom: 20,
    borderRadius: 15,
  },
  icon: {
    marginLeft: 10,
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  buttonContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 30,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPassword: {
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SignUp;
