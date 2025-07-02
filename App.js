import 'react-native-gesture-handler'; // Must be first import

import React from 'react';
import { Text, View, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Card } from 'react-native-elements';

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

      {/* Calories Section */}
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

      {/* Steps Section */}
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

      {/* Progress Section */}
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
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Food" />
      <Text style={styles.screenContent}>Track your meals and nutrition.</Text>
    </SafeAreaView>
  );
}

function WorkoutsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Workouts" />
      <Text style={styles.screenContent}>Track your workouts here.</Text>
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
});
