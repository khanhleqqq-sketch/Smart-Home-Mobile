import React, { createContext, useContext, useEffect, useState, ReactNode, use } from "react";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User } from "../types/User";
import Config from "react-native-config";
import { OauthAccount } from "../types/OAuth";
import { useUsers } from "../hooks/customs/useUsers";
import { useSqlite } from "../hooks/customs/useSqlite";
import { Alert } from "react-native";

interface AuthContextType {
  profile: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  authenticateWithGoogle: (authMethod: "login" | "signup") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserById, createUser } = useUsers();
  const { storeLoggedAccount, getLoggedAccount, clearAllAccounts } = useSqlite();

  // Configure Google Sign-In 
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      forceCodeForRefreshToken: true,
    });
  }, []);

  // Load profile from SQLite on app start
  useEffect(() => {
    const loadStoredProfile = async () => {
      try {
        const storedAccount = await getLoggedAccount();
        console.log("Logged account from SQLite:", storedAccount);
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
            createdAt: firestore.Timestamp.fromDate(new Date(storedAccount.createdAt))
          };
          console.log(user)
          setProfile(user);
        }
      } catch (error) {
        console.error("Error loading stored profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredProfile();
  }, []);

  // Google Authentication
  const authenticateWithGoogle = async (initialAuthMethod: string) => {
    try {
      let authMethod = initialAuthMethod;
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
          // Login with existing account - Store in SQLite and set profile
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
          // User chose to login - Store in SQLite and set profile
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
            // Store in SQLite and set profile
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
    signOut,
    authenticateWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
