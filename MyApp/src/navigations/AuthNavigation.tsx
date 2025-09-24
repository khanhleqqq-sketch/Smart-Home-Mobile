import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screen/commons/LoginScreen";
import HomeScreen from "../screen/authenticated/HomeScreen";

export type AuthStackParamList = {
  Login: undefined;
  Home: undefined
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
};

export default AuthNavigation;