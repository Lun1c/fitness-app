import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card } from 'react-native-elements';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Pedometer } from 'expo-sensors';

const Tab = createBottomTabNavigator();

function Header({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}

function HomeScreen() {
  const [steps, setSteps] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState('checking');
  const stepGoal = 10000;

  useEffect(() => {
    let subscription;

    const subscribe = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      setPedometerAvailable(isAvailable ? 'available' : 'not available');

      if (!isAvailable) return;

      subscription = Pedometer.watchStepCount((result) => {
        setSteps(result.steps);
      });

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      setSteps(result.steps);
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  const stepsProgress = Math.min(steps / stepGoal, 1);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Home" />

      <Card containerStyle={styles.card}>
        <Text style={styles.sectionTitle}>Calories</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>1,000</Text>
          <Text style={styles.label}>Remaining</Text>
        </View>
        <View style={styles.subValues}>
          <View style={styles.subValue}>
            <Text style={styles.subLabel}>Goal</Text>
            <Text style={styles.subValueText}>1,960</Text>
          </View>
          <View style={styles.subValue}>
            <Text style={styles.subLabel}>Food</Text>
            <Text style={styles.subValueText}>0</Text>
          </View>
          <View style={styles.subValue}>
            <Text style={styles.subLabel}>Exercise</Text>
            <Text style={styles.subValueText}>0</Text>
          </View>
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Text style={styles.sectionTitle}>Steps</Text>
        <View style={styles.valueContainer}>
          {pedometerAvailable === 'available' ? (
            <>
              <Text style={styles.value}>{steps}</Text>
              <Text style={styles.label}>Goal: {stepGoal} steps</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: `${stepsProgress * 100}%` }]} />
              </View>
            </>
          ) : (
            <Text style={styles.label}>Pedometer not available</Text>
          )}
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.label}>Weight Loss</Text>
          <Text style={styles.subValueText}>Last 90 Days...</Text>
        </View>
      </Card>
    </SafeAreaView>
  );
}

function FoodScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && mediaStatus === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setPhotoUri(photo.uri);
      await MediaLibrary.saveToLibraryAsync(photo.uri);
      setShowCamera(false);
    }
  };

  if (hasPermission === null) return <Text>Requesting permissions...</Text>;
  if (!hasPermission) return <Text>No access to camera or media library</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Food" />
      <View style={styles.content}>
        <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.takePhotoButton}>
          <Text style={styles.takePhotoText}>📸 Take a Photo of Your Meal</Text>
        </TouchableOpacity>

        {photoUri && (
          <>
            <Text style={styles.photoLabel}>Last photo taken:</Text>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} />
          </>
        )}
      </View>

      {showCamera && (
        <View style={styles.cameraOverlay}>
          <Camera
            style={styles.camera}
            ref={(ref) => setCameraRef(ref)}
            type={Camera?.Constants?.Type?.back ?? 0}
          >
            <View style={styles.cameraControls}>
              <TouchableOpacity onPress={takePhoto} style={styles.snapButton}>
                <Text style={styles.snapText}>Snap</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cancelButton}>
                <Text style={styles.snapText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      )}
    </SafeAreaView>
  );
}

function WorkoutsScreen() {
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
    <SafeAreaView style={styles.container}>
      <Header title="Workouts" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, padding: 20 }}>
          <Text style={styles.sectionTitle}>➕ Add New Workout</Text>
          <TextInput
            style={styles.input}
            placeholder="Workout Name"
            placeholderTextColor="#aaa"
            value={workoutName}
            onChangeText={setWorkoutName}
          />
          <TextInput
            style={styles.input}
            placeholder="Duration"
            placeholderTextColor="#aaa"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Notes (optional)"
            placeholderTextColor="#aaa"
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

          <Text style={styles.sectionTitle}>📋 Logged Workouts</Text>
          {workouts.length === 0 ? (
            <Text style={styles.placeholderText}>No workouts logged yet.</Text>
          ) : (
            <FlatList
              data={workouts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.workoutItem}>
                  <Text style={styles.workoutTitle}>{item.name} ({item.duration})</Text>
                  {item.notes ? <Text style={styles.workoutNotes}>{item.notes}</Text> : null}
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

function OtherScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Other" />
      <Text style={styles.screenContent}>Other tools and settings.</Text>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Food" component={FoodScreen} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} />
        <Tab.Screen name="Other" component={OtherScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#ADD8E6',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  screenContent: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  card: {
    margin: 10,
    borderRadius: 10,
    backgroundColor: '#E0F7FF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  subValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  subValue: {
    alignItems: 'center',
  },
  subLabel: {
    fontSize: 14,
    color: '#666',
  },
  subValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#C0E8FF',
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progress: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginTop: 20,
    borderRadius: 10,
  },
  photoLabel: {
    fontSize: 16,
    marginTop: 20,
  },
  takePhotoButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
  },
  takePhotoText: {
    color: 'white',
    fontSize: 16,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  snapButton: {
    backgroundColor: '#00cc00',
    padding: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 10,
  },
  snapText: {
    color: 'white',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  addButton: {
    marginBottom: 20,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
  },
  workoutItem: {
    backgroundColor: '#DFF6FF',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  workoutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  workoutNotes: {
    fontStyle: 'italic',
    color: '#444',
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});
