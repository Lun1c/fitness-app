// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { Card } from 'react-native-elements';
import { Pedometer } from 'expo-sensors';
import Header from '../components/Header';
import styles from '../styles/styles';

export default function HomeScreen({ darkMode }) {
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
    <SafeAreaView style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <Header title="Home" darkMode={darkMode} />

      <Card containerStyle={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Calories</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, darkMode ? styles.textLight : styles.textDark]}>1,000</Text>
          <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>Remaining</Text>
        </View>
        <View style={styles.subValues}>
          <View style={styles.subValue}>
            <Text style={[styles.subLabel, darkMode ? styles.textLight : styles.textDark]}>Goal</Text>
            <Text style={[styles.subValueText, darkMode ? styles.textLight : styles.textDark]}>1,960</Text>
          </View>
          <View style={styles.subValue}>
            <Text style={[styles.subLabel, darkMode ? styles.textLight : styles.textDark]}>Food</Text>
            <Text style={[styles.subValueText, darkMode ? styles.textLight : styles.textDark]}>0</Text>
          </View>
          <View style={styles.subValue}>
            <Text style={[styles.subLabel, darkMode ? styles.textLight : styles.textDark]}>Exercise</Text>
            <Text style={[styles.subValueText, darkMode ? styles.textLight : styles.textDark]}>0</Text>
          </View>
        </View>
      </Card>

      <Card containerStyle={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Steps</Text>
        <View style={styles.valueContainer}>
          {pedometerAvailable === 'available' ? (
            <>
              <Text style={[styles.value, darkMode ? styles.textLight : styles.textDark]}>{steps}</Text>
              <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>Goal: {stepGoal} steps</Text>
              <View style={[styles.progressBar, darkMode ? styles.progressBarDark : styles.progressBarLight]}>
                <View style={[styles.progress, { width: `${stepsProgress * 100}%` }]} />
              </View>
            </>
          ) : (
            <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>Pedometer not available</Text>
          )}
        </View>
      </Card>

      <Card containerStyle={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        <Text style={[styles.sectionTitle, darkMode ? styles.textLight : styles.textDark]}>Progress</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.label, darkMode ? styles.textLight : styles.textDark]}>Weight Loss</Text>
          <Text style={[styles.subValueText, darkMode ? styles.textLight : styles.textDark]}>Last 90 Days...</Text>
        </View>
      </Card>
    </SafeAreaView>
  );
}
