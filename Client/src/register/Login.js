import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Grid from '../../assets/svg/gird.svg';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_URL} from '../../env';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const trimmedEmail = email.trim().toString();
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: trimmedEmail, password}),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('userToken', data.token);

        // Fetch user plan
        const planResponse = await fetch(
          `${API_URL}/api/subscription/get-user-plan`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          },
        );

        if (planResponse.ok) {
          const planData = await planResponse.json();
          const userPlan = planData.plan;

          // Navigate based on user's plan
          if (userPlan === 'Not selected Yet!') {
            navigation.replace('PlanSelectionScreen');
          } else {
            navigation.replace('AppNavigator');
          }
        } else {
          Alert.alert('Error', 'Failed to fetch user plan');
        }
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'An error occurred during login');
      }
    } catch (error) {
      console.log(error);
    }
  };


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <View style={styles.allFields}>
        <View style={styles.logoContainer}>
          <Grid style={styles.grid} />
        </View>
        <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="white"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              placeholderTextColor="white"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={24}
                color="white"
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.options}>
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgetPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.forgotPasswordText}>
                Don't Have an Account?
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'red',
    // top:30,
  },
  logoContainer: {
    // position:"absolute",
    justifyContent: 'center',
    alignItems: 'center',
    // top:50,
    // justifyContent:"center"

  },
  grid: {
    // bottom: 30,
  },
  allFields:{
    top:50,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    // top:20,
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
    backgroundColor: '#26275B',
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

export default Login;
