import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

// src/types/User.ts
export type AuthMethod = "google" | "face";

export interface GoogleAuth {
  email: string;
  googleId: string;
  isVerified: boolean;
  lastVerifiedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface FaceEmbedding {
  id: string;
  vector: number[]; // embedding từ model
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface FaceAuth {
  embeddings: FaceEmbedding[];
  lastVerifiedAt: FirebaseFirestoreTypes.Timestamp | null;
}

export interface DeviceInformation {
  deviceId: string;
  brand: string;
  model: string;
  systemName: string;
  systemVersion: string;
  appVersion: string;
  isEmulator: boolean;
  ipAddress?: string;
  location?: LocationInfo;
}

export interface LocationInfo {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  region?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  image: string;
  authMethods: AuthMethod[];
  googleAuth?: GoogleAuth;
  faceAuth?: FaceAuth;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  deviceInfo?: DeviceInformation
}
