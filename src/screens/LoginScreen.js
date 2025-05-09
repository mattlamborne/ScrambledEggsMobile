import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AppLogo from '../components/common/AppLogo';
import { COLORS } from '../constants/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Error', error.message);
  };

  return (
    <View style={styles.container}>
      <AppLogo size={80} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('PasswordReset')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginVertical: 16 },
  input: { width: '100%', borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, padding: 12, marginVertical: 8 },
  button: { backgroundColor: COLORS.primary, padding: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: COLORS.secondary, marginTop: 12, fontWeight: 'bold' },
});