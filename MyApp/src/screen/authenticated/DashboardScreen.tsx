import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dashboardStyle from '../styles/dashboardStyle';


const DashboardScreen = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={dashboardStyle.container}>
      <Text style={dashboardStyle.title}>📊 Dashboard</Text>
      <Text style={dashboardStyle.subtitle}>Smart Home Device Controls</Text>
      
      <View style={dashboardStyle.cardContainer}>
        <View style={dashboardStyle.card}>
          <Text style={dashboardStyle.cardTitle}>💡 Lights</Text>
          <Text style={dashboardStyle.cardValue}>5 active</Text>
        </View>
        
        <View style={dashboardStyle.card}>
          <Text style={dashboardStyle.cardTitle}>🌡️ Temperature</Text>
          <Text style={dashboardStyle.cardValue}>22°C</Text>
        </View>
        
        <View style={dashboardStyle.card}>
          <Text style={dashboardStyle.cardTitle}>🔒 Security</Text>
          <Text style={dashboardStyle.cardValue}>Armed</Text>
        </View>
      </View>
      
      <TouchableOpacity style={dashboardStyle.backButton} onPress={handleGoBack}>
        <Text style={dashboardStyle.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};


export default DashboardScreen;