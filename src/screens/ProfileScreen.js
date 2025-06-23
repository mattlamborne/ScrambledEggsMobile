// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import GradientBackground from '../components/common/GradientBackground';

export default function ProfileScreen() {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return;
    }
    
    const updates = {
      full_name: fullName,
      updated_at: new Date(),
    };

    const { success } = await updateProfile(updates);
    if (success) {
      Alert.alert('Success', 'Profile updated successfully!');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <GradientBackground>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={80} color="#fff" />
          <Text style={styles.username}>{profile?.username || 'Username'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          
          <Text style={styles.label}>Email</Text>
          <Text style={styles.staticText}>{user?.email}</Text>
          
          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'transparent',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
  },
  form: {
    padding: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  staticText: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#777',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    margin: 24,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E53935',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: 24,
  },
});