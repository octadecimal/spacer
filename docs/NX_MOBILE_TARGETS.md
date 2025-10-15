# Nx Mobile Targets for Spacer Game

This document describes the custom Nx targets created for Capacitor mobile development in the Spacer Game project.

## Available Targets

### Core Mobile Targets

#### `cap:sync`

**Purpose**: Syncs the built web app with mobile platforms

```bash
pnpm nx cap:sync client
```

- Copies web assets to Android and iOS projects
- Updates native plugin configurations
- Updates Capacitor configuration files

#### `cap:build`

**Purpose**: Builds the web app and syncs with mobile platforms

```bash
pnpm nx cap:build client
```

- Runs `nx build client` to build the web app
- Runs `nx cap:sync client` to sync with mobile platforms
- Complete build and sync workflow in one command

### Platform-Specific Targets

#### `cap:android`

**Purpose**: Runs the app on Android device/emulator

```bash
pnpm nx cap:android client
```

- Requires Android Studio and Android SDK
- Requires connected Android device or running emulator

#### `cap:ios`

**Purpose**: Runs the app on iOS simulator/device

```bash
pnpm nx cap:ios client
```

- Requires Xcode (macOS only)
- Requires iOS Simulator or connected iOS device

### Development Workflow Targets

#### `cap:android:dev`

**Purpose**: Complete Android development workflow

```bash
pnpm nx cap:android:dev client
```

- Builds web app (`nx build client`)
- Syncs with mobile platforms (`nx cap:sync client`)
- Runs on Android (`nx cap:android client`)

#### `cap:ios:dev`

**Purpose**: Complete iOS development workflow

```bash
pnpm nx cap:ios:dev client
```

- Builds web app (`nx build client`)
- Syncs with mobile platforms (`nx cap:sync client`)
- Runs on iOS (`nx cap:ios client`)

### Utility Targets

#### `cap:clean`

**Purpose**: Cleans Capacitor cache and temporary files

```bash
pnpm nx cap:clean client
```

- Useful when encountering build issues
- Clears Capacitor cache and temporary files

#### `cap:open:android`

**Purpose**: Opens Android project in Android Studio

```bash
pnpm nx cap:open:android client
```

- Opens the Android project in Android Studio
- Useful for debugging native Android issues

#### `cap:open:ios`

**Purpose**: Opens iOS project in Xcode

```bash
pnpm nx cap:open:ios client
```

- Opens the iOS project in Xcode
- Useful for debugging native iOS issues

## Development Workflow

### 1. Web Development

```bash
# Start web development server
pnpm nx serve client

# Build web app
pnpm nx build client
```

### 2. Mobile Development

#### Quick Development (Recommended)

```bash
# Android development
pnpm nx cap:android:dev client

# iOS development (macOS only)
pnpm nx cap:ios:dev client
```

#### Step-by-Step Development

```bash
# 1. Build and sync
pnpm nx cap:build client

# 2. Run on platform
pnpm nx cap:android client
# or
pnpm nx cap:ios client
```

### 3. Troubleshooting

```bash
# Clean cache if issues occur
pnpm nx cap:clean client

# Rebuild and sync
pnpm nx cap:build client
```

## Target Dependencies

The targets are designed to work together:

```
cap:build
├── nx build client
└── cap:sync
    └── npx cap sync

cap:android:dev
├── cap:build
└── cap:android

cap:ios:dev
├── cap:build
└── cap:ios
```

## Configuration

The targets are configured in `packages/client/project.json`:

```json
{
  "targets": {
    "cap:sync": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx cap sync",
        "cwd": "packages/client"
      }
    },
    "cap:build": {
      "executor": "nx:run-commands",
      "options": {
        "commands": ["nx build client", "nx cap:sync client"],
        "parallel": false
      }
    }
    // ... other targets
  }
}
```

## Prerequisites

### Android Development

- Android Studio installed
- Android SDK configured
- Android device or emulator

### iOS Development (macOS only)

- Xcode installed
- iOS Simulator or physical iOS device
- CocoaPods installed (`sudo gem install cocoapods`)

## Tips

1. **Use `cap:android:dev` and `cap:ios:dev`** for fastest development workflow
2. **Use `cap:clean`** if you encounter build issues
3. **Use `cap:open:android` and `cap:open:ios`** for native debugging
4. **Always run `cap:build`** after making changes to ensure mobile apps are up to date

## Integration with Nx

These targets integrate seamlessly with Nx:

- Use `nx run-many` to run multiple targets
- Use `nx affected` to run targets only for affected projects
- Use `nx graph` to visualize target dependencies
- Use `nx show project client` to see all available targets

## Example Commands

```bash
# Show all available targets
pnpm nx show project client

# Run multiple targets
pnpm nx run-many -t cap:build,cap:sync -p client

# Run targets for affected projects
pnpm nx affected -t cap:build

# Show target graph
pnpm nx graph
```
