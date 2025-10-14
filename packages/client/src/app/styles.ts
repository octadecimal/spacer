// Design System - Reusable Tailwind Classes
// Organized by component type and purpose

export const layout = {
  // Page layouts
  page: 'min-h-screen bg-gray-900 text-white',
  container: 'max-w-md mx-auto',
  section: 'p-8',

  // Card layouts
  card: 'bg-gray-800 rounded-lg p-6',
  cardSpaced: 'space-y-4',
} as const;

export const typography = {
  // Headings
  h1: 'text-3xl font-bold text-center mb-8',

  // Body text
  label: 'text-sm text-gray-400',
  caption: 'text-xs text-gray-500',
  muted: 'text-xs text-gray-400',

  // Status text
  status: 'font-semibold',
  success: 'text-green-400',
  error: 'text-red-400',
} as const;

export const buttons = {
  // Base button styles
  base: 'w-full py-3 px-4 rounded-lg font-semibold transition-colors',

  // Button states
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  disabled: 'bg-gray-600 text-gray-400 cursor-not-allowed',

  // Button variants
  primaryButton:
    'w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white',
  disabledButton:
    'w-full py-3 px-4 rounded-lg font-semibold transition-colors bg-gray-600 text-gray-400 cursor-not-allowed',
} as const;

export const progress = {
  // Progress bar container
  container: 'w-full bg-gray-700 rounded-full h-2',

  // Progress bar fill
  fill: 'bg-blue-600 h-2 rounded-full transition-all duration-100',

  // Progress info
  info: 'flex justify-between text-sm',
  remaining: 'text-xs text-gray-400 text-center',
} as const;

export const status = {
  // Status indicators
  connected: 'text-green-400',
  disconnected: 'text-red-400',

  // Status containers
  statusContainer: 'text-center',
  statusLabel: 'text-sm text-gray-400',
  statusValue: 'font-semibold',
  playerInfo: 'text-xs text-gray-500 mt-1',
} as const;

export const spacing = {
  // Common spacing patterns
  section: 'space-y-4',
  progress: 'space-y-2',
  status: 'text-center',
} as const;

// Utility function to combine classes conditionally
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

// Status-specific utility functions
export const getStatusColor = (isConnected: boolean): string => {
  return isConnected ? status.connected : status.disconnected;
};

export const getButtonClasses = (isDisabled: boolean): string => {
  return isDisabled ? buttons.disabledButton : buttons.primaryButton;
};
