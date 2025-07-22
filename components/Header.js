// components/Header.js
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/styles';

export default function Header({ title, darkMode }) {
  return (
    <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
      <Text style={[styles.headerText, darkMode ? styles.textLight : styles.textDark]}>{title}</Text>
    </View>
  );
}
