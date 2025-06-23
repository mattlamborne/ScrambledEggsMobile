// src/screens/NewGameScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash.debounce';

import { COLORS } from '../constants/colors';
import { useGameContext } from '../context/GameContext';
import GradientBackground from '../components/common/GradientBackground';
import { searchCourses, getCourseDetails } from '../lib/golfApi';

export default function NewGameScreen({ navigation }) {
  const { createGame } = useGameContext();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [players, setPlayers] = useState([{ id: 1, name: '' }, { id: 2, name: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCourseDetailsLoading, setIsCourseDetailsLoading] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(debounce(async (query) => {
    if (query.length > 2) {
      setIsLoading(true);
      console.log(`Searching for: ${query}`);
      const results = await searchCourses(query);
      console.log('API Results:', results);
      setSearchResults(results);
      setIsLoading(false);
    } else {
      setSearchResults([]);
    }
  }, 300), []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Handlers
  const handleSelectCourse = async (course) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsCourseDetailsLoading(true);
    const courseDetails = await getCourseDetails(course.id);
    setIsCourseDetailsLoading(false);
    if (courseDetails?.holes) {
      setSelectedCourse(courseDetails);
    } else {
      Alert.alert('Error', 'Could not fetch course details or this course has no hole information.');
    }
  };
  
  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { id: Date.now(), name: '' }]);
    }
  };

  const removePlayer = (id) => {
    setPlayers(players.filter(p => p.id !== id));
  };
  
  const updatePlayerName = (id, name) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, name } : p)));
  };

  const handleStartGame = async () => {
    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course.');
      return;
    }

    const playerNames = players.filter(p => p.name.trim() !== '');
    if (playerNames.length < 1) {
      Alert.alert('Error', 'Please add at least one player.');
      return;
    }
    
    const gameData = {
      courseName: selectedCourse.course_name,
      totalHoles: selectedCourse.holes.length,
      coursePar: selectedCourse.par,
      players: playerNames,
      holeData: selectedCourse.holes,
    };

    const newGame = await createGame(gameData);
    if (newGame) {
      navigation.navigate('Active Game');
    }
    // The createGame function will show an alert on failure
  };

  // Render Functions
  const renderCourseSearch = () => (
    <View style={styles.searchSection}>
      <Text style={styles.label}>Search for a Course</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g., St Andrews"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoading && <ActivityIndicator style={styles.loader} />}
      </View>

      {searchResults.length > 0 && (
        <FlatList
          style={styles.resultsList}
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectCourse(item)}>
              <Text style={styles.resultText}>{item.course_name}</Text>
              <Text style={styles.resultSubtext}>{item.location?.city}, {item.location?.state}</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Start a New Game</Text>
        
        {isCourseDetailsLoading ? <ActivityIndicator size="large" /> : (
            !selectedCourse ? renderCourseSearch() : renderSelectedCourse()
        )}
        
        {selectedCourse && (
          <View>
            <Text style={styles.label}>Players</Text>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerInputContainer}>
                <TextInput
                  style={styles.playerInput}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName(player.id, text)}
                  placeholder={`Player ${index + 1}`}
                />
                {players.length > 2 && (
                  <TouchableOpacity onPress={() => removePlayer(player.id)}>
                    <Ionicons name="remove-circle-outline" size={24} color={COLORS.secondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {players.length < 6 && (
                <TouchableOpacity style={styles.addPlayerButton} onPress={addPlayer}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.addPlayerButtonText}>Add Player</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 200, // Add margin to prevent overlap with player list
  },
  searchContainer: {
    position: 'relative',
  },
});
