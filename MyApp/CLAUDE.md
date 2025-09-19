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
- **Firebase Firestore** (@react-native-firebase/firestore) for user data storage
- **React Native Reanimated** for animations
- **React Native Gesture Handler** for touch interactions
- **Jest** for testing with React Test Renderer

### Authentication Architecture
- **Two-tier authentication system**: Firebase Auth + Firestore user profiles
- **SMS-based authentication** with phone number verification
- **AuthContext** (`src/contexts/AuthContext.tsx`) provides global auth state management
- **User types** defined in `src/types/User.ts` with support for multiple auth methods (SMS, Face)
- **Custom hooks** (`src/hooks/customs/useUsers.ts`) for Firestore user operations

### Navigation Architecture
- `App.tsx` - Main app component with NavigationContainer and AuthProvider wrapper
- **Conditional navigation**: AuthNavigation for unauthenticated, HomeNavigation for authenticated users
- **AuthNavigation** (`src/navigations/AuthNavigation.tsx`) - Login → Verification flow
- **HomeNavigation** (`src/navigations/HomeNavigation.tsx`) - Home → Dashboard flow
- TypeScript navigation types defined with strict param list typing

### Project Structure
```
src/
├── contexts/
│   └── AuthContext.tsx       # Global auth state & Firebase integration
├── navigations/
│   ├── AuthNavigation.tsx    # Unauthenticated user flow
│   └── HomeNavigation.tsx    # Authenticated user flow  
├── screen/
│   ├── commons/              # Screen components
│   └── styles/               # Screen-specific styles
├── hooks/
│   └── customs/              # Custom hooks (useUsers for Firestore)
└── types/
    └── User.ts               # User interface definitions
```

### Firebase Integration
- **Authentication**: Phone number verification with SMS codes
- **Firestore**: User profile storage with real-time listeners
- **User creation flow**: Auto-creates Firestore document on first Firebase Auth
- **Multi-auth support**: Designed for SMS + Face recognition (Face auth partially implemented)

### Configuration Files
- `tsconfig.json` - Extends standard React Native TypeScript config with strict mode
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