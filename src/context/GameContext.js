import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGameHistory();
      console.log('User detected in GameContext:', user.id);
    } else {
      // Clear game state if user logs out
      setActiveGame(null);
      setGames([]);
    }
  }, [user]);

  const fetchGameHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('game_players')
        .select('game:game_id(*), user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Extract the game objects and sort by game.created_at descending
      const games = data.map(gp => gp.game).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setGames(games);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch game history.');
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGame = async (gameData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a game.');
      return null;
    }

    try {
      setLoading(true);
      // 1. Create the main game record
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert([
          {
            user_id: user.id,
            course_name: gameData.courseName,
            course_par: gameData.coursePar,
            hole_count: gameData.totalHoles,
            status: 'active',
            course_id: gameData.courseId,
          },
        ])
        .select()
        .single();

      if (gameError) throw gameError;

      // 2. Add players to the game
      const playerRecords = gameData.players.map((player, index) => ({
        game_id: game.id,
        name: player.name,
        user_id: index === 0 ? user.id : player.user_id || null, // Host gets user.id, others get their user_id if available
      }));

      const { data: createdPlayers, error: playersError } = await supabase
        .from('game_players')
        .insert(playerRecords)
        .select();

      if (playersError) throw playersError;

      // 3. Set the new game as the active game in the context
      const newActiveGame = {
        id: game.id,
        courseName: gameData.courseName,
        totalHoles: gameData.totalHoles,
        holeData: gameData.holeData,
        players: createdPlayers,
        status: 'active',
        currentHole: 1,
        scores: [],
        courseId: gameData.courseId,
      };
      setActiveGame(newActiveGame);

      return newActiveGame;
    } catch (error) {
      Alert.alert('Error', 'Failed to create the game.');
      console.error('Error creating game:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateGame = (gameData) => {
    setActiveGame(gameData);
    setGames(prev => prev.map(game =>
      game.id === gameData.id ? gameData : game
    ));
  };

  const completeGame = async (completedGameData) => {
    if (!user) return;
    try {
      setLoading(true);
      const totalScore = completedGameData.scores.reduce(
        (sum, hole) => sum + (hole.totalStrokes || 0),
        0
      );

      // Calculate user contribution percentage
      let userShots = 0;
      let totalShots = 0;
      console.log('=== USER CONTRIBUTION DEBUG ===');
      console.log('User ID:', user.id);
      console.log('User ID type:', typeof user.id);
      completedGameData.scores.forEach(hole => {
        if (hole.strokes && Array.isArray(hole.strokes)) {
          totalShots += hole.strokes.length;
          const holeUserShots = hole.strokes.filter(s => s.user_id === user.id).length;
          userShots += holeUserShots;
          console.log(`Hole ${hole.hole}: ${holeUserShots}/${hole.strokes.length} user shots`);
          console.log('Sample stroke:', hole.strokes[0]);
        }
      });
      const userContribution = totalShots > 0 ? Math.round((userShots / totalShots) * 100) : 0;
      console.log(`Total: ${userShots}/${totalShots} = ${userContribution}%`);
      console.log('=== END DEBUG ===');

      const { error } = await supabase
        .from('games')
        .update({
          status: 'completed',
          total_score: totalScore,
          completed_at: new Date().toISOString(),
          user_contribution: userContribution,
        })
        .eq('id', completedGameData.id);

      if (error) throw error;

      // ALSO: Insert all the hole scores into the database
      const holeScoreRecords = completedGameData.scores.map(hole => ({
        game_id: completedGameData.id,
        hole_number: hole.hole,
        par: hole.par,
        total_strokes: hole.totalStrokes,
        strokes: JSON.stringify(hole.strokes), // Store the detailed strokes as JSON
      }));

      if (holeScoreRecords.length > 0) {
        const { error: scoresError } = await supabase
          .from('hole_scores')
          .insert(holeScoreRecords);

        if (scoresError) throw scoresError;
      }

      // Refresh the game history to include the newly completed game
      await fetchGameHistory();
      setActiveGame(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the completed game.');
      console.error('Error completing game:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearActiveGame = () => {
    setActiveGame(null);
  };

  const fetchActiveGame = async () => {
    return activeGame;
  };

  const deleteGame = (gameId) => {
    setGames(prev => prev.filter(game => game.id !== gameId));
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(null);
    }
  };

  const saveHoleScore = (holeNumber, strokesForHole, parForHole) => {
    if (!activeGame) return;

    const newScoreForHole = {
      hole: holeNumber,
      par: parForHole,
      strokes: strokesForHole,
      totalStrokes: strokesForHole.length,
    };

    const updatedGame = {
      ...activeGame,
      scores: [...(activeGame.scores || []), newScoreForHole],
      currentHole: activeGame.currentHole + 1,
    };

    setActiveGame(updatedGame);
  };

  // NEW: Check if game is complete
  const isGameComplete = () => {
    if (!activeGame) return false;
    return activeGame.currentHole > activeGame.totalHoles;
  };

  const updateHoleScore = (holeNumber, strokes) => {
    // ... existing code ...
  };

  const value = {
    activeGame,
    games,
    loading,
    createGame,
    updateGame,
    completeGame,
    clearActiveGame,
    fetchActiveGame,
    deleteGame,
    saveHoleScore,
    isGameComplete,
    updateHoleScore
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
