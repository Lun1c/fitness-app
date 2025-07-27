import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function FoodScreen({ darkMode = false }) {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants?.Type?.back || 'back');
  const [isReady, setIsReady] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [meals, setMeals] = useState([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [mealText, setMealText] = useState('');
  const [mealNotes, setMealNotes] = useState('');
  const cameraRef = useRef(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load saved meals
    loadMeals();
  }, []);

  // Load meals from AsyncStorage
  const loadMeals = async () => {
    try {
      const savedMeals = await AsyncStorage.getItem('meals');
      if (savedMeals) {
        setMeals(JSON.parse(savedMeals));
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  // Save meals to AsyncStorage
  const saveMeals = async (mealsToSave) => {
    try {
      await AsyncStorage.setItem('meals', JSON.stringify(mealsToSave));
    } catch (error) {
      console.error('Error saving meals:', error);
    }
  };

  // Request permissions when screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const requestPermissions = async () => {
        try {
          console.log('Requesting camera permissions...');
          const cameraStatus = await Camera.requestCameraPermissionsAsync();
          console.log('Camera permission status:', cameraStatus.status);
          
          console.log('Requesting media library permissions...');
          const mediaStatus = await MediaLibrary.requestPermissionsAsync();
          console.log('Media library permission status:', mediaStatus.status);

          if (isActive) {
            setHasCameraPermission(cameraStatus.status === 'granted');
            setHasMediaPermission(mediaStatus.status === 'granted');
          }
        } catch (error) {
          console.error('Error requesting permissions:', error);
          if (isActive) {
            setHasCameraPermission(false);
            setHasMediaPermission(false);
          }
        }
      };

      requestPermissions();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const openCamera = async () => {
    try {
      console.log('Opening camera...');
      console.log('Camera Constants available:', !!Camera.Constants);
      
      if (!Camera.Constants) {
        Alert.alert('Error', 'Camera module not fully loaded. Please try again in a moment.');
        return;
      }

      // Double-check permissions before opening camera
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        const requestResult = await Camera.requestCameraPermissionsAsync();
        if (requestResult.status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
      }

      setCameraType(Camera.Constants.Type.back);
      setCameraVisible(true);
      setIsReady(false);
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const onCameraReady = () => {
    console.log('Camera is ready');
    setIsReady(true);
  };

  const takePhoto = async () => {
    if (cameraRef.current && isReady) {
      try {
        console.log('Taking photo...');
        const photoData = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });
        
        console.log('Photo taken:', photoData.uri);
        
        // Save to media library if permission granted
        if (hasMediaPermission) {
          try {
            await MediaLibrary.saveToLibraryAsync(photoData.uri);
            console.log('Photo saved to gallery');
          } catch (saveError) {
            console.warn('Failed to save to gallery:', saveError);
            // Continue even if gallery save fails
          }
        }

        // Add to local photos array
        const newPhoto = {
          id: Date.now().toString(),
          uri: photoData.uri,
          timestamp: new Date().toLocaleString(),
          type: 'photo',
        };
        
        setPhotos(prev => [newPhoto, ...prev]);
        setPhoto(photoData.uri);
        setCameraVisible(false);
        
        Alert.alert('Success! 📸', 'Photo captured and saved successfully!');
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    } else {
      Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize.');
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setIsReady(false);
  };

  const addTextMeal = () => {
    if (mealText.trim() === '') {
      Alert.alert('Oops! 🤔', 'Please enter a meal description');
      return;
    }

    const newMeal = {
      id: Date.now().toString(),
      text: mealText.trim(),
      notes: mealNotes.trim(),
      timestamp: new Date().toLocaleString(),
      type: 'text',
    };

    const updatedMeals = [newMeal, ...meals];
    setMeals(updatedMeals);
    saveMeals(updatedMeals);
    
    setMealText('');
    setMealNotes('');
    setShowTextInput(false);
    
    Alert.alert('Success! 🍽️', 'Meal logged successfully!');
  };

  const deletePhoto = (photoId) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            if (photo && photos.find(p => p.id === photoId)?.uri === photo) {
              setPhoto(null);
            }
          },
        },
      ]
    );
  };

  const deleteMeal = (mealId) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMeals = meals.filter(m => m.id !== mealId);
            setMeals(updatedMeals);
            saveMeals(updatedMeals);
          },
        },
      ]
    );
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: darkMode ? '#0A0A0A' : '#F8F9FA',
  };

  const cardStyle = {
    backgroundColor: darkMode ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: darkMode ? 1 : 0,
    borderColor: darkMode ? '#333' : 'transparent',
  };

  // Loading state
  if (hasCameraPermission === null || hasMediaPermission === null) {
    return (
      <SafeAreaView style={containerStyle}>
        <View style={[cardStyle, {
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 100,
        }]}>
          <Ionicons 
            name="camera" 
            size={48} 
            color={darkMode ? '#8E8E93' : '#6D6D70'} 
            style={{ marginBottom: 16 }}
          />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: darkMode ? '#FFFFFF' : '#1C1C1E',
            marginBottom: 8,
          }}>
            Setting up camera...
          </Text>
          <Text style={{
            fontSize: 14,
            color: darkMode ? '#8E8E93' : '#6D6D70',
            textAlign: 'center',
          }}>
            Requesting camera and media permissions
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  if (cameraVisible) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <Camera
          style={{ flex: 1 }}
          type={cameraType}
          ref={cameraRef}
          onCameraReady={onCameraReady}
        >
          <View style={{
            flex: 1,
            backgroundColor: 'transparent',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
            {/* Top controls */}
            <View style={{
              position: 'absolute',
              top: 50,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={closeCamera}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setCameraType(
                    cameraType === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  );
                }}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom controls */}
            <View style={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              paddingVertical: 30,
              paddingHorizontal: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <TouchableOpacity
                style={{
                  backgroundColor: isReady ? '#FFFFFF' : '#666',
                  borderRadius: 40,
                  width: 80,
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 4,
                  borderColor: isReady ? '#007AFF' : '#999',
                }}
                onPress={takePhoto}
                disabled={!isReady}
              >
                <Ionicons 
                  name="camera" 
                  size={32} 
                  color={isReady ? '#007AFF' : '#999'} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </SafeAreaView>
    );
  }

  // Main food screen
  return (
    <SafeAreaView style={containerStyle}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
                Food Logger
              </Text>
              <Text style={{
                fontSize: 16,
                color: darkMode ? '#8E8E93' : '#6D6D70',
                fontWeight: '500',
              }}>
                Capture or log your meals and snacks
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              gap: 12,
              marginBottom: 8,
            }}>
              {/* Camera Button */}
              {hasCameraPermission && (
                <TouchableOpacity
                  style={[cardStyle, {
                    flex: 1,
                    margin: 0,
                    alignItems: 'center',
                    backgroundColor: darkMode ? '#007AFF' : '#007AFF',
                    paddingVertical: 16,
                  }]}
                  onPress={openCamera}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons name="camera" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#FFFFFF',
                    }}>
                      Photo
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Text Input Button */}
              <TouchableOpacity
                style={[cardStyle, {
                  flex: 1,
                  margin: 0,
                  alignItems: 'center',
                  backgroundColor: darkMode ? '#34C759' : '#34C759',
                  paddingVertical: 16,
                }]}
                onPress={() => setShowTextInput(true)}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Ionicons name="create" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}>
                    Text
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Text Input Form */}
            {showTextInput && (
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
                    Add Meal
                  </Text>
                  <TouchableOpacity onPress={() => {
                    setShowTextInput(false);
                    setMealText('');
                    setMealNotes('');
                  }}>
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
                    marginBottom: 12,
                    minHeight: 50,
                  }}
                  placeholder="What did you eat? (e.g., Chicken salad with quinoa)"
                  value={mealText}
                  onChangeText={setMealText}
                  placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
                  multiline
                />

                <TextInput
                  style={{
                    backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    fontSize: 14,
                    fontWeight: '500',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 20,
                    minHeight: 80,
                  }}
                  placeholder="Additional notes (optional - calories, portion size, etc.)"
                  value={mealNotes}
                  onChangeText={setMealNotes}
                  placeholderTextColor={darkMode ? '#8E8E93' : '#6D6D70'}
                  multiline
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
                    onPress={addTextMeal}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '700',
                    }}>
                      Add Meal
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
                      setShowTextInput(false);
                      setMealText('');
                      setMealNotes('');
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

            {/* Stats Card */}
            {(photos.length > 0 || meals.length > 0) && (
              <View style={cardStyle}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 16,
                  textAlign: 'center',
                }}>
                  Today's Food Log
                </Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                }}>
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
                      <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '800',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      marginBottom: 2,
                    }}>
                      {photos.length}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: darkMode ? '#8E8E93' : '#6D6D70',
                    }}>
                      Photos
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <View style={{
                      backgroundColor: '#34C759',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}>
                      <Ionicons name="create" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '800',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      marginBottom: 2,
                    }}>
                      {meals.length}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: darkMode ? '#8E8E93' : '#6D6D70',
                    }}>
                      Text Logs
                    </Text>
                  </View>
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
                      <Ionicons name="restaurant" size={20} color="#FFFFFF" />
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: '800',
                      color: darkMode ? '#FFFFFF' : '#1C1C1E',
                      marginBottom: 2,
                    }}>
                      {photos.length + meals.length}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: darkMode ? '#8E8E93' : '#6D6D70',
                    }}>
                      Total
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Text Meals List */}
            {meals.length > 0 && (
              <View style={cardStyle}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 16,
                }}>
                  Text Meal Logs ({meals.length})
                </Text>
                
                {meals.map((meal) => (
                  <View key={meal.id} style={{
                    backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: darkMode ? '#FFFFFF' : '#1C1C1E',
                          marginBottom: 4,
                        }}>
                          {meal.text}
                        </Text>
                        {meal.notes && (
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: darkMode ? '#8E8E93' : '#6D6D70',
                            marginBottom: 8,
                            lineHeight: 20,
                          }}>
                            {meal.notes}
                          </Text>
                        )}
                        <Text style={{
                          fontSize: 12,
                          color: darkMode ? '#8E8E93' : '#6D6D70',
                        }}>
                          {meal.timestamp}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#FF3B30',
                          borderRadius: 8,
                          paddingVertical: 6,
                          paddingHorizontal: 8,
                        }}
                        onPress={() => deleteMeal(meal.id)}
                      >
                        <Ionicons name="trash" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Photo Gallery */}
            {photos.length > 0 && (
              <View style={cardStyle}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 16,
                }}>
                  Your Food Photos ({photos.length})
                </Text>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                >
                  {photos.map((photoItem, index) => (
                    <View key={photoItem.id} style={{ marginRight: 12 }}>
                      <Image
                        source={{ uri: photoItem.uri }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 12,
                          marginBottom: 8,
                        }}
                      />
                      <Text style={{
                        fontSize: 12,
                        color: darkMode ? '#8E8E93' : '#6D6D70',
                        textAlign: 'center',
                        marginBottom: 8,
                      }}>
                        {photoItem.timestamp}
                      </Text>
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#FF3B30',
                          borderRadius: 8,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => deletePhoto(photoItem.id)}
                      >
                        <Ionicons name="trash" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Empty State */}
            {photos.length === 0 && meals.length === 0 && (
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
                    name="restaurant" 
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
                  No meals logged yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  Start logging your meals by taking{'\n'}photos or adding text descriptions!
                </Text>
              </View>
            )}

            {/* No Camera Permission State */}
            {hasCameraPermission === false && (
              <View style={[cardStyle, {
                alignItems: 'center',
                marginTop: 20,
              }]}>
                <View style={{
                  backgroundColor: '#FF9500',
                  borderRadius: 30,
                  width: 60,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Ionicons name="camera-off" size={28} color="#FFFFFF" />
                </View>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: darkMode ? '#FFFFFF' : '#1C1C1E',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  Camera Access Disabled
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: darkMode ? '#8E8E93' : '#6D6D70',
                  textAlign: 'center',
                  lineHeight: 20,
                  marginBottom: 16,
                }}>
                  Camera photos are disabled, but you can still{'\n'}log meals using text descriptions!
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}