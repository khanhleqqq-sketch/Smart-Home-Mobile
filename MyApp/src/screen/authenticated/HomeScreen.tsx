import React from 'react';
import { View, Text, TouchableOpacity, Alert, StatusBar, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { HomeStackParamList } from '../../navigations/HomeNavigation';
import { useAuth } from '../../contexts/AuthContext';
import homeStyle from '../styles/homeStyle';
import { useSqlite } from '../../hooks/customs/useSqlite';


export type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { signOut, profile } = useAuth();
  const {getLoggedAccount} = useSqlite();

  const handleNavigateToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut
        },
      ]
    );
  };

  const handleTestSQlite = async () => {
    const accData =  await getLoggedAccount();
  }
  const QuickActionCard = ({ icon, title, subtitle, onPress, color = '#667eea' }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity style={homeStyle.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={homeStyle.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={homeStyle.cardContent}>
          <Text style={homeStyle.cardIcon}>{icon}</Text>
          <Text style={homeStyle.cardTitle}>{title}</Text>
          <Text style={homeStyle.cardSubtitle}>{subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={homeStyle.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView
          style={homeStyle.scrollView}
          contentContainerStyle={homeStyle.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={homeStyle.headerSection}>
            <View style={homeStyle.headerContent}>
              <View style={homeStyle.welcomeContainer}>
                <Text style={homeStyle.welcomeText}>Welcome back! <Text >{profile!.name}</Text></Text>
                <Text style={homeStyle.title}>🏠 Smart Home</Text>
              </View>
              <TouchableOpacity style={homeStyle.profileButton} onPress={handleSignOut}>
                <View style={homeStyle.avatarContainer}>
                  <Image
                    source={{ uri: profile!.image }}
                    style={homeStyle.avatar}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={homeStyle.sectionContainer}>
            <Text style={homeStyle.sectionTitle}>Quick Actions</Text>
            <View style={homeStyle.quickActionsGrid}>
              <QuickActionCard
                icon="📊"
                title="Dashboard"
                subtitle="Device controls"
                onPress={handleNavigateToDashboard}
                color="#667eea"
              />
              <QuickActionCard
                icon="💡"
                title="Lights"
                subtitle="5 devices"
                onPress={() => Alert.alert('Coming Soon', 'Lights control will be available soon!')}
                color="#f093fb"
              />
              <QuickActionCard
                icon="🌡️"
                title="Climate"
                subtitle="22°C"
                onPress={() => Alert.alert('Coming Soon', 'Climate control will be available soon!')}
                color="#764ba2"
              />
              <QuickActionCard
                icon="🔒"
                title="Security"
                subtitle="Armed"
                onPress={() => Alert.alert('Coming Soon', 'Security system will be available soon!')}
                color="#10b981"
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={homeStyle.sectionContainer}>
            <Text style={homeStyle.sectionTitle}>Recent Activity</Text>
            <View style={homeStyle.activityCard}>
              <Text style={homeStyle.activityText}>🔔 System armed at 10:30 PM</Text>
              <Text style={homeStyle.activityText}>💡 Living room lights turned off</Text>
              <Text style={homeStyle.activityText}>🌡️ Temperature set to 22°C</Text>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={homeStyle.logoutButton} onPress={handleSignOut}>
            <Text style={homeStyle.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>

           <TouchableOpacity style={homeStyle.logoutButton} onPress={handleTestSQlite}>
            <Text style={homeStyle.logoutButtonText}>Test SQLite</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

export default HomeScreen;