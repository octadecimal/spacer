import { Storage } from '@/lib/storage';
import { LoginForm } from './LoginForm';
import { WelcomeCard } from './WelcomeCard';

/**
 * Props for the Login component.
 */
interface ILoginProps {
  /**
   * Callback when user successfully logs in.
   * @param username The username that was logged in.
   */
  onLogin: (username: string) => void;

  /**
   * Callback when user logs out.
   */
  onLogout: () => void;

  /**
   * Whether the user is currently logged in.
   */
  isLoggedIn: boolean;

  /**
   * Current username if logged in.
   */
  currentUsername?: string;
}

/**
 * Login component handles user authentication and persistence.
 * Stores username in localStorage and provides login/logout functionality.
 */
export function Login({
  onLogin,
  onLogout,
  isLoggedIn,
  currentUsername,
}: ILoginProps) {
  /**
   * Handles login form submission.
   * @param username The username to log in with.
   */
  const handleLogin = async (username: string) => {
    try {
      // Save username to storage
      await Storage.setItem('spacer_username', username);

      // Notify parent component
      onLogin(username);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  /**
   * Handles logout action.
   */
  const handleLogout = async () => {
    try {
      // Clear storage
      await Storage.removeItem('spacer_username');

      // Notify parent component
      onLogout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <WelcomeCard
        username={currentUsername || ''}
        onLogout={handleLogout}
        className="w-full max-w-md mx-auto"
      />
    );
  }

  return (
    <LoginForm onLogin={handleLogin} className="w-full max-w-md mx-auto" />
  );
}
