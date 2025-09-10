import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../navigations/AuthNavigation';
import verificationStyle from '../styles/verificationStyle';


type VerificationScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Verification'>;
type VerificationScreenRouteProp = RouteProp<AuthStackParamList, 'Verification'>;

const VerificationScreen = () => {
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route = useRoute<VerificationScreenRouteProp>();
  const { phoneNumber, confirmation } = route.params;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Verification code must be 6 digits');
      return;
    }

    setLoading(true);
    
    try {
      await confirmation.confirm(verificationCode);
      // Save authenticated user for biometric auth
      await AsyncStorage.setItem('authenticatedUser', JSON.stringify({
        phoneNumber,
        timestamp: Date.now()
      }));
      Alert.alert('Success', 'Phone number verified successfully!');
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    
    try {
      await auth().signInWithPhoneNumber(phoneNumber);
      Alert.alert('Success', 'New verification code sent!');
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Failed to resend verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={verificationStyle.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={verificationStyle.contentContainer}>
          <View style={verificationStyle.headerContainer}>
            <View style={verificationStyle.logoContainer}>
              <Text style={verificationStyle.logoIcon}>📱</Text>
            </View>
            <Text style={verificationStyle.title}>Verify Your Phone</Text>
            <Text style={verificationStyle.subtitle}>
              We sent a 6-digit code to{'\n'}{phoneNumber}
            </Text>
          </View>

          <View style={verificationStyle.inputContainer}>
            <Text style={verificationStyle.inputLabel}>Enter Verification Code</Text>
            <View style={verificationStyle.codeInputContainer}>
              <TextInput
                style={verificationStyle.codeInput}
                placeholder="• • • • • •"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                textAlign="center"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[verificationStyle.verifyButton, loading && verificationStyle.verifyButtonDisabled]} 
            onPress={handleVerifyCode}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <Text style={verificationStyle.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={verificationStyle.resendButton} 
            onPress={handleResendCode}
            disabled={loading}
          >
            <Text style={verificationStyle.resendButtonText}>
              Didn't receive code? Tap to resend
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={verificationStyle.backButton} 
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={verificationStyle.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
};

export default VerificationScreen;