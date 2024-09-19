// App.js
import 'react-native-gesture-handler'; // Ensure this is at the top of your entry file
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Login from './src/register/Login';
import AppNavigator from './src/navigations/AppNavigator';
import SignUp from './src/register/Signup';
import { createStackNavigator } from '@react-navigation/stack';
import ForgetPassword from './src/register/ForgetPassword';
import PlanSelectionScreen from './src/Subscription/PlanSelectionScreen';
import {StripeProvider} from '@stripe/stripe-react-native';
import {STRIPE_PUBLISHABLE_KEY} from './env';


const Stack = createStackNavigator();

const App = () => {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="ForgetPassword"
              component={ForgetPassword}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="PlanSelectionScreen"
              component={PlanSelectionScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="AppNavigator"
              component={AppNavigator}
              options={{headerShown: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </StripeProvider>
  );
};

export default App;
