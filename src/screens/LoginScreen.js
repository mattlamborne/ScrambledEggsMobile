// src/screens/LoginScreen.js - Add navigation to main app for testing
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Mock login message
    Alert.alert('Login', 'Login functionality will be added later');
  };

  // For development: Add a dev-only button to bypass authentication
// In LoginScreen.js, update the handleDevBypass function:
const handleDevBypass = () => {
  // Navigate to the main app
  navigation.navigate('MainApp'); // Updated from 'Home' to 'MainApp'
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {/* Development-only button - remove for production */}
      <TouchableOpacity 
        style={[styles.button, styles.devButton]} 
        onPress={handleDevBypass}
      >
        <Text style={styles.buttonText}>DEV: Skip to Main App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 24 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginBottom: 24 
  },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: COLORS.primary, 
    borderRadius: 8, 
    padding: 12, 
    marginVertical: 8 
  },
  button: { 
    backgroundColor: COLORS.primary, 
    padding: 14, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginVertical: 16 
  },
  devButton: {
    backgroundColor: '#666',
    marginTop: 40
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  link: { 
    color: COLORS.secondary, 
    marginTop: 12, 
    fontWeight: 'bold' 
  },
});