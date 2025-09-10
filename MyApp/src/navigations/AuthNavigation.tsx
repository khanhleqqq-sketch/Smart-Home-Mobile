import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screen/commons/LoginScreen";
import VerificationScreen from "../screen/commons/VerificationScreen";
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type AuthStackParamList = {
  Login: undefined;
  Verification: {
    phoneNumber: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;