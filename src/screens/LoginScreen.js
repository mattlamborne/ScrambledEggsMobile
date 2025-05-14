import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth() || {};
  const { signIn, user } = auth;

  // Check if user is already logged in and navigate to MainApp
  useEffect(() => {
    if (user) {
      navigation.navigate('MainApp');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
  
    try {
      setLoading(true);
      console.log("Attempting login with:", email);
      const result = await signIn(email, password);
      console.log("Login result:", result);
      
      if (!result.success) {
        Alert.alert('Login Error', result.error || 'Failed to login');
      } else {
        console.log("Login successful!");
        
        // Force navigation with a slight delay to ensure state updates
        setTimeout(() => {
          console.log("Navigating to MainApp...");
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          });
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add the missing handleDevBypass function
  const handleDevBypass = () => {
    // Navigate to the main app
    navigation.navigate('MainApp');
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
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Log In'}
        </Text>
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