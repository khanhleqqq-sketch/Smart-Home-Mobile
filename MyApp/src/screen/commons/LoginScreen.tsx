import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import TouchID from 'react-native-touch-id';
import AsyncStorage from '@react-native-async-storage/async-storage';
import loginStyle from '../styles/loginStyle';
import auth from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../navigations/AuthNavigation';


type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const AuthIcon = ({ type }: { type: 'face' | 'sms' }) => (
  <View style={loginStyle.iconContainer}>
    <Text style={loginStyle.iconText}>
      {type === 'face' ? '👤' : '📱'}
    </Text>
  </View>
);

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      setBiometricSupported(!!biometryType);
    } catch (error) {
      setBiometricSupported(false);
    }
  };

  const handleFaceID = async () => {
    if (!biometricSupported) {
      Alert.alert('Biometric Not Available', 'Face ID/Touch ID is not available on this device');
      return;
    }

    setLoading(true);
    
    try {
      const optionalConfigObject = {
        title: 'Smart Home Authentication',
        subTitle: 'Use your biometric to access Smart Home',
        sensorDescription: 'Use your Touch ID or Face ID to authenticate',
        sensorErrorDescription: 'Failed',
        cancelText: 'Cancel',
        fallbackLabel: 'Use Passcode',
        unifiedErrors: false,
        passcodeFallback: false,
      };

      await TouchID.authenticate('Access Smart Home', optionalConfigObject);
      
      // Check if user has previous authentication
      const savedUser = await AsyncStorage.getItem('authenticatedUser');
      if (savedUser) {
        // Simulate successful auth - in real app, you'd restore the auth session
        Alert.alert('Success', 'Biometric authentication successful!');
        // For demo, we'll continue to show login options
      } else {
        Alert.alert('Setup Required', 'Please authenticate with SMS first to enable biometric login');
        setShowPhoneInput(true);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Authentication Failed', 'Biometric authentication was cancelled or failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSMSAuth = () => {
    setShowPhoneInput(true);
  };

  const handleSendSMS = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');
    if (cleanPhoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const formattedPhoneNumber = cleanPhoneNumber.startsWith('+') 
      ? cleanPhoneNumber 
      : `+84${cleanPhoneNumber.startsWith('0') ? cleanPhoneNumber.slice(1) : cleanPhoneNumber}`;

    setLoading(true);
    
    try {
      const confirmation = await auth().signInWithPhoneNumber(formattedPhoneNumber);
      navigation.navigate('Verification', { 
        phoneNumber: formattedPhoneNumber,
        confirmation 
      });
    } catch (error) {
      console.error('SMS send error:', error);
      Alert.alert('Error', 'Failed to send SMS verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0617d2ff" />
      <LinearGradient
        colors={['#0015ffff', '#1e1f21ff', '#0015ffff']}
        style={loginStyle.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={loginStyle.contentContainer}>
          <View style={loginStyle.headerContainer}>
            <View style={loginStyle.logoContainer}>
              <Text style={loginStyle.logoIcon}>🏠</Text>
            </View>
            <Text style={loginStyle.title}>Smart Home</Text>
            <Text style={loginStyle.subtitle}>
              Welcome back! Choose your preferred authentication method
            </Text>
          </View>

          {!showPhoneInput ? (
            <View style={loginStyle.authOptionsContainer}>
              <TouchableOpacity
                style={[loginStyle.authButton, loginStyle.primaryAuthButton]}
                onPress={handleFaceID}
                disabled={loading || !biometricSupported}
              >
                <AuthIcon type="face" />
                <View style={loginStyle.authButtonContent}>
                  <Text style={loginStyle.authButtonTitle}>
                    {Platform.OS === 'ios' ? 'Face ID' : 'Biometric'}
                  </Text>
                  <Text style={loginStyle.authButtonSubtitle}>
                    Quick & secure access
                  </Text>
                </View>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={loginStyle.authButtonArrow}>→</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[loginStyle.authButton, loginStyle.secondaryAuthButton]}
                onPress={handleSMSAuth}
                disabled={loading}
              >
                <AuthIcon type="sms" />
                <View style={loginStyle.authButtonContent}>
                  <Text style={loginStyle.authButtonTitle}>SMS Verification</Text>
                  <Text style={loginStyle.authButtonSubtitle}>
                    Secure code via SMS
                  </Text>
                </View>
                <Text style={loginStyle.authButtonArrow}>→</Text>
              </TouchableOpacity>

              {!biometricSupported && (
                <Text style={loginStyle.warningText}>
                  Biometric authentication not available on this device
                </Text>
              )}
            </View>
          ) : (
            <View style={loginStyle.phoneInputContainer}>
              <TouchableOpacity 
                style={loginStyle.backButton}
                onPress={() => setShowPhoneInput(false)}
              >
                <Text style={loginStyle.backButtonText}>← Back</Text>
              </TouchableOpacity>
              
              <Text style={loginStyle.inputTitle}>Enter your phone number</Text>
              <View style={loginStyle.inputWrapper}>
                <TextInput
                  style={loginStyle.phoneInput}
                  placeholder="0987654321"
                  placeholderTextColor="#ffffff80"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!loading}
                />
              </View>
              
              <TouchableOpacity 
                style={[loginStyle.sendButton, loading && loginStyle.sendButtonDisabled]} 
                onPress={handleSendSMS}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#667eea" />
                ) : (
                  <Text style={loginStyle.sendButtonText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
              
              <Text style={loginStyle.helperText}>
                We'll send a 6-digit code to verify your number
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </>
  );
};

export default LoginScreen;