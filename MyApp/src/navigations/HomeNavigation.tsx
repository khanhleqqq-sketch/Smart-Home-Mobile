import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screen/HomeScreen";
import DashboardScreen from "../screen/DashboardScreen";

// 1. Tạo type cho stack
export type HomeStackParamList = {
  Home: undefined;
  Dashboard: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

// 2. Tạo Navigator
const HomeNavigation = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigation;
