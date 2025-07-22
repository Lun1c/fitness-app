// screens/WorkoutsScreen.js
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
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import styles from '../styles/styles';

export default function WorkoutsScreen({ darkMode }) {
  const [workoutName, setWorkoutName] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const saved = await AsyncStorage.getItem('workouts');
        if (saved) setWorkouts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load workouts', e);
      }
    };
    loadWorkouts();
  }, []);

  useEffect(() => {
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      } catch (e) {
        console.error('Failed to save workouts', e);
      }
    };
    saveWorkouts();
  }, [workouts]);

  const handleAddWorkout = () => {
    if (!workoutName.trim() || !duration.trim()) {
      setError('Please enter both workout name and duration.');
      return;
    }

    const newWorkout = {
      id: Date.now().toString(),
      name: workoutName,
      duration,
      notes,
    };

    setWorkouts([newWorkout, ...workouts]);
    setWorkoutName('');
    setDuration('');
    setNotes('');
    setError('');
    Keyboard.dismiss();
  };

  const handleClearWorkouts = () => {
    setWorkouts([]);
    setError('');
  };

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <Header title="Workouts" darkMode={darkMode} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 20 }}>
          <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>➕ Add New Workout</Text>
          <TextInput
            style={[styles.input, darkMode ? styles.inputDark : styles.inputLight]}
            placeholder="Workout Name"
            placeholderTextColor={darkMode ? '#ccc' : '#aaa'}
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          <TextInput
            style={[styles.input, darkMode ? styles.inputDark : styles.inputLight]}
            placeholder="Duration"
            placeholderTextColor={darkMode ? '#ccc' : '#aaa'}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }, darkMode ? styles.inputDark : styles.inputLight]}
            placeholder="Notes (optional)"
            placeholderTextColor={darkMode ? '#ccc' : '#aaa'}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.addButton}>
            <TouchableOpacity onPress={handleAddWorkout} style={styles.snapButton}>
              <Text style={styles.snapText}>Add Workout</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>📋 Logged Workouts</Text>
          {workouts.length === 0 ? (
            <Text style={[styles.placeholderText, darkMode ? styles.textLight : styles.textDark]}>No workouts logged yet.</Text>
          ) : (
            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={[styles.workoutItem, darkMode ? styles.workoutItemDark : styles.workoutItemLight]}>
                  <Text style={[styles.workoutTitle, darkMode ? styles.textLight : styles.textDark]}>
                    {item.name} ({item.duration})
                  </Text>
                  {item.notes ? (
                    <Text style={[styles.workoutNotes, darkMode ? styles.textLight : styles.textDark]}>{item.notes}</Text>
                  ) : null}
                </View>
              )}
            />
          )}
          {workouts.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <TouchableOpacity onPress={handleClearWorkouts} style={[styles.cancelButton, { alignItems: 'center' }]}>
                <Text style={styles.snapText}>Clear Workouts</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
