// src/context/GameContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const GameContext = createContext();

export function GameProvider({ children }) {
  const auth = useAuth() || {};
  const user = auth?.user; 
  const [activeGame, setActiveGame] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draftGame, setDraftGame] = useState(null);

  // Fetch recent games when user changes
  useEffect(() => {
    if (user) {
      fetchRecentGames();
      fetchActiveGame();
      fetchDraftGame();
    } else {
      setRecentGames([]);
      setActiveGame(null);
      setDraftGame(null);
    }
  }, [user]);

  // Fetch recent completed games
  const fetchRecentGames = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          game_players (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')  // Use status instead of completed_at
        .order('created_at', { ascending: false })
        .limit(10);
            
      if (error) throw error;
      
      // Transform the data to match your app's expected format
      const transformedGames = data.map(game => ({
        id: game.id,
        courseName: game.course_name,
        holeCount: game.hole_count || 18,
        totalScore: game.total_score,
        players: game.game_players || [],
        date: new Date(game.created_at),
        completed: true,
        completedAt: game.completed_at,
      }));
      
      setRecentGames(transformedGames);
    } catch (error) {
      console.error('Error fetching recent games:', error);
      Alert.alert('Error', 'Failed to load recent games');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active (incomplete) game
  const fetchActiveGame = async () => {
    if (!user) return false;
    
    try {
      console.log("Fetching active game for user:", user.id);
      
      // Get the most recent active game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select(`
          *,
          game_players (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')  // Use status instead of completed_at
        .order('created_at', { ascending: false })
        .limit(1);
      
      console.log("Active game query result:", gameData);
      
      if (gameError) {
        console.error("Error fetching active game:", gameError);
        throw gameError;
      }
      
      if (!gameData || gameData.length === 0) {
        console.log("No active game found");
        setActiveGame(null);
        return false;
      }
      
      // Transform the data to match your app's expected format
      const game = {
        id: gameData[0].id,
        courseName: gameData[0].course_name,
        holeCount: gameData[0].hole_count || 18,
        players: (gameData[0].game_players || []).map(player => ({
          id: player.id,
          name: player.name,
        })),
        currentHole: 1,
        holeScores: [],
        date: new Date(gameData[0].created_at),
        completed: false,
      };
      
      console.log("Setting active game:", game);
      setActiveGame(game);
      return true;
    } catch (error) {
      console.error('Error fetching active game:', error);
      return false;
    }
  };

  // Fetch draft game (if exists)
  const fetchDraftGame = async () => {
    if (!user) return;
    
    try {
      // Get the most recent draft game
      const { data, error } = await supabase
        .from('draft_games')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      setDraftGame(data ? data.game_data : null);
    } catch (error) {
      console.error('Error fetching draft game:', error);
    }
  };

  const createGame = async (gameData) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a game');
      return null;
    }
    
    try {
      setLoading(true);
      
      console.log("Creating game with data:", gameData);
      
      // Create game object with status field
      const gameRecord = {
        user_id: user.id,
        course_name: gameData.courseName,
        hole_count: gameData.holeCount || 18,
        created_at: new Date().toISOString(),
        total_score: 0,
        completed_at: new Date().toISOString(), // Still need a value due to NOT NULL constraint
        status: 'active'  // Add status field to indicate it's active
      };
      
      console.log("Inserting game record:", gameRecord);
      
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert([gameRecord])
        .select()
        .single();
      
      if (gameError) {
        console.error("Game creation error:", gameError);
        throw gameError;
      }
      
      console.log("Game created:", game);
      
      // Add players to the game
      const playerRecords = gameData.players.map(player => ({
        game_id: game.id,
        name: player.name,
      }));
      
      console.log("Adding players:", playerRecords);
      
      const { error: playersError } = await supabase
        .from('game_players')
        .insert(playerRecords);
      
      if (playersError) {
        console.error("Player creation error:", playersError);
        throw playersError;
      }
      
      console.log("Players added successfully");
      
      // Try to force a refresh of active game
      const success = await fetchActiveGame();
      console.log("Active game refreshed:", success ? "Success" : "Failed");
      
      // If fetchActiveGame failed, manually set the active game
      if (!success) {
        console.log("Manually setting active game");
        const activeGameData = {
          id: game.id,
          courseName: game.course_name,
          coursePar: gameData.coursePar || 72, // Use the par from input, not DB
          holeCount: game.hole_count || 18,
          players: gameData.players,
          currentHole: 1,
          holeScores: [],
          date: new Date(game.created_at),
          completed: false
        };
        
        console.log("Setting active game:", activeGameData);
        setActiveGame(activeGameData);
      }
      
      return game.id;
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('Error', 'Failed to create game: ' + error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save or update draft game
  const saveDraftGame = async (draftData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('draft_games')
        .upsert([{
          user_id: user.id,
          game_data: draftData,
          last_updated: new Date().toISOString(),
        }], { onConflict: 'user_id' });
      
      if (error) throw error;
      
      setDraftGame(draftData);
    } catch (error) {
      console.error('Error saving draft game:', error);
    }
  };

  // Clear draft game
  const clearDraftGame = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('draft_games')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setDraftGame(null);
    } catch (error) {
      console.error('Error clearing draft game:', error);
    }
  };

  // Save hole score
  const saveHoleScore = async (gameId, holeNumber, strokes, totalStrokes) => {
    try {
      // First, check if a hole_score record already exists
      const { data: existingHole, error: checkError } = await supabase
        .from('hole_scores')
        .select('id')
        .eq('game_id', gameId)
        .eq('hole_number', holeNumber)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let holeScoreId;
      
      if (existingHole) {
        // Update existing hole score
        const { error: updateError } = await supabase
          .from('hole_scores')
          .update({ total_strokes: totalStrokes })
          .eq('id', existingHole.id);
          
        if (updateError) throw updateError;
        
        holeScoreId = existingHole.id;
        
        // Delete existing strokes for this hole
        const { error: deleteError } = await supabase
          .from('strokes')
          .delete()
          .eq('hole_score_id', holeScoreId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new hole score
        const { data: newHole, error: insertError } = await supabase
          .from('hole_scores')
          .insert([{
            game_id: gameId,
            hole_number: holeNumber,
            total_strokes: totalStrokes,
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        holeScoreId = newHole.id;
      }
      
      // Add strokes
      const strokeRecords = strokes.map(stroke => ({
        hole_score_id: holeScoreId,
        player_name: stroke.playerName,
        stroke_number: stroke.number,
      }));
      
      const { error: strokesError } = await supabase
        .from('strokes')
        .insert(strokeRecords);
        
      if (strokesError) throw strokesError;
      
      return true;
    } catch (error) {
      console.error('Error saving hole score:', error);
      Alert.alert('Error', 'Failed to save hole score');
      return false;
    }
  };

  // Complete a game
  const completeGame = async (gameId, totalScore) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('games')
        .update({ 
          total_score: totalScore,
          completed_at: new Date().toISOString(),
          status: 'completed'  // Update status to completed
        })
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Refresh game lists
      await fetchRecentGames();
      await fetchActiveGame();
      
      return true;
    } catch (error) {
      console.error('Error completing game:', error);
      Alert.alert('Error', 'Failed to complete game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete a game
  const deleteGame = async (gameId) => {
    try {
      setLoading(true);
      
      // Due to cascade deletes in your schema, deleting the game
      // should also delete related records in other tables
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);
        
      if (error) throw error;
      
      // Update local state
      setRecentGames(recentGames.filter(game => game.id !== gameId));
      if (activeGame?.id === gameId) {
        setActiveGame(null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting game:', error);
      Alert.alert('Error', 'Failed to delete game');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update active game (in-memory only, not in database)
  const updateGame = (updatedGameData) => {
    if (!user) return;
    setActiveGame(updatedGameData);
  };

  return (
    <GameContext.Provider
      value={{
        activeGame,
        recentGames,
        draftGame,
        loading,
        createGame,
        fetchActiveGame,
        saveDraftGame,
        clearDraftGame,
        saveHoleScore,
        completeGame,
        deleteGame,
        updateGame,
        refreshGames: () => {
          fetchRecentGames();
          fetchActiveGame();
        },
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => useContext(GameContext);