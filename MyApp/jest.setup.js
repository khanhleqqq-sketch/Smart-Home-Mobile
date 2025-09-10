import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-firebase/auth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn(),
      signInWithPhoneNumber: jest.fn(),
    })),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});