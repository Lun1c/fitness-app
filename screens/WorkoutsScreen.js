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
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutsScreen = () => {
  const [workouts, setWorkouts] = useState([]);
  const [workoutName, setWorkoutName] = useState('');
  const [hours, setHours] = useState('0'); // String for TextInput
  const [minutes, setMinutes] = useState('30'); // String for TextInput, default 30 minutes

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
    return `${hoursNum}h ${minutesNum}m`;
  };

  const validateDuration = (h, m) => {
    const hoursNum = parseInt(h) || 0;
    const minutesNum = parseInt(m) || 0;
    return hoursNum > 0 || minutesNum > 0;
  };

  const handleAddWorkout = () => {
    if (workoutName.trim() === '') {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    if (!validateDuration(hours, minutes)) {
      Alert.alert('Error', 'Duration must be greater than 0');
      return;
    }
    const newWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      duration: formatDuration(hours, minutes),
    };
    setWorkouts([...workouts, newWorkout]);
    setWorkoutName('');
    setHours('0');
    setMinutes('30');
    Keyboard.dismiss();
  };

  const handleDeleteWorkout = (id) => {
    setWorkouts(workouts.filter((workout) => workout.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <Text style={styles.title} accessibilityLabel="Workout Tracker Title">
          Workout Tracker
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Workout name"
          value={workoutName}
          onChangeText={setWorkoutName}
          accessibilityLabel="Workout name input"
          placeholderTextColor="#888"
        />

        <View style={styles.durationInputContainer}>
          <TextInput
            style={styles.durationInput}
            placeholder="Hours"
            keyboardType="numeric"
            value={hours}
            onChangeText={(text) => setHours(text.replace(/[^0-9]/g, ''))}
            accessibilityLabel="Hours input"
            placeholderTextColor="#888"
          />
          <Text style={styles.durationInputLabel}>h</Text>
          <TextInput
            style={styles.durationInput}
            placeholder="Minutes"
            keyboardType="numeric"
            value={minutes}
            onChangeText={(text) => setMinutes(text.replace(/[^0-9]/g, ''))}
            accessibilityLabel="Minutes input"
            placeholderTextColor="#888"
          />
          <Text style={styles.durationInputLabel}>m</Text>
        </View>

        <Text style={styles.durationText}>
          Duration: {formatDuration(hours, minutes)}
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddWorkout}
          accessibilityLabel="Add workout button"
        >
          <Text style={styles.addButtonText}>Add Workout</Text>
        </TouchableOpacity>

        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.workoutItem}>
              <Text style={styles.workoutText}>
                {item.name} - {item.duration}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteWorkout(item.id)}
                accessibilityLabel={`Delete ${item.name} workout`}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          initialNumToRender={10}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  durationInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    alignSelf: 'center',
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workoutText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutsScreen;