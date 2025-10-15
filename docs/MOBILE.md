# Spacer Game - Mobile Development

This project uses Capacitor to deploy the React web app to mobile platforms (Android and iOS).

## Prerequisites

### Android Development

- Android Studio installed
- Android SDK configured
- Android device or emulator

### iOS Development (macOS only)

- Xcode installed
- iOS Simulator or physical iOS device
- CocoaPods installed (`sudo gem install cocoapods`)

## Development Workflow

### 1. Web Development

```bash
# Start web development server
pnpm nx serve client

# Build web app
pnpm nx build client
```

### 2. Mobile Development

#### Build and Sync

```bash
# Build web app and sync with mobile platforms
cd packages/client
npm run cap:build
```

#### Android Development

```bash
# Run on Android device/emulator
npm run cap:android

# Build and run in one command
npm run cap:android:dev
```

#### iOS Development (macOS only)

```bash
# Run on iOS simulator/device
npm run cap:ios

# Build and run in one command
npm run cap:ios:dev
```

## Project Structure

```
packages/client/
├── src/                    # React app source code
├── android/               # Generated Android project
├── ios/                   # Generated iOS project
├── capacitor.config.ts    # Capacitor configuration
└── package.json          # Dependencies and scripts
```

## Key Features

### Cross-Platform Storage

- Uses `localStorage` on web
- Uses Capacitor Preferences on mobile
- Automatic platform detection

### Mobile-Specific Plugins

- `@capacitor/app` - App lifecycle events
- `@capacitor/preferences` - Persistent storage
- `@capacitor/network` - Network status
- `@capacitor/status-bar` - Status bar control

## Configuration

The Capacitor configuration is in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.octadecimal.spacer',
  appName: 'Spacer',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};
```

## Troubleshooting

### Android Issues

- Make sure Android Studio is installed and configured
- Check that Android SDK is properly set up
- Ensure device/emulator is connected and recognized

### iOS Issues

- Make sure Xcode is installed (macOS only)
- Install CocoaPods: `sudo gem install cocoapods`
- Run `pod install` in the ios directory if needed

### Build Issues

- Always run `npm run cap:build` after making changes
- Check that the web build is successful first
- Clear Capacitor cache if needed: `npx cap clean`

## Development Tips

1. **Hot Reload**: Use `npm run cap:android:dev` for faster development
2. **Debugging**: Use Chrome DevTools for Android, Safari Web Inspector for iOS
3. **Testing**: Test on both web and mobile to ensure compatibility
4. **Storage**: The app automatically handles storage differences between platforms

## Next Steps

- Add more mobile-specific features (camera, geolocation, etc.)
- Implement push notifications
- Add mobile-specific UI optimizations
- Set up CI/CD for mobile builds
