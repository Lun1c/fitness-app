import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },

  // Header
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerLight: {
    backgroundColor: '#ADD8E6',
  },
  headerDark: {
    backgroundColor: '#003366',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Text Colors
  textLight: {
    color: '#eee',
  },
  textDark: {
    color: '#111',
  },

  // Section Titles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  // Cards
  card: {
    margin: 10,
    borderRadius: 10,
  },
  cardLight: {
    backgroundColor: '#E0F7FF',
  },
  cardDark: {
    backgroundColor: '#1E2A38',
  },

  // Values
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
  },
  subValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Progress Bar
  progressBar: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarLight: {
    backgroundColor: '#C0E8FF',
  },
  progressBarDark: {
    backgroundColor: '#0A1F44',
  },
  progress: {
    height: '100%',
    backgroundColor: '#ff0000',
  },

  // Content Layout
  content: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    width: '90%',
  },
  inputLight: {
    borderColor: '#aaa',
    color: '#000',
  },
  inputDark: {
    borderColor: '#333',
    color: '#fff',
  },

  // Camera
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
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
    padding: 10,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 10,
  },
  snapText: {
    color: 'white',
    fontSize: 16,
  },
  cameraLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraLoadingText: {
    color: '#fff',
    fontSize: 18,
  },

  // Image Preview
  photoLabel: {
    fontSize: 16,
    marginTop: 20,
  },
  imagePreview: {
    width: 250,
    height: 250,
    marginTop: 20,
    borderRadius: 10,
  },

  // Take Photo Button
  takePhotoButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  takePhotoText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },

  // Workouts
  workoutItem: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  workoutItemLight: {
    backgroundColor: '#E0F7FF',
  },
  workoutItemDark: {
    backgroundColor: '#2C3E50',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workoutNotes: {
    fontSize: 14,
    marginTop: 4,
  },

  // Misc
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
  },
  addButton: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default styles;
