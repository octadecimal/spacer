import { cn } from '@/lib/utils';

// Design System - Reusable Tailwind Classes with shadcn/ui integration
// Organized by component type and purpose

export const layout = {
  // Page layouts
  page: 'min-h-screen bg-background text-foreground',
  container: 'max-w-md mx-auto',
  section: 'p-8',

  // Card layouts (using shadcn/ui Card component)
  card: 'bg-card text-card-foreground rounded-lg border',
  cardSpaced: 'space-y-4',
} as const;

export const typography = {
  // Headings
  h1: 'text-3xl font-bold text-center mb-8',

  // Body text
  label: 'text-sm text-muted-foreground',
  caption: 'text-xs text-muted-foreground',
  muted: 'text-xs text-muted-foreground',

  // Status text
  status: 'font-semibold',
  success: 'text-green-400',
  error: 'text-destructive',
} as const;

export const buttons = {
  // Base button styles (using shadcn/ui Button component)
  base: 'w-full',

  // Button variants
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  disabled: 'bg-muted text-muted-foreground cursor-not-allowed',
} as const;

export const progress = {
  // Progress bar container (using shadcn/ui Progress component)
  container: 'w-full',

  // Progress info
  info: 'flex justify-between text-sm',
  remaining: 'text-xs text-muted-foreground text-center',
} as const;

export const status = {
  // Status indicators
  connected: 'text-green-400',
  disconnected: 'text-destructive',

  // Status containers
  statusContainer: 'text-center',
  statusLabel: 'text-sm text-muted-foreground',
  statusValue: 'font-semibold',
  playerInfo: 'text-xs text-muted-foreground mt-1',
} as const;

export const spacing = {
  // Common spacing patterns
  section: 'space-y-4',
  progress: 'space-y-2',
  status: 'text-center',
} as const;

// Utility function to combine classes conditionally (using shadcn/ui cn utility)
export { cn };

// Status-specific utility functions
export const getStatusColor = (isConnected: boolean): string => {
  return isConnected ? status.connected : status.disconnected;
};

export const getButtonClasses = (isDisabled: boolean): string => {
  return cn(buttons.base, isDisabled ? buttons.disabled : buttons.primary);
};
