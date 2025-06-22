import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { Card } from 'react-native-elements';

export default function App() {
  const stepsProgress = 3000 / 10000; // 30% progress

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Title</Text>
      </View>

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

      {/* Bottom Navigation */}
      <View style={styles.navContainer}>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Other</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Other</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Food</Text>
        </View>
        <View style={styles.navItem}>
          <Text style={styles.navText}>Workouts</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 60, // Make room for the bottom nav bar
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
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#d3d3d3',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
