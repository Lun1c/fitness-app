import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  FlatList,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  Animated,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const WorkoutsScreen = ({ darkMode = false }) => {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [showAddForm, setShowAddForm] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-50))[0];

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load workouts from AsyncStorage on mount
  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const savedWorkouts = await AsyncStorage.getItem('workouts');
        if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };
    loadWorkouts();
  }, []);

  // Save workouts to AsyncStorage whenever they change
  useEffect(() => {
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      } catch (error) {
        console.error('Error saving workouts:', error);
      }
    };
    if (workouts.length > 0) saveWorkouts();
  }, [workouts]);

  const formatDuration = (h, m) => {
    const hoursNum = parseInt(h) || 0;
    const minutesNum = parseInt(m) || 0;
    if (hoursNum > 0 && minutesNum > 0) {
      return `${hoursNum}h ${minutesNum}m`;
    } else if (hoursNum > 0) {
      return `${hoursNum}h`;
    } else {
      return `${minutesNum}m`;
    }
  };

  const validateDuration = (h, m) => {
    const hoursNum = parseInt(h) || 0;
    const minutesNum = parseInt(m) || 0;
    return hoursNum > 0 || minutesNum > 0;
  };

  const handleAddWorkout = () => {
    if (workoutName.trim() === '') {
      Alert.alert('Oops! 🤔', 'Please enter a workout name');
      return;
    }
    if (!validateDuration(hours, minutes)) {
      Alert.alert('Oops! ⏰', 'Duration must be greater than 0');
      return;
    }
    const newWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      duration: formatDuration(hours, minutes),
      date: new Date().toLocaleDateString(),
      totalMinutes: (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0),
    };
    setWorkouts([newWorkout, ...workouts]);
    setWorkoutName('');
    setHours('0');
    setMinutes('30');
    setShowAddForm(false);
    Keyboard.dismiss();
    Alert.alert('Success! 🎉', `${workoutName} workout added!`);
  };

  const handleDeleteWorkout = (id, name) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setWorkouts(workouts.filter((workout) => workout.id !== id))
        },
      ]
    );
  };

  const getTotalWorkoutTime = () => {
    const totalMinutes = workouts.reduce((sum, workout) => sum + workout.totalMinutes, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  };

  const getWorkoutIcon = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('run') || lowercaseName.includes('jog')) return 'walk';
    if (lowercaseName.includes('bike') || lowercaseName.includes('cycling')) return 'bicycle';
    if (lowercaseName.includes('swim')) return 'water';
    if (lowercaseName.includes('yoga') || lowercaseName.includes('stretch')) return 'leaf';
    if (lowercaseName.includes('weight') || lowercaseName.includes('strength')) return 'barbell';
    if (lowercaseName.includes('cardio') || lowercaseName.includes('hiit')) return 'heart';
    return 'fitness';
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: darkMode ? '#0A0A0A' : '#F8F9FA',
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: darkMode ? 1 : 0,
    borderColor: darkMode ? '#333' : 'transparent',
  };

  const totalStats = getTotalWorkoutTime();

  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ 
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}>
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
              Workouts
            </Text>
            <Text style={{
              fontSize: 16,
              color: darkMode ? '#8E8E93' : '#6D6D70',
              fontWeight: '500',
            }}>
              Track your fitness journey
            </Text>
          </View>

          {/* Stats Card */}
          {workouts.length > 0 && (
            <View style={[cardStyle, { marginBottom: 0 }]}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: '#FF6B35',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <Ionicons name="flame" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 2,
                  }}>
                    {workouts.length}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                  }}>
                    Workouts
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: '#30D158',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <Ionicons name="time" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 2,
                  }}>
                    {totalStats.hours > 0 ? `${totalStats.hours}h` : `${totalStats.minutes}m`}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                  }}>
                    Total Time
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: '#007AFF',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <Ionicons name="trophy" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 2,
                  }}>
                    {Math.round(totalStats.totalMinutes * 5)}
                  </Text>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                  }}>
                    Calories
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Add Workout Button */}
          <TouchableOpacity
            style={[cardStyle, {
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              backgroundColor: darkMode ? '#007AFF' : '#007AFF',
            }]}
            onPress={() => setShowAddForm(true)}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: '#FFFFFF',
              }}>
                Add New Workout
              </Text>
            </View>
          </TouchableOpacity>

          {/* Add Workout Form */}
          {showAddForm && (
            <View style={[cardStyle, { marginTop: 0 }]}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                }}>
                  New Workout
                </Text>
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons 
                    name="close-circle" 
                    size={24} 
                    color={darkMode ? '#8E8E93' : '#8E8E93'} 
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                style={{
                  backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  fontSize: 16,
                  fontWeight: '500',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 16,
                }}
                placeholder="Workout name (e.g., Morning Run)"
                value={workoutName}
                onChangeText={setWorkoutName}
                placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
              />

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                justifyContent: 'center',
              }}>
                <View style={{ alignItems: 'center', marginRight: 20 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                    marginBottom: 8,
                  }}>
                    Hours
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      fontSize: 18,
                      fontWeight: '600',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      textAlign: 'center',
                      width: 80,
                    }}
                    keyboardType="numeric"
                    value={hours}
                    onChangeText={(text) => setHours(text.replace(/[^0-9]/g, ''))}
                    placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
                  />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                    marginBottom: 8,
                  }}>
                    Minutes
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                      borderRadius: 12,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      fontSize: 18,
                      fontWeight: '600',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      textAlign: 'center',
                      width: 80,
                    }}
                    keyboardType="numeric"
                    value={minutes}
                    onChangeText={(text) => setMinutes(text.replace(/[^0-9]/g, ''))}
                    placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
                  />
                </View>
              </View>

              <View style={{
                backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                borderRadius: 12,
                paddingVertical: 12,
                marginBottom: 20,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                }}>
                  Duration: {formatDuration(hours, minutes)}
                </Text>
              </View>

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
                  onPress={handleAddWorkout}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '700',
                  }}>
                    Add Workout
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
                    setShowAddForm(false);
                    setWorkoutName('');
                    setHours('0');
                    setMinutes('30');
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
          )}

          {/* Workouts List */}
          <FlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={() => (
              <View style={[cardStyle, {
                alignItems: 'center',
                paddingVertical: 40,
              }]}>
                <View style={{
                  backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Ionicons 
                    name="fitness" 
                    size={28} 
                    color={darkMode ? '#8E8E93' : '#6D6D70'} 
                  />
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  No workouts yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  Add your first workout to start{'\n'}tracking your fitness journey!
                </Text>
              </View>
            )}
            renderItem={({ item, index }) => (
              <Animated.View
                style={[cardStyle, {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, index * 10],
                    })
                  }]
                }]}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: '#007AFF',
                      borderRadius: 16,
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      <Ionicons 
                        name={getWorkoutIcon(item.name)} 
                        size={16} 
                        color="#FFFFFF" 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: darkMode ? '#FFFFFF' : '#1C1C1E',
                        marginBottom: 4,
                      }}>
                        {item.name}
                      </Text>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Ionicons 
                          name="time-outline" 
                          size={14} 
                          color={darkMode ? '#8E8E93' : '#6D6D70'} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: darkMode ? '#8E8E93' : '#6D6D70',
                          marginRight: 16,
                        }}>
                          {item.duration}
                        </Text>
                        <Ionicons 
                          name="calendar-outline" 
                          size={14} 
                          color={darkMode ? '#8E8E93' : '#6D6D70'} 
                          style={{ marginRight: 4 }}
                        />
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: darkMode ? '#8E8E93' : '#6D6D70',
                        }}>
                          {item.date}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#FF3B30',
                      borderRadius: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                    onPress={() => handleDeleteWorkout(item.id, item.name)}
                  >
                    <Ionicons name="trash" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
            initialNumToRender={10}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WorkoutsScreen;