import 'react-native-gesture-handler'; // Ensure this is at the top of your entry file
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Import the icon library
import Home from '../MainScreens/Home';
import Messages from '../MainScreens/Message';
import Notifications from '../MainScreens/Notifications';
import Profile from '../MainScreens/Profile';
import Add from '../MainScreens/Add';
import Logout from '../register/Logout';
import ChatScreen from '../MainScreens/ChatScreen';
import CommentComponent from '../components/CommentComponent';
import Setting from '../side_components/Setting';
import PostDetails from '../MainScreens/PostDetails';
import FollowersScreen from '../side_components/FollowersScreen';
import FollowerProfileScreen from '../side_components/FollowerProfileScreen';
import FollowingScreen from '../side_components/FollowingScreen';

// Create the Stack and Bottom Tab Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({color, size}) => {
        let iconName;
        const iconSize = route.name === 'Add' ? 60 : size; // Larger size for 'Add' icon

        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Messages') {
          iconName = 'chatbubble';
        } else if (route.name === 'Add') {
          iconName = 'add-circle';
        } else if (route.name === 'Notifications') {
          iconName = 'notifications';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        // Return the appropriate icon component
        return route.name === 'Add' ? (
          <Ionicons
            name={iconName}
            size={iconSize}
            color="#26275B"
            style={{
              backgroundColor: 'white',
              borderRadius: iconSize / 2,
              position: 'absolute',
              bottom: 10, // Adjust this value to position the icon vertically
              zIndex: 1, // Ensure the icon is above other elements
            }}
          />
        ) : (
          <Ionicons name={iconName} size={size} color={color} />
        );
      },
      tabBarStyle: {
        backgroundColor: 'red', // Background color of the bottom tab bar
        height: 70, // Increase the height to accommodate the overlapping icon
        paddingBottom: 10, // Adjust padding to fit the icon properly
      },
      tabBarActiveTintColor: '#26275B', // Color of the icon when pressed
      tabBarInactiveTintColor: 'white',
    })}>
    <Tab.Screen name="Home" component={Home} />
    <Tab.Screen name="Messages" component={Messages} />
    <Tab.Screen name="Add" component={Add} />
    <Tab.Screen name="Notifications" component={Notifications} />
    <Tab.Screen name="Profile" component={Profile} options = {{headerShown : false}} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="BottomTabNavigator">
      <Stack.Screen
        name="BottomTabNavigator"
        component={BottomTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CommentComponent"
        component={CommentComponent}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Logout" component={Logout} />
      <Stack.Screen name="PostDetails" component={PostDetails} />
      <Stack.Screen
        name="FollowersScreen"
        component={FollowersScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FollowingScreen"
        component={FollowingScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="FollowerProfileScreen"
        component={FollowerProfileScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
