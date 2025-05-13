// src/components/common/AppLogo.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function AppLogo({ size = 100 }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={styles.text}>⛳</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: 40,
    color: '#fff',
  },
});