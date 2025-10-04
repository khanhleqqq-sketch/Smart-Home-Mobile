import SQLite, { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
SQLite.enablePromise(true);
import { User } from '../../types/User';
import { useEffect } from 'react';

interface LoggedAccount {
    id: string;
    name: string;
    email: string;
    authMethods: string;
    googleAuth?: string;
    faceAuth?: string;
    createdAt: string;
    lastLogin: string;
    isActive: boolean;
    image: string;
}

interface SqLiteReturn {
    getDBConnection: (DBName: string) => Promise<SQLiteDatabase | undefined>;
    createTable: () => Promise<void>;
    storeLoggedAccount: (user: User) => Promise<void>;
    getLoggedAccount: () => Promise<LoggedAccount | null>;
    getAllLoggedAccounts: () => Promise<LoggedAccount[]>;
    updateLastLogin: (userId: string) => Promise<void>;
    setActiveAccount: (userId: string) => Promise<void>;
    removeLoggedAccount: (userId: string) => Promise<void>;
    clearAllAccounts: () => Promise<void>;
}

const DB_NAME = 'SmartHomeApp.db';
const TABLE_NAME = 'logged_accounts';

export function useSqlite(): SqLiteReturn {

    const getDBConnection = async (DBName: string = DB_NAME) => {
        try {
            return await SQLite.openDatabase({ name: DBName, location: 'default' });
        } catch (error) {
            console.error("Error getting database from SQLite:", error);
        }
    };

    const createTable = async () => {
        try {
            const db = await getDBConnection();
            if (!db) return;

            await db.executeSql(`
                CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    authMethods TEXT NOT NULL,
                    googleAuth TEXT,
                    faceAuth TEXT,
                    image TEXT,
                    createdAt TEXT NOT NULL,
                    lastLogin TEXT NOT NULL,
                    isActive INTEGER NOT NULL DEFAULT 0
                );
            `);
        } catch (error) {
            console.error("Error creating table:", error);
        }
    };

    const storeLoggedAccount = async (user: User) => {
        try {
            const db = await getDBConnection();
            if (!db || !user.id) return;
            console.log(user)
            await createTable();

            const loggedAccount: LoggedAccount = {
                id: user.id,
                name: user.name,
                email: user.email,
                authMethods: JSON.stringify(user.authMethods),
                image: user.image,
                googleAuth: user.googleAuth ? JSON.stringify(user.googleAuth) : undefined,
                faceAuth: user.faceAuth ? JSON.stringify(user.faceAuth) : undefined,
                createdAt: user.createdAt.toDate().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true
            };

            await db.executeSql(`
                INSERT OR REPLACE INTO ${TABLE_NAME}
                (id, name, email, authMethods, googleAuth, faceAuth, image, createdAt, lastLogin, isActive)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [                                                                                                                                                                                                                                                                                                                                                                                                                          
                loggedAccount.id,
                loggedAccount.name,
                loggedAccount.email,
                loggedAccount.authMethods,
                loggedAccount.googleAuth,
                loggedAccount.faceAuth,
                loggedAccount.image,
                loggedAccount.createdAt,
                loggedAccount.lastLogin,
                loggedAccount.isActive ? 1 : 0
            ]);

            await db.executeSql(`UPDATE ${TABLE_NAME} SET isActive = 0 WHERE id != ?`, [user.id]);
        } catch (error) {
            console.error("Error storing logged account:", error);
        }
    };

    const getLoggedAccount = async (): Promise<LoggedAccount | null> => {
        try {
            const db = await getDBConnection();
            if (!db) return null;
            const [result] = await db.executeSql(`SELECT * FROM ${TABLE_NAME} LIMIT 1`);
            if(result && result.rows.length > 0) {
              return  result.rows.item(0) as LoggedAccount;
            }
        
            return null;
        } catch (error) {
            console.error("Error getting logged account:", error);
            return null;
        }
    };

    const getAllLoggedAccounts = async (): Promise<LoggedAccount[]> => {
        try {
            const db = await getDBConnection();
            if (!db) return [];

            const result = await db.executeSql(`
                SELECT * FROM ${TABLE_NAME} ORDER BY lastLogin DESC
            `);

            const accounts: LoggedAccount[] = [];
            for (let i = 0; i < result[0].rows.length; i++) {
                accounts.push(result[0].rows.item(i) as LoggedAccount);
            }
            return accounts;
        } catch (error) {
            console.error("Error getting all logged accounts:", error);
            return [];
        }
    };

    const updateLastLogin = async (userId: string) => {
        try {
            const db = await getDBConnection();
            if (!db) return;

            await db.executeSql(`
                UPDATE ${TABLE_NAME} SET lastLogin = ? WHERE id = ?
            `, [new Date().toISOString(), userId]);
        } catch (error) {
            console.error("Error updating last login:", error);
        }
    };

    const setActiveAccount = async (userId: string) => {
        try {
            const db = await getDBConnection();
            if (!db) return;

            await db.executeSql(`UPDATE ${TABLE_NAME} SET isActive = 0`);
            await db.executeSql(`UPDATE ${TABLE_NAME} SET isActive = 1 WHERE id = ?`, [userId]);
            await updateLastLogin(userId);
        } catch (error) {
            console.error("Error setting active account:", error);
        }
    };

    const removeLoggedAccount = async (userId: string) => {
        try {
            const db = await getDBConnection();
            if (!db) return;

            await db.executeSql(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [userId]);
        } catch (error) {
            console.error("Error removing logged account:", error);
        }
    };

    const clearAllAccounts = async () => {
        try {
            const db = await getDBConnection();
            if (!db) return;

            await db.executeSql(`DELETE FROM ${TABLE_NAME}`);
        } catch (error) {
            console.error("Error clearing all accounts:", error);
        }
    };

    return {
        getDBConnection,
        createTable,
        storeLoggedAccount,
        getLoggedAccount,
        getAllLoggedAccounts,
        updateLastLogin,
        setActiveAccount,
        removeLoggedAccount,
        clearAllAccounts
    };
}

