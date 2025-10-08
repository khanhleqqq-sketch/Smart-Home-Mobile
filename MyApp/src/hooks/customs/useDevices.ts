import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { DeviceInformation } from "../../types/User";

interface UseDeviceReturn {
    devices: DeviceInformation[];
    fireStoreLoading: boolean;
    getDevicesByUserId: (userId: string) => Promise<DeviceInformation[] | null>;
    storeDeviceInfoByUserId: (userId: string, deviceInfo: DeviceInformation) => Promise<boolean>
}

export function useDevices(): UseDeviceReturn {
    const [fireStoreLoading, setfireStoreLoading] = useState(true);
    const [devices, setDevices] = useState<DeviceInformation[]>([]);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection("devices")
            .onSnapshot(
                (snapshot) => {
                    try {
                        const list: DeviceInformation[] = snapshot.docs.map((doc) => ({
                            ...(doc.data() as DeviceInformation),
                        }));
                        setDevices(list);
                    } catch (err) {
                        console.error("Error parsing devices:", err);
                    } finally {
                        setfireStoreLoading(false);
                    }
                },
                (err) => {
                    console.error("Error fetching devices:", err);
                    setfireStoreLoading(false);
                }
            );
        return () => unsubscribe();
    })

    const getDevicesByUserId = async (userId: string): Promise<DeviceInformation[] | null> => {
        try{
            const doc = await firestore().collection("devices").doc(userId).get();
            if(doc.exists()){
                const deviceList = doc.data() as DeviceInformation[];
                return deviceList;
            }
            return null;
        }catch(error){
            console.error("Error fetching devices by userId:", error);
            return null;
        }
    }

    const storeDeviceInfoByUserId = async (userId: string, deviceInfo: DeviceInformation): Promise<boolean> => {
        try{
            await firestore().collection("devices").doc(userId).set(
                deviceInfo
            );
            return true;
        }catch(error){
            console.error("Error storing device info:", error);
            return false;
        }
    }

    return {
        devices,
        fireStoreLoading,
        getDevicesByUserId,
        storeDeviceInfoByUserId
    }

}
