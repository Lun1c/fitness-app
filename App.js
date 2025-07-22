// App.js
import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './screens/HomeScreen';
import FoodScreen from './screens/FoodScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
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
