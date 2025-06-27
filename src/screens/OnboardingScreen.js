import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { supabase } from '../lib/supabase';

const steps = [
  'welcome',
  'referral',
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
];

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Golf ball slide-to-begin animation
  const pan = React.useRef(new Animated.ValueXY()).current;
  const [slideComplete, setSlideComplete] = useState(false);
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => gesture.dx > 5,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x },
    ], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > 180) {
        setSlideComplete(true);
        setTimeout(() => setStep(1), 400);
      } else {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  });

  // Username availability check
  const checkUsername = async (username) => {
    setCheckingUsername(true);
    setError('');
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
    setUsernameAvailable(!data);
    setCheckingUsername(false);
    if (data) setError('Username already taken');
  };

  const handleNext = async () => {
    setError('');
    if (steps[step] === 'username') {
      if (!answers.username) {
        setError('Please enter a username');
        return;
      }
      await checkUsername(answers.username);
      if (!usernameAvailable) return;
    }
    if (steps[step] === 'email') {
      if (!answers.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(answers.email)) {
        setError('Please enter a valid email');
        return;
      }
    }
    if (steps[step] === 'password') {
      if (!answers.password || answers.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setError('');
      setLoading(true);
      const { error: signupError } = await supabase.auth.signUp({
        email: answers.email,
        password: answers.password,
        options: {
          data: {
            username: answers.username,
            first_name: answers.firstName,
            last_name: answers.lastName,
            referral: answers.referral,
          }
        }
      });
      if (signupError) {
        setLoading(false);
        setError(signupError.message);
        return;
      }
      // Immediately log the user in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: answers.email,
        password: answers.password,
      });
      setLoading(false);
      if (loginError) {
        // If the error is about email confirmation, redirect to Login with a message
        if (loginError.message && loginError.message.toLowerCase().includes('confirm')) {
          navigation.replace('Login', { message: 'Please confirm your account via the link sent to your email.' });
          return;
        }
        setError(loginError.message);
        return;
      }
      navigation.replace('Home');
      return;
    }
    setStep(step + 1);
  };

  const handleInput = (field, value) => {
    setAnswers({ ...answers, [field]: value });
    if (field === 'username') setUsernameAvailable(true);
  };

  // Render step content
  let content;
  switch (steps[step]) {
    case 'welcome':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>Let's get to know you</Text>
          <Text style={styles.subtitle}>Slide the golf ball to begin</Text>
          <View style={styles.slideContainer}>
            <Animated.View
              style={[styles.golfBall, { transform: [{ translateX: pan.x }] }]}
              {...panResponder.panHandlers}
            >
              <Ionicons name="golf" size={32} color={COLORS.primary} />
            </Animated.View>
            <View style={styles.slideTrack} />
          </View>
        </View>
      );
      break;
    case 'referral':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>How did you hear about us?</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="e.g. Friend, Instagram, Ad..."
            value={answers.referral || ''}
            onChangeText={text => handleInput('referral', text)}
            autoFocus
          />
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      break;
    case 'firstName':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>What is your first name?</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="First name"
            value={answers.firstName || ''}
            onChangeText={text => handleInput('firstName', text)}
            autoFocus
          />
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      break;
    case 'lastName':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>What is your last name?</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="Last name"
            value={answers.lastName || ''}
            onChangeText={text => handleInput('lastName', text)}
            autoFocus
          />
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      break;
    case 'username':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>Choose a username</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="Username"
            value={answers.username || ''}
            onChangeText={text => handleInput('username', text)}
            autoCapitalize="none"
            autoFocus
          />
          {checkingUsername && <ActivityIndicator size="small" color={COLORS.primary} />}
          {!usernameAvailable && <Text style={styles.errorText}>Username already taken</Text>}
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      break;
    case 'email':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>What is your email?</Text>
          <TextInput
            style={styles.inputUnderline}
            placeholder="Email"
            value={answers.email || ''}
            onChangeText={text => handleInput('email', text)}
            autoCapitalize="none"
            keyboardType="email-address"
            autoFocus
          />
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      );
      break;
    case 'password':
      content = (
        <View style={styles.centered}>
          <Text style={styles.title}>Create a password</Text>
          <View style={styles.passwordRowBelow}>
            <TextInput
              style={styles.inputUnderline}
              placeholder="Password"
              value={answers.password || ''}
              onChangeText={text => handleInput('password', text)}
              secureTextEntry={!passwordVisible}
              autoFocus
            />
            <TouchableOpacity onPress={() => setPasswordVisible(v => !v)} style={styles.eyeButton}>
              <Ionicons name={passwordVisible ? 'eye-off' : 'eye'} size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.arrowButtonBelow} onPress={handleNext} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-forward" size={26} color="#fff" />}
          </TouchableOpacity>
        </View>
      );
      break;
    default:
      content = null;
  }

  return (
    <View style={styles.container}>
      {content}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#fff' },
  centered: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: 26, fontWeight: '400', color: COLORS.text, marginBottom: 18, textAlign: 'center' },
  subtitle: { fontSize: 16, color: COLORS.textLight, marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#f6f8fa', borderRadius: 8, padding: 14, fontSize: 17, width: 260, marginBottom: 18, borderWidth: 1, borderColor: '#e0e0e0' },
  nextButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 36, borderRadius: 8, marginTop: 8 },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  errorText: { color: 'red', marginTop: 8, fontSize: 15 },
  slideContainer: { width: 220, height: 48, justifyContent: 'center', alignItems: 'flex-start', marginTop: 32, marginBottom: 12 },
  golfBall: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6 },
  slideTrack: { position: 'absolute', left: 0, right: 0, top: 22, height: 4, backgroundColor: '#e0e0e0', borderRadius: 2 },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'center', width: 300, marginBottom: 18 },
  arrowButton: { backgroundColor: COLORS.primary, borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  eyeButton: { marginLeft: 8, marginRight: 0 },
  inputUnderline: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 0,
    padding: 10,
    fontSize: 18,
    width: 260,
    marginBottom: 18,
  },
  arrowButtonBelow: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  passwordRowBelow: { flexDirection: 'row', alignItems: 'center', width: 260 },
}); 