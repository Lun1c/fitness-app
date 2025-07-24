import React, { useState, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import styles from '../styles/styles';

export default function FoodScreen({ darkMode }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraType, setCameraType] = useState(null); // back or front
  const cameraRef = useRef(null);

  // Request permissions on tab focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        const mediaStatus = await MediaLibrary.requestPermissionsAsync();

        if (isActive) {
          const granted =
            cameraStatus.status === 'granted' &&
            mediaStatus.status === 'granted';
          setHasCameraPermission(granted);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const openCamera = async () => {
    // Ensure Camera.Constants is defined before using it
    if (!Camera?.Constants?.Type?.back) {
      alert('Camera module not loaded yet. Please try again.');
      return;
    }

    setCameraType(Camera.Constants.Type.back);
    setCameraVisible(true);
    setPhoto(null);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync();
      setPhoto(data.uri);
      await MediaLibrary.saveToLibraryAsync(data.uri);
      setCameraVisible(false);
    }
  };

  if (hasCameraPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>No access to camera</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        darkMode ? styles.containerDark : styles.containerLight,
      ]}
    >
      <Header title="Food" darkMode={darkMode} />
      <View style={styles.content}>
        <Text style={darkMode ? styles.textLight : styles.textDark}>
          Tap below to open the camera and log your food.
        </Text>

        {!cameraVisible && (
          <TouchableOpacity style={customStyles.button} onPress={openCamera}>
            <Text style={customStyles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
        )}

        {cameraVisible && cameraType && (
          <>
            <Camera
              style={{ width: '100%', height: 300, marginVertical: 10 }}
              type={cameraType}
              ref={cameraRef}
            />
            <TouchableOpacity style={customStyles.button} onPress={takePhoto}>
              <Text style={customStyles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </>
        )}

        {photo && (
          <Image source={{ uri: photo }} style={customStyles.preview} />
        )}
      </View>
    </SafeAreaView>
  );
}

const customStyles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
});
