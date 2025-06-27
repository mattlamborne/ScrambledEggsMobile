// src/screens/NewGameScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, FlatList, ActivityIndicator, Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import GradientBackground from '../components/common/GradientBackground';
import { searchCourses, getCourseDetails } from '../lib/golfApi';
import { useAuth } from '../context/AuthContext';
import PlayerCard from '../components/common/PlayerCard';
import { supabase } from '../lib/supabase';
import AppLogo from '../components/common/AppLogo';

// Sample courses with lat/lng for simulation
const SAMPLE_COURSES = [
  { id: 1, course_name: 'Green Valley Golf Club', city: 'Springfield', par: 72, lat: 37.2153, lng: -93.2982 },
  { id: 2, course_name: 'Lakeside Links', city: 'Lakeview', par: 70, lat: 37.2451, lng: -93.3124 },
  { id: 3, course_name: 'Pinecrest National', city: 'Pinecrest', par: 71, lat: 37.1950, lng: -93.2850 },
  { id: 4, course_name: 'Eagle Ridge', city: 'Eagleton', par: 73, lat: 37.2250, lng: -93.3200 },
  { id: 5, course_name: 'Sunset Hills', city: 'Sunset', par: 72, lat: 37.2100, lng: -93.3100 },
  { id: 6, course_name: 'Riverbend Golf', city: 'Riverside', par: 70, lat: 37.2300, lng: -93.2950 },
  { id: 7, course_name: 'Maplewood Greens', city: 'Maplewood', par: 69, lat: 37.2200, lng: -93.3050 },
  { id: 8, course_name: 'Oakmont Park', city: 'Oakmont', par: 72, lat: 37.2400, lng: -93.2990 },
  { id: 9, course_name: 'Willow Creek', city: 'Willow', par: 71, lat: 37.2180, lng: -93.3150 },
  { id: 10, course_name: 'Fox Run', city: 'Foxville', par: 68, lat: 37.2120, lng: -93.3080 },
];

// Haversine formula to calculate distance (in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

