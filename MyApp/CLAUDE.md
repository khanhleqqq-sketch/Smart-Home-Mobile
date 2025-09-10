# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application for Smart Home control, built with React Native 0.81.1 and TypeScript. The app uses React Navigation for screen management and integrates Firebase Authentication for both Android and iOS platforms.

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
- **React Navigation 7.x** with Native Stack Navigator
- **Firebase Authentication** (@react-native-firebase/app, @react-native-firebase/auth)
- **React Native Reanimated** for animations
- **React Native Gesture Handler** for touch interactions
- **Jest** for testing with React Test Renderer

### Navigation Architecture
- `App.tsx` - Main app component with NavigationContainer
- `src/navigations/HomeNavigation.tsx` - Stack navigator configuration with HomeStackParamList type definitions
- Navigation flow: Home → Dashboard screens
- TypeScript navigation types defined for type-safe navigation

### Project Structure
```
src/
├── navigations/
│   └── HomeNavigation.tsx    # Main stack navigator
├── screen/
│   ├── HomeScreen.tsx        # Home screen component
│   └── DashboardScreen.tsx   # Dashboard screen component
App.tsx                       # Root component with NavigationContainer
__tests__/App.test.tsx        # Main app test
```

### Configuration Files
- `tsconfig.json` - Extends @react-native/typescript-config
- `babel.config.js` - Includes react-native-reanimated/plugin
- `metro.config.js`, `jest.config.js` - React Native build configuration
- `Gemfile` - CocoaPods and Ruby dependencies for iOS builds
- Firebase configuration: `android/app/src/google-services.json` and iOS GoogleService-Info.plist

### Testing
- Single test file: `__tests__/App.test.tsx`
- Uses React Test Renderer with ReactTestRenderer.act for async testing
- Run tests with `npm test`

## Platform-Specific Notes

### Firebase Integration
- Android: `google-services.json` configured in android/app/src/
- iOS: GoogleService-Info.plist required for Firebase services
- Google Services plugin configured for authentication

### iOS Development
- Uses Gemfile for managing CocoaPods versions
- Specific version constraints to avoid build failures
- Bundle exec required for pod commands

### Development Environment
- Node.js >=20 required (specified in package.json engines)
- React Native CLI for building and running apps
- Xcode required for iOS development
- Android Studio/SDK required for Android development