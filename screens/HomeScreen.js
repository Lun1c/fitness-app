import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { Card } from 'react-native-elements';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/styles';

export default function HomeScreen({ darkMode = false }) {
  console.log('darkMode prop received:', darkMode);
  const [steps, setSteps] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState('checking');
  const [stepGoal, setStepGoal] = useState(10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const progressAnim = useState(new Animated.Value(0))[0];

  // Pedometer subscription
  useEffect(() => {
    let subscription;

    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerAvailable(isAvailable ? 'available' : 'not available');

        if (isAvailable) {
          subscription = Pedometer.watchStepCount((result) => {
            console.log('Pedometer step count:', result.steps); // Debug log
            setSteps(result.steps);
          });

          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const result = await Pedometer.getStepCountAsync(start, end);
          if (result) {
            console.log('Initial step count:', result.steps); // Debug log
            setSteps(result.steps);
          }
        }
      } catch (error) {
        console.error('Pedometer error:', error);
        setPedometerAvailable('error');
      }

      try {
        const savedGoal = await AsyncStorage.getItem('stepGoal');
        if (savedGoal) {
          const parsedGoal = parseInt(savedGoal) || 10000;
          console.log('Loaded step goal:', parsedGoal); // Debug log
          setStepGoal(parsedGoal);
        }
      } catch (error) {
        console.error('Error loading step goal:', error);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        console.log('Removing pedometer subscription'); // Debug log
        subscription.remove();
      }
    };
  }, []);

  // Animate progress bar
  const stepsProgress = Math.min(steps / stepGoal, 1);
  useEffect(() => {
    console.log('Animating progress to:', stepsProgress * 100); // Debug log
    Animated.timing(progressAnim, {
      toValue: stepsProgress * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [stepsProgress]);

  // Save new step goal
  const saveNewGoal = async () => {
    const newGoalValue = parseInt(newGoal);
    if (isNaN(newGoalValue) || newGoalValue <= 0) {
      console.log('Invalid step goal input:', newGoal); // Debug log
      Alert.alert('Error', 'Please enter a valid positive number for the step goal');
      return;
    }
    try {
      await AsyncStorage.setItem('stepGoal', newGoal.toString());
      console.log('Saved new step goal:', newGoalValue); // Debug log
      setStepGoal(newGoalValue);
      setIsEditingGoal(false);
      setNewGoal('');
      Alert.alert('Success', `Step goal updated to ${newGoalValue} steps`);
    } catch (error) {
      console.error('Error saving step goal:', error);
      Alert.alert('Error', 'Failed to save step goal');
    }
  };

  const progressColor = darkMode ? '#81b0ff' : '#007AFF';
  const trackColor = darkMode ? '#2D3748' : '#E5E7EB';

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <Card containerStyle={[styles.card, styles.pedometerCard, darkMode ? styles.cardDark : styles.cardLight, {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: darkMode ? 0.3 : 0.2,
        shadowRadius: 6,
        elevation: 5, // Added for Android shadow
      }]}>
        <View style={[styles.pedometerContainer, { paddingVertical: 20 }]}>
          <Text style={[styles.pedometerTitle, darkMode ? styles.textLight : styles.textDark, {
            fontSize: 20,
            fontWeight: '700',
          }]}>
            Today's Steps
          </Text>
          <Text style={[styles.pedometerSteps, darkMode ? styles.textLight : styles.textDark, {
            fontSize: 52,
            marginVertical: 15,
          }]}>
            {steps.toLocaleString()}
          </Text>
          <View style={[styles.progressBar, darkMode ? styles.progressBarDark : styles.progressBarLight, {
            height: 12,
            borderRadius: 6,
            backgroundColor: trackColor,
            marginBottom: 15,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: darkMode ? '#4B5563' : '#D1D5DB', // Subtle border for depth
          }]}>
            <Animated.View
              style={[styles.progress, {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                height: '100%',
                backgroundColor: progressColor,
                borderRadius: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3, // Added for Android shadow
              }]}
            />
          </View>
          <Text style={[styles.progressText, darkMode ? styles.textLight : styles.textDark, {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 20,
          }]}>
            {Math.round(stepsProgress * 100)}% of {stepGoal.toLocaleString()} steps
          </Text>
          {isEditingGoal ? (
            <View style={[styles.goalInputContainer, { marginTop: 10, flexDirection: 'row', alignItems: 'center' }]}>
              <TextInput
                style={[styles.goalInput, darkMode ? styles.inputDark : styles.inputLight, {
                  width: 120,
                  paddingVertical: 10,
                  fontSize: 16,
                  borderRadius: 8,
                }]}
                placeholder="Enter new goal"
                value={newGoal}
                onChangeText={(text) => setNewGoal(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholderTextColor={darkMode ? '#888' : '#aaa'}
              />
              <TouchableOpacity style={[styles.saveButton, {
                paddingVertical: 10,
                paddingHorizontal: 15,
                borderRadius: 10,
                marginLeft: 10,
              }]} onPress={saveNewGoal}>
                <Text style={[styles.saveButtonText, { fontSize: 16 }]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, {
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 10,
                  marginLeft: 10,
                }]}
                onPress={() => {
                  setIsEditingGoal(false);
                  setNewGoal('');
                }}
              >
                <Text style={[styles.cancelButtonText, { fontSize: 16 }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[styles.editButton, {
              paddingVertical: 12,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: darkMode ? '#81b0ff' : '#007AFF',
              marginTop: 10,
            }]} onPress={() => setIsEditingGoal(true)}>
              <Text style={[styles.editButtonText, darkMode ? styles.textLight : styles.textDark, {
                fontSize: 16,
                fontWeight: '600',
              }]}>
                Change Goal ({stepGoal.toLocaleString()} steps)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </SafeAreaView>
  );
}