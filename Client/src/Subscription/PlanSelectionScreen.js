import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStripe} from '@stripe/stripe-react-native';
import {API_URL} from '../../env';
import LinearGradient from 'react-native-linear-gradient';

const PlanSelectionScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const [subscriptionId, setSubscriptionId] = useState(null);

  const handlePlanSelection = async (plan, priceId) => {
    setSelectedPlan(plan);

    if (plan !== 'Not selected yet!') {
      try {
        const {clientSecret, subscriptionId} = await fetchPaymentIntent(
          priceId,
        );
        setSubscriptionId(subscriptionId);

        const {error} = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Muhammad Hussnain',
        });

        if (error) {
          Alert.alert('Error', error.message);
          return;
        }

        const {error: paymentError} = await presentPaymentSheet();

        if (paymentError) {
          Alert.alert('Error', paymentError.message);
        } else {
          await finalizePlanSelection(plan, priceId, subscriptionId);
        }
      } catch (err) {
        Alert.alert('Error', 'Something went wrong during payment.');
      }
    } else {
      await finalizePlanSelection(plan, priceId, null);
    }
  };

  const fetchPaymentIntent = async priceId => {
    try {
      const response = await fetch(
        `${API_URL}/api/subscription/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
          },
          body: JSON.stringify({priceId}),
        },
      );

      const {clientSecret, subscriptionId} = await response.json();
      return {clientSecret, subscriptionId};
    } catch (err) {
      console.log('Error fetching payment intent:', err);
      throw err;
    }
  };

  const finalizePlanSelection = async (plan, priceId, subscriptionId) => {
    try {
      const response = await fetch(`${API_URL}/api/subscription/save-plan`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await AsyncStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({plan, priceId, subscriptionId}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save plan');
      }

      await AsyncStorage.setItem('userPlan', plan);

      Alert.alert('Plan Selected', `You have selected the ${plan} plan.`);
      navigation.navigate('AppNavigator');
    } catch (error) {
      console.log('Error saving plan:', error);
      Alert.alert('Error', 'Failed to save the selected plan.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Plan</Text>

      <TouchableOpacity
        style={styles.planContainer}
        onPress={() =>
          handlePlanSelection('Basic', 'price_1PxpJ6Ejq94yXjk5SUq0fLS3')
        }>
        <LinearGradient colors={['#3ECF8E', '#0D699A']} style={styles.planCard}>
          <Text style={styles.planTitle}>Weekly</Text>
          <Text style={styles.planPrice}>$2.00 / Weekly</Text>
          <Text style={styles.planFeatures}>
            24/7 Support, Databases Download
          </Text>
          <Text style={styles.buyButton}>Buy</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.planContainer}
        onPress={() =>
          handlePlanSelection('Standard', 'price_1PxpLbEjq94yXjk59cvPdARL')
        }>
        <LinearGradient colors={['#6A5BF7', '#3A347E']} style={styles.planCard}>
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>$8.00 / Month</Text>
          <Text style={styles.planFeatures}>
            24/7 Support, Databases Download, Maintenance Email
          </Text>
          <Text style={styles.buyButton}>Buy</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.planContainer}
        onPress={() =>
          handlePlanSelection('Premium', 'price_1PxpHyEjq94yXjk5sLvZEWbT')
        }>
        <LinearGradient colors={['#FF8960', '#FF62A5']} style={styles.planCard}>
          <Text style={styles.planTitle}>Yearly</Text>
          <Text style={styles.planPrice}>$50.00 / yearly</Text>
          <Text style={styles.planFeatures}>
            24/7 Support, Databases Download, Unlimited Traffic
          </Text>
          <Text style={styles.buyButton}>Buy</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  planContainer: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  planCard: {
    padding: 20,
    borderRadius: 10,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  planFeatures: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 15,
  },
  buyButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    backgroundColor: '#00000080',
    paddingVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default PlanSelectionScreen;
