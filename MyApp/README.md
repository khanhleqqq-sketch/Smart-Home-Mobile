# 🏠 Smart Home Mobile App

A modern React Native mobile application for controlling and monitoring smart home devices with Firebase Authentication.

## 📱 Features

- 🔐 **Firebase Authentication** - Secure user authentication for both Android and iOS
- 📱 **Cross-Platform** - Built with React Native for iOS and Android
- 🎨 **Modern UI** - Clean, responsive interface with safe area handling
- ⚡ **Fast Refresh** - Hot reloading for rapid development

## 🛠️ Tech Stack

- **React Native** 0.81.1
- **TypeScript** 5.8.3
- **Firebase** Authentication
- **React Native Safe Area Context**
- **Jest** for testing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** ≥ 20.0.0
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development)
- **CocoaPods** (for iOS dependencies)

> 💡 **Tip**: Follow the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide for detailed installation instructions.

## 🚀 Quick Start

### 1️⃣ Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd MyApp

# Install dependencies
npm install
```

### 2️⃣ iOS Setup (macOS only)

```bash
# Install CocoaPods (first time only)
bundle install

# Install iOS dependencies
cd ios && bundle exec pod install && cd ..
```

### 3️⃣ Start Development Server

```bash
# Start Metro bundler
npm start
```

### 4️⃣ Run the App

#### Android
```bash
# Make sure you have an Android emulator running or device connected
npm run android
```

#### iOS
```bash
# Make sure you have iOS simulator running or device connected
npm run ios
```

## 🧪 Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Metro bundler |
| `npm run android` | Build and run Android app |
| `npm run ios` | Build and run iOS app |
| `npm test` | Run Jest tests |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
MyApp/
├── 📱 App.tsx              # Main app component
├── 🧪 __tests__/           # Test files
├── 🤖 android/             # Android-specific code
├── 🍎 ios/                 # iOS-specific code
├── 🔧 babel.config.js      # Babel configuration
├── 🔧 metro.config.js      # Metro bundler config
├── 🔧 tsconfig.json        # TypeScript config
└── 🔧 jest.config.js       # Jest test config
```

## 🔥 Firebase Configuration

This app uses Firebase Authentication. Make sure you have:

- ✅ Firebase project set up
- ✅ `google-services.json` in `android/app/src/`
- ✅ `GoogleService-Info.plist` in `ios/`

## 🐛 Development Tips

### Hot Reloading
- **Android**: Press `R` twice or `Ctrl/Cmd + M` → Reload
- **iOS**: Press `R` in iOS Simulator

### Common Issues

<details>
<summary>📱 iOS Build Issues</summary>

```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..

# Reinstall pods
cd ios && bundle exec pod install && cd ..
```
</details>

<details>
<summary>🤖 Android Build Issues</summary>

```bash
# Clean Android build
cd android && ./gradlew clean && cd ..

# Reset Metro cache
npx react-native start --reset-cache
```
</details>

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

```bash
# Check code quality
npm run lint

# Format code (if Prettier script exists)
npm run format
```

## 🚀 Building for Production

### Android
```bash
# Generate release APK
cd android && ./gradlew assembleRelease

# Generate release bundle
cd android && ./gradlew bundleRelease
```

### iOS
1. Open `ios/MyApp.xcworkspace` in Xcode
2. Select "Product" → "Archive"
3. Follow Xcode's distribution workflow

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📚 Resources

- 📖 [React Native Documentation](https://reactnative.dev/docs/getting-started)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 📱 [React Native CLI](https://github.com/react-native-community/cli)
- 🧪 [Jest Testing Framework](https://jestjs.io/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
Made with ❤️ for Smart Home automation
</div>