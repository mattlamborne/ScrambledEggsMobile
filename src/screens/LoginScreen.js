import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, Image } from 'react-native';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth() || {};
  const { signIn, user } = auth;


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
        // The RootNavigator will handle the navigation automatically
        // No need for manual navigation here.
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/golf_bg.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Image
          source={require('../../assets/scrambledeggslogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: '#fff' }]}>Login</Text>
        
        <TextInput
          style={styles.inputVisible}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.inputVisible}
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
        
        <Text style={styles.quote}>"Bad day to be a golf course"</Text>
        
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}



const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(40,40,40,0.45)',
    zIndex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 24,
    zIndex: 2,
  },
  logo: {
    width: 169,
    height: 169,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginBottom: 24 
  },
  inputVisible: {
    width: 280,
    maxWidth: '80%',
    height: 52,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 0,
    borderRadius: 14,
    paddingHorizontal: 18,
    marginVertical: 10,
    color: COLORS.text,
    fontWeight: '400',
    fontSize: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    textAlignVertical: 'center',
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
  quote: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '400',
    fontStyle: 'italic',
    marginBottom: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});