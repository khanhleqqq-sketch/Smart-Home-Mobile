import React, { createContext, useContext, useEffect, useState, ReactNode, use } from "react";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import DeviceInfo from 'react-native-device-info';
import { DeviceInformation, LocationInfo, User } from "../types/User";
import Config from "react-native-config";
import { OauthAccount } from "../types/OAuth";
import { useUsers } from "../hooks/customs/useUsers";
import { useSqlite } from "../hooks/customs/useSqlite";
import { Alert } from "react-native";





interface AuthContextType {
  profile: User | null;
  isLoading: boolean;
  deviceInfo: DeviceInformation | null;
  signOut: () => Promise<void> ;
  authenticateWithGoogle: (authMethod: "login" | "signup") => Promise<void>;
  getDeviceInfo: () => Promise<DeviceInformation>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // throw new Error("useAuth must be used within an AuthProvider");
    console.warn("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInformation | null>(null);
  const { getUserById, createUser } = useUsers();
  const { storeLoggedAccount, getLoggedAccount, clearAllAccounts } = useSqlite();

  // Configure Google Sign-In 
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      forceCodeForRefreshToken: true,
    });
  }, []);

  // Load profile from SQLite and collect device info on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Collect device info first
        const deviceInfo = await getDeviceInfo();
        // Load stored profile
        const storedAccount = await getLoggedAccount();
        if (storedAccount) {
          // Convert stored account back to User format
          const user: User = {
            id: storedAccount.id,
            name: storedAccount.name,
            email: storedAccount.email,
            image: storedAccount.image,
            authMethods: JSON.parse(storedAccount.authMethods),
            googleAuth: storedAccount.googleAuth ? JSON.parse(storedAccount.googleAuth) : undefined,
            faceAuth: storedAccount.faceAuth ? JSON.parse(storedAccount.faceAuth) : undefined,
            createdAt: firestore.Timestamp.fromDate(new Date(storedAccount.createdAt)),
            deviceInfo: deviceInfo
          };
          console.log(user)
          setProfile(user);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Get location from IP address
  const getLocationFromIP = async (ipAddress: string): Promise<LocationInfo> => {
    try {
      const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,query`);
      const data = await response.json();

      if (data.status === 'success') {
        return {
          latitude: data.lat,
          longitude: data.lon,
          address: `${data.city}, ${data.regionName}, ${data.country}`,
          city: data.city,
          country: data.country,
          postalCode: data.zip,
          region: data.regionName,
        };
      }
    } catch (error) {
      console.warn('IP geolocation error:', error);
    }
    return {};
  };

  // Get Device Information
  const getDeviceInfo = async (): Promise<DeviceInformation> => {
    try {
      // Get ib throw API 
      const ipFromApi = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(err => {
          console.warn('Failed to fetch IP from api.ipify.org:', err);
          return null;
        });
      // Get basic device info
      const [
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        appVersion,
        isEmulator,
        ipAddress
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemName(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
        DeviceInfo.isEmulator(),
        ipFromApi
      ]);

      // Get location from IP address
      const location = ipAddress ? await getLocationFromIP(ipAddress) : {};
      const info: DeviceInformation = {
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        appVersion,
        isEmulator,
        ipAddress,
        location,
      };
      setDeviceInfo(info);
      return info;
    } catch (error) {
      console.error('Error getting device info:', error);
      throw error;
    }
  };

  // Google Authentication
  const authenticateWithGoogle = async (initialAuthMethod: string) => {
    try {
      let authMethod = initialAuthMethod;

      // Ensure device info is available
      let currentDeviceInfo = deviceInfo;
      if (!currentDeviceInfo) {
        currentDeviceInfo = await getDeviceInfo();
      }
      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Sign in with Google
      await GoogleSignin.signOut();
      const reponseFromOauth = await GoogleSignin.signIn();

      if (reponseFromOauth.type == 'cancelled') {
        throw new Error('Thao tác đăng nhập với Google bị gián đoạn');
      } else if (reponseFromOauth.type !== 'success') {
        throw new Error('Google sign-in failed');
      }

      const OAuthAcc = reponseFromOauth.data.user as OauthAccount;
      // Check if the account exist in the FireStore ?
      const userExit: User | null = await getUserById(OAuthAcc.id);
      if (authMethod === "login") {
        if (userExit) {
          await storeLoggedAccount(userExit);
          setProfile(userExit);
        } else {
          const userChoice = await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Tài khoảng không tồn tại",
              "Bạn có muốn đăng ký tài khoản không?",
              [
                { text: "Hủy", onPress: () => resolve(false), style: "cancel" },
                { text: "Đăng ký", onPress: () => resolve(true) }
              ],
              { cancelable: false }
            );
          });

          if (!userChoice) {
            return;
          }
          // User chose to signup - continue to signup flow
          authMethod = "signup";
        }
      } else if (authMethod === "signup") {
        if (userExit) {
          // Signup with existing account
          const userChoice = await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Tài khoản đã tồn tại",
              "Bạn đã có tài khoản với email này. Bạn có muốn đăng nhập không?",
              [
                { text: "Hủy", onPress: () => resolve(false), style: "cancel" },
                { text: "Đăng nhập", onPress: () => resolve(true) }
              ],
              { cancelable: false }
            );
          });

          if (!userChoice) {
            return;
          }
          await storeLoggedAccount(userExit!);
          setProfile(userExit!);
        } else {
          // Signup without existing account - Create new user in Firestore and store that into SQLite
          const newUserData: Omit<User, 'createdAt'> = {
            id: OAuthAcc.id,
            name: `${OAuthAcc.givenName} ${OAuthAcc.familyName}`.trim(),
            email: OAuthAcc.email,
            authMethods: ["google"],
            image: OAuthAcc.photo,
            googleAuth: {
              email: OAuthAcc.email,
              googleId: OAuthAcc.id,
              isVerified: true,
              lastVerifiedAt: firestore.Timestamp.now()
            }
          };
          const newUserId = await createUser(newUserData);
          if (newUserId) {
            const createdUser: User = { id: newUserId, ...newUserData, createdAt: firestore.Timestamp.now() };
            await storeLoggedAccount(createdUser);
            setProfile(createdUser);
          } else {
            throw new Error('Failed to create user in Firestore');
          }
        }
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await clearAllAccounts();
      setProfile(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const value: AuthContextType = {
    profile,
    isLoading,
    deviceInfo,
    signOut,
    authenticateWithGoogle,
    getDeviceInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
