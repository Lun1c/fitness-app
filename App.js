import 'react-native-gesture-handler';

import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  Button,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card } from 'react-native-elements';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

const Tab = createBottomTabNavigator();

function Header({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
}

function HomeScreen() {
  const stepsProgress = 3000 / 10000;

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
          <Text style={styles.value}>3,000</Text>
          <Text style={styles.label}>Goal: 10,000 steps</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${stepsProgress * 100}%` }]} />
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
      {showCamera ? (
        <Camera
          style={styles.camera}
          ref={(ref) => setCameraRef(ref)}
          type={Camera.Constants.Type.back}
        >
          <View style={styles.cameraControls}>
            <Button title="Snap" onPress={takePhoto} />
            <Button title="Cancel" onPress={() => setShowCamera(false)} />
          </View>
        </Camera>
      ) : (
        <View style={styles.content}>
          <Button
            title="Take a Photo of Your Meal"
            onPress={() => setShowCamera(true)}
          />
          {photoUri && (
            <>
              <Text style={styles.photoLabel}>Last photo taken:</Text>
              <Image source={{ uri: photoUri }} style={styles.imagePreview} />
            </>
          )}
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

  const handleAddWorkout = () => {
    if (!workoutName.trim() || !duration.trim()) return;

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
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Workouts" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, padding: 20 }}
      >
        <Text style={styles.sectionTitle}>➕ Add New Workout</Text>
        <TextInput
          style={styles.input}
          placeholder="Workout Name (e.g. Running)"
          value={workoutName}
          onChangeText={setWorkoutName}
        />
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g. 30 min)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <View style={styles.addButton}>
          <Button title="Add Workout" onPress={handleAddWorkout} />
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
                <Text style={styles.workoutTitle}>
                  {item.name} ({item.duration})
                </Text>
                {item.notes ? (
                  <Text style={styles.workoutNotes}>{item.notes}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>
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
    backgroundColor: '#e0e0e0',
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
    backgroundColor: '#d3d3d3',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#ff0000',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cameraControls: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  addButton: {
    marginBottom: 20,
  },
  workoutItem: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutNotes: {
    marginTop: 4,
    color: '#555',
    fontSize: 14,
  },
  placeholderText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
    marginTop: 10,
  },
});
