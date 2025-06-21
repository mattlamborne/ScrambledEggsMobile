// src/screens/NewGameScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useGameContext } from '../context/GameContext';

export default function NewGameScreen({ navigation }) {
  const { createGame } = useGameContext();
  const [courseName, setCourseName] = useState('');
  const [coursePar, setCoursePar] = useState('');
  const [players, setPlayers] = useState([
    { id: '1', name: '' },
    { id: '2', name: '' }
  ]);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([
        ...players,
        { id: Date.now().toString(), name: '' }
      ]);
    } else {
      Alert.alert('Maximum Players', 'You can add up to 6 players for a scramble game.');
    }
  };

  const removePlayer = (playerId) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== playerId));
    } else {
      Alert.alert('Minimum Players', 'A scramble game requires at least 2 players.');
    }
  };

  const updatePlayerName = (id, name) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };

  const handleStartGame = async () => {
    console.log("Start Game button pressed");
    
    // Validate inputs
    if (!courseName.trim()) {
      Alert.alert('Missing Information', 'Please enter a course name.');
      return;
    }
    
    if (!coursePar.trim() || isNaN(parseInt(coursePar))) {
      Alert.alert('Invalid Par', 'Please enter a valid course par.');
      return;
    }
    
    // Validate players (at least 2 with names)
    const validPlayers = players.filter(player => player.name.trim() !== '');
    if (validPlayers.length < 2) {
      Alert.alert('Player Names', 'Please enter at least 2 player names.');
      return;
    }
    
    // Create new game object
    const newGame = {
      id: Date.now().toString(),
      courseName: courseName.trim(),
      coursePar: parseInt(coursePar.trim()),
      players: validPlayers,
      currentHole: 1,
      scores: [],
      date: new Date(),
      completed: false
    };
    
    console.log("About to create game with data:", newGame);
    
    // Save the game using context - let's bypass the Alert for now to simplify debugging
    const gameId = await createGame(newGame);
    
    console.log("Game created, received ID:", gameId);
    
    if (gameId) {
      console.log("Navigation to Active Game tab");
      // Navigate directly without the alert for now
      navigation.navigate('Active Game');
    } else {
      console.log("Game creation failed");
      Alert.alert('Error', 'Failed to create game.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Game Setup</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Golf Course</Text>
            <View style={styles.courseInputContainer}>
              <TextInput
                style={styles.courseInput}
                placeholder="Enter course name"
                value={courseName}
                onChangeText={setCourseName}
              />
              <TouchableOpacity style={styles.selectButton}>
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Course Par</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter total par (e.g., 72)"
              value={coursePar}
              onChangeText={setCoursePar}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Players</Text>
            {players.map((player, index) => (
              <View key={player.id} style={styles.playerInputContainer}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1} name`}
                  value={player.name}
                  onChangeText={(text) => updatePlayerName(player.id, text)}
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removePlayer(player.id)}
                  disabled={players.length <= 2}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={20} 
                    color={players.length <= 2 ? '#ccc' : '#f44336'} 
                  />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addPlayerButton} 
              onPress={addPlayer}
              disabled={players.length >= 6}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addPlayerText}>Add Player</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={handleStartGame}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  courseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  selectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  selectButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  playerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  removeButton: {
    padding: 12,
    marginLeft: 8,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addPlayerText: {
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});