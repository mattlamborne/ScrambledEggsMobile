// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import GradientBackground from '../components/common/GradientBackground';
import { useGameContext } from '../context/GameContext';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileScreen() {
  const { user, profile, updateProfile, signOut, loading } = useAuth();
  const { games } = useGameContext();
  
  const [fullName, setFullName] = useState('');

  // Stats calculation
  const roundsPlayed = games?.length || 0;
  const bestScore = games && games.length > 0 ? Math.min(...games.map(g => g.total_score || 999)) : null;
  const mostPlayedCourse = (() => {
    if (!games || games.length === 0) return null;
    const freq = {};
    games.forEach(g => { freq[g.course_name] = (freq[g.course_name] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  })();
  // TODO: Replace with real paid check
  const isPaidUser = false;

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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Top: Avatar & Greeting */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarInitials}>{getInitials(profile?.full_name || profile?.username)}</Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name || profile?.username || 'User'}</Text>
          <Text style={styles.profileGreeting}>
            {profile?.full_name ? `${profile.full_name} — Master of Bogeys 🏌️` : 'Welcome to Scrambie Eggs! 🥚'}
          </Text>
        </View>
        {/* Account Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.staticText}>{user?.email}</Text>
        </View>
        {/* Buttons */}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={loading} accessibilityLabel="Update profile">
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>Update</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut} accessibilityLabel="Log out">
          <Text style={styles.logoutButtonText}><Ionicons name="log-out-outline" size={18} color="#E53935" /> Log Out</Text>
        </TouchableOpacity>
        {/* Footer */}
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
  profileTop: {
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 18,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
    fontFamily: 'System',
  },
  profileGreeting: {
    fontSize: 15,
    color: COLORS.textLight,
    marginBottom: 8,
    fontFamily: 'System',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 8,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 8,
    fontFamily: 'System',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'System',
  },
  staticText: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#777',
    fontFamily: 'System',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  logoutButton: {
    marginHorizontal: 8,
    marginBottom: 24,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'System',
  },
  version: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginBottom: 18,
    fontSize: 13,
    fontFamily: 'System',
  },
});