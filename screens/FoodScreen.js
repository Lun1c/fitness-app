// screens/FoodScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import Header from '../components/Header';
import styles from '../styles/styles';

export default function FoodScreen({ darkMode }) {
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
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <Header title="Food" darkMode={darkMode} />
      <View style={styles.content}>
        <TouchableOpacity onPress={() => setShowCamera(true)} style={styles.takePhotoButton}>
          <Text style={styles.takePhotoText}>📸 Take a Photo of Your Meal</Text>
        </TouchableOpacity>

        {photoUri && (
          <>
            <Text style={[styles.photoLabel, darkMode ? styles.textLight : styles.textDark]}>Last photo taken:</Text>
            <Image source={{ uri: photoUri }} style={styles.imagePreview} />
          </>
        )}
      </View>

      {showCamera && (
        <View style={styles.cameraOverlay}>
          <Camera
            style={styles.camera}
            ref={(ref) => setCameraRef(ref)}
            type={Camera.Constants.Type.back}
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
