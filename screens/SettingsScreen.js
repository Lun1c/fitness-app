import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, Switch, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Star Rating Component
const StarRating = ({ rating, onRatingChange, darkMode }) => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          style={{ marginHorizontal: 4 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= rating ? '#FFD700' : (darkMode ? '#8E8E93' : '#C7C7CC')}
          />
        </TouchableOpacity>
      ))}
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: darkMode ? '#FFFFFF' : '#1C1C1E',
        marginLeft: 12,
      }}>
        {rating > 0 ? `${rating}/5` : 'Not rated'}
      </Text>
    </View>
  );
};

export default function SettingsScreen({ darkMode, toggleDarkMode }) {
  const [notifications, setNotifications] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(70000);
  const [appRating, setAppRating] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Load settings
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedWeeklyGoal = await AsyncStorage.getItem('weeklyGoal');
      const savedAppRating = await AsyncStorage.getItem('appRating');
      
      if (savedNotifications !== null) {
        setNotifications(JSON.parse(savedNotifications));
      }
      if (savedWeeklyGoal !== null) {
        setWeeklyGoal(parseInt(savedWeeklyGoal));
      }
      if (savedAppRating !== null) {
        setAppRating(parseInt(savedAppRating));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !notifications;
    setNotifications(newValue);
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  };

  const handleRatingChange = async (rating) => {
    setAppRating(rating);
    try {
      await AsyncStorage.setItem('appRating', rating.toString());
      
      // Show feedback based on rating
      let message = '';
      if (rating === 5) {
        message = 'Thank you for the 5-star rating! ⭐ We\'re thrilled you love the app!';
      } else if (rating === 4) {
        message = 'Thanks for the 4-star rating! 🌟 We appreciate your feedback!';
      } else if (rating === 3) {
        message = 'Thanks for rating! 💭 We\'d love to know how we can improve.';
      } else if (rating === 2) {
        message = 'Thank you for your feedback. 🔧 We\'re working hard to make improvements!';
      } else if (rating === 1) {
        message = 'We\'re sorry you\'re not satisfied. 😔 Please help us improve by sharing your concerns!';
      }
      
      if (message) {
        Alert.alert('Rating Submitted', message);
      }
    } catch (error) {
      console.error('Error saving app rating:', error);
      Alert.alert('Error', 'Failed to save rating');
    }
  };

  const handleDataReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your workouts, step goals, settings, and app rating. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['workouts', 'stepGoal', 'notifications', 'weeklyGoal', 'appRating']);
              setAppRating(0); // Reset the rating in state too
              Alert.alert('Success', 'All data has been reset successfully! 🔄');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Error', 'Failed to reset data');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Fitness Tracker',
      'Version 1.0.0\n\nA simple and beautiful fitness tracking app to help you stay active and reach your health goals.\n\n🏃‍♀️ Track daily steps\n💪 Log workouts\n🎯 Set and achieve goals\n📱 Beautiful, user-friendly interface',
      [{ text: 'OK' }]
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: darkMode ? 0.3 : 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: darkMode ? 1 : 0,
    borderColor: darkMode ? '#333' : 'transparent',
  };

  const SettingItem = ({ icon, title, subtitle, rightComponent, onPress, color = '#007AFF' }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={{
        backgroundColor: color,
        borderRadius: 12,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
      }}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: darkMode ? '#FFFFFF' : '#1C1C1E',
          marginBottom: subtitle ? 2 : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: darkMode ? '#8E8E93' : '#6D6D70',
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={containerStyle}>
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
              Settings
            </Text>
            <Text style={{
              fontSize: 16,
              color: darkMode ? '#8E8E93' : '#6D6D70',
              fontWeight: '500',
            }}>
              Customize your fitness experience
            </Text>
          </View>

          {/* Appearance Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                Appearance
              </Text>
            </View>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Switch between light and dark themes"
              color="#5856D6"
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={toggleDarkMode}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                />
              }
            />
          </View>

          {/* Notifications Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                Notifications
              </Text>
            </View>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Get reminders and achievement alerts"
              color="#FF9500"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={toggleNotifications}
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                />
              }
            />
          </View>

          {/* Goals Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                Goals & Targets
              </Text>
            </View>
            <SettingItem
              icon="flag"
              title="Weekly Step Goal"
              subtitle={`Current: ${weeklyGoal.toLocaleString()} steps per week`}
              color="#30D158"
              rightComponent={
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={darkMode ? '#8E8E93' : '#C7C7CC'} 
                />
              }
              onPress={() => {
                Alert.alert(
                  'Coming Soon! 🚀',
                  'Weekly goal customization will be available in the next update.'
                );
              }}
            />
            <SettingItem
              icon="trophy"
              title="Achievement Badges"
              subtitle="View your fitness milestones"
              color="#FFD60A"
              rightComponent={
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={darkMode ? '#8E8E93' : '#C7C7CC'} 
                />
              }
              onPress={() => {
                Alert.alert(
                  'Coming Soon! 🏆',
                  'Achievement system will be available in the next update.'
                );
              }}
            />
          </View>

          {/* App Rating Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                Your Feedback
              </Text>
            </View>
            <View style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <View style={{
                  backgroundColor: '#FF6B35',
                  borderRadius: 12,
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="star" size={20} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: darkMode ? '#FFFFFF' : '#1C1C1E',
                    marginBottom: 2,
                  }}>
                    Rate This App
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                  }}>
                    How would you rate your experience?
                  </Text>
                </View>
              </View>
              <StarRating 
                rating={appRating} 
                onRatingChange={handleRatingChange}
                darkMode={darkMode}
              />
              {appRating > 0 && (
                <View style={{
                  backgroundColor: darkMode ? '#2C2C2E' : '#F2F2F7',
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 12,
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: darkMode ? '#8E8E93' : '#6D6D70',
                    textAlign: 'center',
                  }}>
                    Thank you for rating our app! Your feedback helps us improve.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Data & Privacy Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                Data & Privacy
              </Text>
            </View>
            <SettingItem
              icon="cloud-upload"
              title="Export Data"
              subtitle="Backup your fitness data"
              color="#007AFF"
              rightComponent={
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={darkMode ? '#8E8E93' : '#C7C7CC'} 
                />
              }
              onPress={() => {
                Alert.alert(
                  'Coming Soon! ☁️',
                  'Data export feature will be available in the next update.'
                );
              }}
            />
            <SettingItem
              icon="shield-checkmark"
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
              color="#34C759"
              rightComponent={
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={darkMode ? '#8E8E93' : '#C7C7CC'} 
                />
              }
              onPress={() => {
                Alert.alert(
                  'Privacy First 🔒',
                  'Your fitness data is stored locally on your device and is never shared with third parties. We believe in keeping your personal health information private and secure.'
                );
              }}
            />
            <SettingItem
              icon="trash"
              title="Reset All Data"
              subtitle="Delete all workouts, settings, and rating"
              color="#FF3B30"
              onPress={handleDataReset}
            />
          </View>

          {/* About Section */}
          <View style={cardStyle}>
            <View style={{
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? '#2C2C2E' : '#F2F2F7',
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: '700',
                color: darkMode ? '#FFFFFF' : '#1C1C1E',
                paddingVertical: 8,
              }}>
                About
              </Text>
            </View>
            <SettingItem
              icon="information-circle"
              title="About This App"
              subtitle="Version, credits, and more"
              color="#8E8E93"
              rightComponent={
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={darkMode ? '#8E8E93' : '#C7C7CC'} 
                />
              }
              onPress={handleAbout}
            />
          </View>

          {/* Footer */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 30,
            paddingHorizontal: 20,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: darkMode ? '#8E8E93' : '#6D6D70',
              textAlign: 'center',
              lineHeight: 20,
            }}>
              💪🫀 Stronger Every Step 🫀💪{'\n'}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}