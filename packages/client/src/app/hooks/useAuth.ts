import { useState, useEffect } from 'react';
import { Storage } from '@/lib/storage';

/**
 * Custom hook for managing user authentication state.
 * Handles login persistence, state management, and storage operations.
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  /**
   * Initializes authentication state from storage.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUsername = await Storage.getItem('spacer_username');
        if (savedUsername) {
          setUsername(savedUsername);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handles user login.
   * @param newUsername The username to log in with.
   */
  const login = async (newUsername: string): Promise<void> => {
    try {
      await Storage.setItem('spacer_username', newUsername.trim());
      setUsername(newUsername.trim());
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Handles user logout.
   */
  const logout = async (): Promise<void> => {
    try {
      await Storage.removeItem('spacer_username');
      setUsername('');
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    username,
    isInitialized,
    login,
    logout,
  };
}
