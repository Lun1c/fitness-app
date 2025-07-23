import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export default function FoodScreen({ darkMode }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
      setHasMediaPermission(mediaStatus === 'granted');
    })();
  }, []);

  const takePhoto = async () => {
    if (cameraRef && cameraReady) {
      try {
        const photo = await cameraRef.takePictureAsync();
        setPhotoUri(photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        setShowCamera(false);
      } catch (e) {
        console.warn('Error taking photo:', e);
      }
    }
  };

  if (hasCameraPermission === null || hasMediaPermission === null) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Requesting permissions...</Text>
      </SafeAreaView>
    );
  }

  if (!hasCameraPermission || !hasMediaPermission) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>No access to camera or media library</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {!showCamera && (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.takePhotoButton}
            onPress={() => setShowCamera(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.takePhotoText}>📸 Take a Photo of Your Meal</Text>
          </TouchableOpacity>

          {photoUri && (
            <>
              <Text style={[styles.photoLabel, darkMode ? styles.textLight : styles.textDark]}>
                Last photo taken:
              </Text>
              <Image source={{ uri: photoUri }} style={styles.imagePreview} />
            </>
          )}
        </View>
      )}

      {showCamera && (
        <View style={styles.cameraOverlay}>
          {Camera?.Constants?.Type?.back !== undefined ? (
            <Camera
              style={styles.camera}
              ref={(ref) => setCameraRef(ref)}
              type={Camera.Constants.Type.back}
              onCameraReady={() => setCameraReady(true)}
            >
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.snapButton} onPress={takePhoto}>
                  <Text style={styles.snapText}>Snap</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCamera(false)}
                >
                  <Text style={styles.snapText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Camera>
          ) : (
            <View style={styles.centered}>
              <Text style={{ color: 'white' }}>Camera not available</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#fff' },
  containerDark: { backgroundColor: '#121212' },
  textLight: { color: '#eee' },
  textDark: { color: '#111' },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  takePhotoButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  takePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  photoLabel: {
    fontSize: 16,
    marginTop: 20,
  },
  imagePreview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 1000,
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
    padding: 15,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#cc0000',
    padding: 15,
    borderRadius: 10,
  },
  snapText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
