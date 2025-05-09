import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import AppLogo from '../components/common/AppLogo';
import { COLORS } from '../constants/colors';

export default function PasswordResetScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) Alert.alert('Reset Error', error.message);
    else Alert.alert('Success', 'Check your email for a password reset link!');
  };

  return (
    <View style={styles.container}>
      <AppLogo size={80} />
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Back to Login</Text>
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