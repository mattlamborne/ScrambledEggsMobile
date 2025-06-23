// src/context/GameContext.test.js
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { GameProvider, useGameContext } from './GameContext';
import { AuthProvider } from './AuthContext';
import { supabase } from '../lib/supabase';

// Mock the supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    auth: {
      // Mock any auth functions if needed, though not necessary for this test
    },
  },
}));

// Mock the AuthContext to provide a dummy user
jest.mock('./AuthContext', () => ({
  ...jest.requireActual('./AuthContext'),
  useAuth: () => ({
    user: { id: 'test-user-id' },
    session: { user: { id: 'test-user-id' } },
  }),
}));

const AllTheProviders = ({ children }) => (
  <AuthProvider>
    <GameProvider>{children}</GameProvider>
  </AuthProvider>
);

describe('GameContext Game Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should handle the full lifecycle of a 9-hole game', async () => {
    const { result } = renderHook(() => useGameContext(), { wrapper: AllTheProviders });

    // 1. Create a new game
    const newGameData = {
      courseName: 'Test Course',
      coursePar: 36,
      totalHoles: 9,
      players: [{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }],
    };

    // Mock the return value for the game creation
    supabase.from('games').insert().select().single.mockResolvedValue({
      data: { id: 'game-123', ...newGameData },
      error: null,
    });
    supabase.from('game_players').insert.mockResolvedValue({ error: null });

    await act(async () => {
      await result.current.createGame(newGameData);
    });

    expect(result.current.activeGame).not.toBeNull();
    expect(result.current.activeGame.courseName).toBe('Test Course');

    // 2. Simulate playing 9 holes
    let completedGameData = { ...result.current.activeGame, holeScores: [] };
    for (let i = 1; i <= 9; i++) {
      const holeStrokes = Math.floor(Math.random() * 3) + 3; // Score between 3 and 5
      completedGameData.holeScores.push({
        hole: i,
        par: 4,
        strokes: Array(holeStrokes).fill({}),
        totalStrokes: holeStrokes,
      });
    }

    // 3. Complete the game
    supabase.from('games').update.mockResolvedValue({ error: null });
    supabase.from('games').select.mockResolvedValue({ data: [], error: null }); // for fetchGameHistory

    await act(async () => {
      await result.current.completeGame(completedGameData);
    });

    // 4. Assertions
    expect(result.current.activeGame).toBeNull();
    expect(supabase.from('games').update).toHaveBeenCalledWith({
      status: 'completed',
      total_score: expect.any(Number), // Check that a score was calculated
      completed_at: expect.any(String),
    });
    expect(supabase.from('games').update().eq).toHaveBeenCalledWith('id', 'game-123');
  });
}); 