import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { User } from "../types/User";
import Config from "react-native-config";
import { OauthAccount } from "../types/OAuth";

interface AuthContextType {
  firebaseUser: FirebaseAuthTypes.User | null;
  profile: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      forceCodeForRefreshToken: true,
    });
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      setIsLoading(false);

      if (user) {
        // Load profile from Firestore
        const doc = await firestore().collection("users").doc(user.uid).get();
        if (doc.exists()) {
          setProfile({ id: doc.id, ...(doc.data() as Omit<User, "id">) });
        } else {
          // Create new user document for first-time login
          const newUser: Omit<User, "id"> = {
            name: user.displayName || "",
            email: user.email || "",
            authMethods: ["google"],
            googleAuth: {
              email: user.email || "",
              googleId: user.providerData[0]?.uid || "",
              isVerified: true,
              lastVerifiedAt: firestore.Timestamp.now()
            },
            createdAt: firestore.Timestamp.now(),
          };
          await firestore().collection("users").doc(user.uid).set(newUser);
          setProfile({ id: user.uid, ...newUser });
        }
      } else {
        setProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      // Check if device supports Google Play services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      let OAuthAcc: OauthAccount;
      // Sign in with Google
      const reponseFromOauth = await GoogleSignin.signIn();
      if (reponseFromOauth.type == 'success') {
        OAuthAcc = reponseFromOauth.data.user as OauthAccount;
      }else if(reponseFromOauth.type == 'cancelled'){ 
        throw new Error('Thao tác đăng nhập với Google bị gián đoạn');
      }

      // Check if the account exist in the FireStore ?
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const value: AuthContextType = {
    firebaseUser,
    profile,
    isLoading,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
