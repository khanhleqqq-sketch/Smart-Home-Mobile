import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Pressable,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import loginStyle from '../styles/loginStyle';
import { useAuth } from '../../contexts/AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../authenticated/HomeScreen';

const AuthIcon = ({ type }: { type: 'face' | 'google' }) => (
  <View style={type === 'google' ? loginStyle.googleIconContainer : loginStyle.faceIconContainer}>
    {type == "face" ? (
      <MaterialCommunityIcons name="face-recognition" color="#fff" size={28} />
    ) : (
      <Image
        source={require('../../assets/Google__G__logo.png')}
        style={{ width: 26, height: 26 }}
        resizeMode="contain"
      />
    )}
  </View>
);

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const { authenticateWithGoogle, profile } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      isLogin ? await authenticateWithGoogle("login") : await authenticateWithGoogle("signup");
      if(profile) {
        navigation.navigate("Home");
      }
    } catch (error: any) {
      Alert.alert('Authentication Failed : ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0617d2ff" />
      <LinearGradient
        colors={['#0f2027', '#203a43', '#2c5364']}
        style={loginStyle.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={loginStyle.contentContainer}>
          <View style={loginStyle.headerContainer}>
            <View style={loginStyle.logoContainer}>
              <Image
                source={require('../../assets/Home_logo.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <Text style={loginStyle.title}>Smart Home</Text>
            <Text style={loginStyle.subtitle}>
              Control your IoT smart home with a phone
            </Text>
            <Text style={loginStyle.description}>
              Seamless, real-time communication powered by MQTT
            </Text>
          </View>

          <View style={loginStyle.authOptionsContainer}>
            <TouchableOpacity
              style={[loginStyle.authButton, loginStyle.googleAuthButton]}
              onPress={handleGoogleAuth}
              disabled={loading}
              activeOpacity={0.8}
            >
              <AuthIcon type="google" />
              <View style={loginStyle.authButtonContent}>
                <Text style={loginStyle.authButtonTitle}>
                  {isLogin ? 'Login with Google' : 'Sign up with Google'}
                </Text>
                <Text style={loginStyle.authButtonSubtitle}>
                  {isLogin ? 'Access your account securely' : 'Create your account instantly'}
                </Text>
              </View>
              {loading ? (
                <ActivityIndicator color="#4285F4" size="small" />
              ) : (
                <View style={loginStyle.authButtonArrowContainer}>

                </View>
              )}
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              {isLogin ? (
                <Text style={loginStyle.footerText}>
                  Don’t have an account?{" "}
                  <Pressable onTouchEnd={() => {
                    setIsLogin(false);
                  }}>
                    <Text style={loginStyle.footerLink}>Sign up</Text>
                  </Pressable>
                </Text>
              ) : (
                <Text style={loginStyle.footerText}>
                  Already have an account?{" "}
                  <Pressable onTouchEnd={() => {
                    setIsLogin(true);
                  }}>
                    <Text style={loginStyle.footerLink}>Login</Text>
                  </Pressable>
                </Text>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

    </>
  );
};

export default LoginScreen;