export default function NewGameScreen({ navigation }) {
  const { createGame, games } = useGameContext();
  const { user, profile } = useAuth();

  // State management
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseSearchResults, setCourseSearchResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCourseDetailsLoading, setIsCourseDetailsLoading] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState([]);
  const [addMode, setAddMode] = useState('friend'); // 'friend' or 'guest'
  const [inputAnim] = useState(new Animated.Value(1));
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [nearbyCourses, setNearbyCourses] = useState([]);
  const [showNearbyAnim] = useState(new Animated.Value(0));

  // On mount, set the host as Player 1
  useEffect(() => {
    if (user && profile) {
      setPlayers([
        {
          type: 'host',
          userId: user.id,
          name: profile.full_name || profile.username || user.email,
        },
      ]);
    }
  }, [user, profile]);

  // Debounced course search
  const debouncedCourseSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        setIsLoading(true);
        const results = await searchCourses(query);
        setCourseSearchResults(results);
        setIsLoading(false);
      } else {
        setCourseSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedCourseSearch(courseSearchQuery);
  }, [courseSearchQuery, debouncedCourseSearch]);

  // Add a debounced Supabase user search by username
  const debouncedUserSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 1) {
        const { data, error } = await supabase
          .from('profiles') // or 'users' if that's the correct table
          .select('id, full_name, username')
          .ilike('username', `%${query}%`);
        if (!error && data) {
          // Exclude already-added users
          const filtered = data.filter(u => !players.find(p => p.userId === u.id));
          setPlayerSearchResults(filtered.map(u => ({ userId: u.id, name: u.full_name || u.username, username: u.username })));
        } else {
          setPlayerSearchResults([]);
        }
      } else {
        setPlayerSearchResults([]);
      }
    }, 300),
    [players]
  );

  useEffect(() => {
    debouncedUserSearch(playerSearchQuery);
  }, [playerSearchQuery, debouncedUserSearch]);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Enable location to see nearby courses');
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
      } catch (e) {
        setLocationError('Unable to get location');
      }
    })();
  }, []);

  // Calculate and sort nearby courses when location changes
  useEffect(() => {
    if (location) {
      const coursesWithDistance = SAMPLE_COURSES.map(c => ({
        ...c,
        distance: getDistanceFromLatLonInKm(location.latitude, location.longitude, c.lat, c.lng),
      }));
      const sorted = coursesWithDistance.sort((a, b) => a.distance - b.distance).slice(0, 5);
      setNearbyCourses(sorted);
      Animated.timing(showNearbyAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [location]);

  // Handlers
  const handleSelectCourse = async (course) => {
    setCourseSearchQuery('');
    setCourseSearchResults([]);
    setIsCourseDetailsLoading(true);
    const courseDetails = await getCourseDetails(course.id);
    setIsCourseDetailsLoading(false);
    if (courseDetails?.holes) {
      setSelectedCourse(courseDetails);
    } else {
      Alert.alert('Error', 'Could not fetch course details or this course has no hole information.');
    }
  };

  const addRegisteredPlayer = (user) => {
    if (players.find(p => p.user_id === user.userId)) return;
    setPlayers([...players, { type: 'registered', user_id: user.userId, name: user.name, username: user.username }]);
    setPlayerSearchQuery('');
    setPlayerSearchResults([]);
  };

  const addGuestPlayer = () => {
    if (!guestName.trim()) return;
    setPlayers([...players, { type: 'guest', name: guestName.trim() }]);
    setGuestName('');
  };

  const removePlayer = (idx) => {
    // Prevent removing the host
    if (idx === 0) return;
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const updateGuestName = (idx, name) => {
    setPlayers(players.map((p, i) => (i === idx ? { ...p, name } : p)));
  };

  const handleStartGame = async () => {
    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course.');
      return;
    }
    const validPlayers = players.filter(p => p.name && p.name.trim() !== '');
    if (validPlayers.length < 2) {
      Alert.alert('Error', 'Please add at least one more player.');
      return;
    }
    const gameData = {
      courseName: selectedCourse.course_name,
      totalHoles: selectedCourse.holes.length,
      coursePar: selectedCourse.par,
      players: validPlayers,
      holeData: selectedCourse.holes,
      courseId: selectedCourse.id,
    };
    const newGame = await createGame(gameData);
    if (newGame) {
      navigation.navigate('Active Game');
    }
  };

  // Animate input reveal
  const handleSegmentChange = (mode) => {
    if (addMode === mode) return;
    Animated.timing(inputAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setAddMode(mode);
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handler for "Use This Course"
  const handleUseNearbyCourse = async (course) => {
    setIsCourseDetailsLoading(true);
    const courseDetails = await getCourseDetails(course.id);
    setIsCourseDetailsLoading(false);
    if (courseDetails?.holes) {
      setSelectedCourse(courseDetails);
    } else {
      Alert.alert('Error', 'Could not fetch course details or this course has no hole information.');
    }
  };

  // Render Functions
  const renderSuggestedCourses = () => {
    if (!games || games.length === 0) {
      return (
        <View style={styles.nearbyFallback}>
          <Text style={styles.nearbyFallbackText}>Play a game to see suggested courses here!</Text>
        </View>
      );
    }
    // Get last 3 unique courses by course_name
    const seen = new Set();
    const uniqueCourses = games.filter(g => {
      if (seen.has(g.course_name)) return false;
      seen.add(g.course_name);
      return true;
    }).slice(0, 3);
    return (
      <View>
        <Text style={styles.label}>Suggested Courses</Text>
        {uniqueCourses.map(course => (
          <View key={course.id} style={styles.nearbyCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearbyCourseName}>{course.course_name}</Text>
              <Text style={styles.nearbyCourseMeta}>{course.city || ''} {course.course_par ? `• Par ${course.course_par}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.useCourseBtn} onPress={() => handleUseNearbyCourse(course)}>
              <Text style={styles.useCourseBtnText}>Use This Course</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderCourseSearch = () => (
    <View style={styles.searchSection}>
      <View style={styles.titleWrap}>
        <Text style={styles.brandTitle}>Start a new game</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Search All Courses"
          value={courseSearchQuery}
          onChangeText={setCourseSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
        {isLoading && <ActivityIndicator style={styles.loader} />}
      </View>
      {courseSearchResults.length > 0 && (
        <View style={styles.resultsList}>
          {courseSearchResults.map(item => (
            <TouchableOpacity key={item.id} style={styles.resultItem} onPress={() => handleSelectCourse(item)}>
              <Text style={styles.resultText}>{item.course_name}</Text>
              <Text style={styles.resultSubtext}>{item.location?.city}, {item.location?.state}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {renderSuggestedCourses()}
    </View>
  );

  const renderSelectedCourse = () => (
    <View style={styles.selectedCourseCard}>
        <Ionicons name="golf-outline" size={32} color={COLORS.primary} />
        <View style={styles.selectedCourseInfo}>
            <Text style={styles.selectedCourseName}>{selectedCourse.course_name}</Text>
            <Text style={styles.selectedCourseDetails}>
                {selectedCourse.holes.length} holes • Par {selectedCourse.holes.reduce((acc, h) => acc + h.par, 0)}
            </Text>
        </View>
        <TouchableOpacity onPress={() => setSelectedCourse(null)}>
            <Ionicons name="close-circle" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {isCourseDetailsLoading ? <ActivityIndicator size="large" /> : (!selectedCourse ? renderCourseSearch() : renderSelectedCourse())}
          {selectedCourse && (
            <View>
              <Text style={styles.label}>Players</Text>
              {/* Player List */}
              {players.map((player, idx) => (
                <PlayerCard
                  key={idx}
                  name={player.name}
                  avatarUrl={player.avatarUrl}
                  isHost={player.type === 'host'}
                  isRegistered={player.type === 'registered'}
                  isGuest={player.type === 'guest'}
                  editable={player.type === 'guest'}
                  value={player.name}
                  onChangeText={text => player.type === 'guest' ? updateGuestName(idx, text) : null}
                  placeholder={player.type === 'host' ? 'You (Host)' : player.type === 'registered' ? player.username : `Guest ${idx}`}
                  onRemove={idx > 0 ? () => removePlayer(idx) : undefined}
                />
              ))}
              {/* Add Player Segmented Control */}
              <View style={styles.segmentedControlWrap}>
                <Animated.View style={[styles.segmentedControl, { shadowOpacity: 0.12, shadowRadius: 8, elevation: 2 }]}> 
                  <TouchableOpacity
                    style={[styles.segment, addMode === 'friend' && styles.segmentSelected]}
                    onPress={() => handleSegmentChange('friend')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentText, addMode === 'friend' && styles.segmentTextSelected]}>+ Friend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.segment, addMode === 'guest' && styles.segmentSelected]}
                    onPress={() => handleSegmentChange('guest')}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentText, addMode === 'guest' && styles.segmentTextSelected]}>+ Guest</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
              {/* Animated Input Reveal */}
              <Animated.View style={{ opacity: inputAnim, transform: [{ scale: inputAnim }] }}>
                {addMode === 'friend' ? (
                  <View style={{ marginBottom: 40, position: 'relative', marginTop: 8 }}>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Search by name or username"
                      value={playerSearchQuery}
                      onChangeText={setPlayerSearchQuery}
                      placeholderTextColor="#aaa"
                    />
                    {playerSearchResults.length > 0 && (
                      <View style={styles.resultsList}>
                        {playerSearchResults.map(user => (
                          <TouchableOpacity key={user.userId} style={styles.resultItem} onPress={() => addRegisteredPlayer(user)}>
                            <Text style={styles.resultText}>{user.name} <Text style={{color: COLORS.textLight}}>@{user.username}</Text></Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {/* FAB for adding friend (disabled for now, as selection is from list) */}
                  </View>
                ) : (
                  <View style={{ marginBottom: 40, position: 'relative', marginTop: 8 }}>
                    <TextInput
                      style={styles.modernInput}
                      placeholder="Guest Name"
                      value={guestName}
                      onChangeText={setGuestName}
                      placeholderTextColor="#aaa"
                    />
                    {/* FAB for adding guest */}
                    <TouchableOpacity
                      style={styles.fab}
                      onPress={addGuestPlayer}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </Animated.View>
              <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 24, paddingTop: 60, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16,
    paddingRight: 40, // Make space for loader
  },
  loader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  resultsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  resultItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
  },
  resultSubtext: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  selectedCourseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginVertical: 8 },
  selectedCourseInfo: { flex: 1, marginLeft: 12 },
  selectedCourseName: { fontSize: 18, fontWeight: 'bold' },
  selectedCourseDetails: { fontSize: 14, color: COLORS.textLight },
  playerInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  playerInput: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginRight: 8 },
  addPlayerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary, marginTop: 8 },
  addPlayerButtonText: { marginLeft: 8, color: COLORS.primary, fontWeight: 'bold' },
  startButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  startButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  searchSection: {
    marginTop: 0,
    marginBottom: 32,
  },
  titleWrap: {
    alignItems: 'flex-start',
    marginBottom: 8,
    marginTop: 0,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'left',
    marginTop: 0,
    letterSpacing: 0.2,
    fontFamily: 'System',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 2,
  },
  inputWithIcon: {
    backgroundColor: '#f2f3f5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 44,
    paddingRight: 40,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: 8,
    bottom: -28,
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  segmentedControlWrap: {
    marginTop: 8,
    marginBottom: 0,
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    transition: 'background-color 0.2s',
  },
  segmentSelected: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  segmentTextSelected: {
    color: '#fff',
  },
  modernInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 56,
    fontSize: 16,
    paddingHorizontal: 16,
    color: COLORS.text,
    marginBottom: 0,
  },
  nearbyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  nearbyCourseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nearbyCourseMeta: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  useCourseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 12,
  },
  useCourseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  nearbyFallback: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1,
  },
  nearbyFallbackText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  cardBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 0,
  },
});
