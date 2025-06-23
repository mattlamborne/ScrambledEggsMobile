// src/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) throw error;
      
      Alert.alert(
        'Signup successful', 
        'Please check your email for confirmation instructions',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Signup Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
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
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Log In</Text>
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