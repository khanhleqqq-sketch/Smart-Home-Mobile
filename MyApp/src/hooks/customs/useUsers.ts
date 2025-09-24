import { useEffect, useState, useCallback } from "react";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { User, AuthMethod } from "../../types/User";

interface UseUsersReturn {
    users: User[];
    fireStoreLoading: boolean;
    error: string | null;
    getUser: (userId: string) => Promise<User | null>;
    createUser: (userData: Omit<User, 'createdAt'>) => Promise<string | null>;
    updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    getUserById: (userId: string) => Promise<User | null>;
}

export function useUsers(): UseUsersReturn {
    const [users, setUsers] = useState<User[]>([]);
    const [fireStoreLoading, setfireStoreLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection("users")
            .onSnapshot(
                (snapshot) => {
                    try {
                        const list: User[] = snapshot.docs.map((doc) => ({
                            id: doc.id,
                            ...(doc.data() as Omit<User, 'id'>),
                        }));
                        setUsers(list);
                        setError(null);
                    } catch (err) {
                        setError("Failed to parse users data");
                        console.error("Error parsing users:", err);
                    } finally {
                        setfireStoreLoading(false);
                    }
                },
                (err) => {
                    setError("Failed to fetch users");
                    console.error("Error fetching users:", err);
                    setfireStoreLoading(false);
                }
            );

        return () => unsubscribe();
    }, []);

    const getUser = useCallback(async (userId: string): Promise<User | null> => {
        try {
            const doc = await firestore().collection("users").doc(userId).get();
            if (doc.exists()) {
                return {
                    id: doc.id,
                    ...(doc.data() as Omit<User, 'id'>),
                };
            }
            return null;
        } catch (err) {
            console.error("Error getting user:", err);
            return null;
        }
    }, []);

    const createUser = useCallback(async (userData: Omit<User, 'createdAt'>): Promise<string | null> => {
        console.log(userData)
        try {
            const docRef = await firestore().collection("users").add({
                ...userData,
                createdAt: firestore.Timestamp.now(),
            });
            return docRef.id;
        } catch (err) {
            console.error("Error creating user:", err);
            setError("Failed to create user");
            return null;
        }
    }, []);

    const updateUser = useCallback(async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<boolean> => {
        try {
            await firestore().collection("users").doc(userId).update(updates);
            return true;
        } catch (err) {
            console.error("Error updating user:", err);
            setError("Failed to update user");
            return false;
        }
    }, []);

    const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
        try {
            await firestore().collection("users").doc(userId).delete();
            return true;
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user");
            return false;
        }
    }, []);

    const getUserById = useCallback(async (userId: string): Promise<User | null> => {
        try {
            const snapshot = await firestore()
                .collection("users")
                .where("id", "==", userId)
                .limit(1)
                .get();
            
            if (snapshot.empty) {
                return null;
            }
            
            const doc = snapshot.docs[0];
            return {
                id: doc.id,
                ...(doc.data() as Omit<User, 'id'>),
            };
        } catch (err) {
            console.error("Error getting user by id:", err);
            return null;
        }
    }, []);

    return {
        users,
        fireStoreLoading,
        error,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        getUserById,
    };
}