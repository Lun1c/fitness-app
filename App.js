import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import FoodScreen from './screens/FoodScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const savedDarkMode = await AsyncStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
          setDarkMode(JSON.parse(savedDarkMode));
        }
      } catch (error) {
        console.error('Error loading dark mode:', error);
      }
    };
    loadDarkMode();
  }, []);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Food') iconName = 'restaurant';
            else if (route.name === 'Workouts') iconName = 'barbell';
            else if (route.name === 'Settings') iconName = 'settings';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: darkMode ? '#81b0ff' : '#007AFF',
          tabBarInactiveTintColor: darkMode ? '#767577' : '#ccc',
          tabBarStyle: {
            backgroundColor: darkMode ? '#1E2A38' : '#fff',
          },
        })}
      >
        <Tab.Screen name="Home">
          {(props) => <HomeScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        <Tab.Screen name="Food">
          {(props) => <FoodScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        <Tab.Screen name="Workouts">
          {(props) => <WorkoutsScreen {...props} darkMode={darkMode} />}
        </Tab.Screen>
        <Tab.Screen name="Settings">
          {(props) => (
            <SettingsScreen
              {...props}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}