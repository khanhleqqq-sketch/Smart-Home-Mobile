# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application for Smart Home control, built with React Native 0.81.1 and TypeScript. The app integrates Firebase Authentication for both Android and iOS platforms.

## Development Commands

### Core Development
- `npm start` - Start Metro bundler
- `npm run android` - Build and run Android app
- `npm run ios` - Build and run iOS app
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint

### iOS Setup Requirements
For first-time iOS development or after updating native dependencies:
```bash
bundle install                # Install CocoaPods (first time only)
bundle exec pod install       # Install iOS dependencies
```

## Architecture & Key Technologies

### Core Stack
- **React Native 0.81.1** with TypeScript
- **Firebase Authentication** (@react-native-firebase/app, @react-native-firebase/auth)
- **Safe Area Context** for proper screen layouts
- **Jest** for testing with React Test Renderer

### Project Structure
- `App.tsx` - Main application component using SafeAreaProvider
- `android/` - Android platform-specific code and configuration
- `ios/` - iOS platform-specific code and configuration
- `__tests__/` - Jest test files

### Configuration Files
- `tsconfig.json` - Extends @react-native/typescript-config
- `.eslintrc.js` - Uses @react-native preset
- `babel.config.js`, `metro.config.js` - React Native build configuration
- Firebase configuration files present in both platforms

### Testing
- Single test file: `__tests__/App.test.tsx`
- Uses React Test Renderer for component testing
- Run tests with `npm test`

## Platform-Specific Notes

### Firebase Integration
- Both Android and iOS have Firebase configuration files
- Google Services configured for authentication

### Development Environment
- Node.js >=20 required
- React Native CLI for building and running apps
- Xcode required for iOS development
- Android Studio/SDK required for Android development