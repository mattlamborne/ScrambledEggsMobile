import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

export default function GradientBackground({ children }) {
  return (
    <LinearGradient
      colors={[COLORS.primary, '#FFFFFF']}
      locations={[0, 0.3]} // Gradient fades out by 30% down the screen
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 