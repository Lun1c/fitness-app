// screens/SettingsScreen.js
import React from 'react';
import { SafeAreaView, View, Text, Switch } from 'react-native';
import Header from '../components/Header';
import styles from '../styles/styles';

export default function SettingsScreen({ darkMode, toggleDarkMode }) {
  return (
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <Header title="Settings" darkMode={darkMode} />
      <View style={{ padding: 20 }}>
        <Text style={[{ fontSize: 18, marginBottom: 10 }, darkMode ? styles.textLight : styles.textDark]}>
          Dark Mode
        </Text>
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
    </SafeAreaView>
  );
}
