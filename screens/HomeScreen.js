import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, TextInput, Alert, Animated, ScrollView } from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ darkMode = false }) {
  const [steps, setSteps] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState('checking');
  const [stepGoal, setStepGoal] = useState(10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const progressAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pedometer subscription
  useEffect(() => {
    let subscription;

    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setPedometerAvailable(isAvailable ? 'available' : 'not available');

        if (isAvailable) {
          subscription = Pedometer.watchStepCount((result) => {
            setSteps(result.steps);
          });

          const end = new Date();
          const start = new Date();
          start.setHours(0, 0, 0, 0);
          const result = await Pedometer.getStepCountAsync(start, end);
          if (result) {
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
          setStepGoal(parsedGoal);
        }
      } catch (error) {
        console.error('Error loading step goal:', error);
      }
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Animate progress bar with bounce effect
  const stepsProgress = Math.min(steps / stepGoal, 1);
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stepsProgress * 100,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Celebrate when goal is reached
    if (stepsProgress >= 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [stepsProgress]);

  const saveNewGoal = async () => {
    const newGoalValue = parseInt(newGoal);
    if (isNaN(newGoalValue) || newGoalValue <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number for the step goal');
      return;
    }
    try {
      await AsyncStorage.setItem('stepGoal', newGoal.toString());
      setStepGoal(newGoalValue);
      setIsEditingGoal(false);
      setNewGoal('');
      Alert.alert('Success', `Step goal updated to ${newGoalValue.toLocaleString()} steps! 🎯`);
    } catch (error) {
      console.error('Error saving step goal:', error);
      Alert.alert('Error', 'Failed to save step goal');
    }
  };

  const getMotivationMessage = () => {
    const percentage = (steps / stepGoal) * 100;
    if (percentage >= 100) return "🎉 Goal crushed! You're amazing!";
    if (percentage >= 75) return "🔥 Almost there! Keep pushing!";
    if (percentage >= 50) return "💪 Halfway there! You've got this!";
    if (percentage >= 25) return "🚀 Great start! Keep moving!";
    return "👟 Every step counts! Let's go!";
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: darkMode ? '#0A0A0A' : '#F8F9FA',
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 24,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: darkMode ? 1 : 0,
    borderColor: darkMode ? '#333' : 'transparent',
  };

  const progressColor = stepsProgress >= 1 ? '#00D4AA' : (darkMode ? '#007AFF' : '#007AFF');
  const trackColor = darkMode ? '#2C2C2E' : '#E5E5EA';

  return (
    <SafeAreaView style={containerStyle}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 10,
          }}>
            <Text style={{
              fontSize: 32,
              fontWeight: '800',
              color: darkMode ? '#FFFFFF' : '#1C1C1E',
              marginBottom: 4,
            }}>
              Today's Steps
            </Text>
            <Text style={{
              fontSize: 16,
              color: darkMode ? '#8E8E93' : '#6D6D70',
              fontWeight: '500',
            }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Main Steps Card */}
          <Animated.View style={[cardStyle, { transform: [{ scale: scaleAnim }] }]}>
            <View style={{ alignItems: 'center' }}>
              {/* Steps Display */}
              <View style={{
                alignItems: 'center',
                marginBottom: 30,
              }}>
                <Text style={{
                  fontSize: 64,
                  fontWeight: '900',
                  color: progressColor,
                  marginBottom: 8,
                  letterSpacing: -2,
                }}>
                  {steps.toLocaleString()}
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                }}>
                  steps
                </Text>
              </View>

              {/* Progress Ring */}
              <View style={{
                width: 200,
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 30,
              }}>
                <View style={{
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 12,
                  borderColor: trackColor,
                }} />
                <Animated.View style={{
                  position: 'absolute',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 12,
                  borderColor: progressColor,
                  borderRightColor: 'transparent',
                  borderBottomColor: 'transparent',
                  transform: [{
                    rotate: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }} />
                <View style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: '800',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 4,
                  }}>
                    {Math.round(stepsProgress * 100)}%
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                  }}>
                    of goal
                  </Text>
                </View>
              </View>

              {/* Goal Info */}
              <View style={{
                backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 20,
                marginBottom: 20,
                alignSelf: 'stretch',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Ionicons 
                    name="flag" 
                    size={20} 
                    color={darkMode ? '#007AFF' : '#007AFF'} 
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  }}>
                    Goal: {stepGoal.toLocaleString()} steps
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: progressColor,
                  textAlign: 'center',
                }}>
                  {getMotivationMessage()}
                </Text>
              </View>

              {/* Edit Goal Section */}
              {isEditingGoal ? (
                <View style={{
                  alignSelf: 'stretch',
                  backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 16,
                  padding: 20,
                }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}>
                    Set New Goal
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF',
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      fontSize: 18,
                      fontWeight: '600',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      textAlign: 'center',
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: darkMode ? '#007AFF' : '#007AFF',
                    }}
                    placeholder="Enter new goal"
                    value={newGoal}
                    onChangeText={(text) => setNewGoal(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
                  />
                  <View style={{
                    flexDirection: 'row',
                    gap: 12,
                  }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: '#34C759',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center',
                      }}
                      onPress={saveNewGoal}
                    >
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                        Save Goal
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: darkMode ? '#48484A' : '#8E8E93',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        setIsEditingGoal(false);
                        setNewGoal('');
                      }}
                    >
                      <Text style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontWeight: '700',
                      }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderColor: darkMode ? '#007AFF' : '#007AFF',
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    alignSelf: 'stretch',
                    alignItems: 'center',
                  }}
                  onPress={() => setIsEditingGoal(true)}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons 
                      name="settings" 
                      size={20} 
                      color={darkMode ? '#007AFF' : '#007AFF'} 
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: darkMode ? '#007AFF' : '#007AFF',
                    }}>
                      Change Goal
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Stats Cards */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            gap: 12,
            marginBottom: 20,
          }}>
            <View style={[cardStyle, { 
              flex: 1, 
              margin: 0,
              padding: 20,
            }]}>
              <View style={{
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="flame" 
                  size={24} 
                  color="#FF6B35" 
                  style={{ marginBottom: 8 }}
                />
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 4,
                }}>
                  {Math.round(steps * 0.04)}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                  textAlign: 'center',
                }}>
                  Calories
                </Text>
              </View>
            </View>
            <View style={[cardStyle, { 
              flex: 1, 
              margin: 0,
              padding: 20,
            }]}>
              <View style={{
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="walk" 
                  size={24} 
                  color="#30D158" 
                  style={{ marginBottom: 8 }}
                />
                <Text style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 4,
                }}>
                  {(steps * 0.0008).toFixed(1)}
                </Text>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                  textAlign: 'center',
                }}>
                  Miles
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}