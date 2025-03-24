
import { useState } from "react";
import BluetoothSerial, {BluetoothDevice, BluetoothDeviceReadEvent} from "react-native-bluetooth-classic";
import {Linking, PermissionsAndroid, Platform} from "react-native";
//import { useBluetoothClassic } from 'react-native-bluetooth-classic';
//import RNBluetoothClassic from 'react-native-bluetooth-classic';
import { Alert } from 'react-native';

interface BluetoothClassicApi {
    requestPermissions(): Promise<boolean>;
    scanForPeripherals(): void;
    allDevices: BluetoothDevice[];
    connectToDevice: (device: Device) => Promise<void>;
    connectedDevice: Device | null;
    location: { latitude: number; longitude: number } | null;
}

interface Device {
    id: string;
    name: string;
    bonded?: Boolean;
}

function useBluetoothClassic(): BluetoothClassicApi {
    const [allDevices, setAllDevices] = useState<BluetoothDevice[]>([]);
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);



    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                if (Platform.Version >= 31) {
                    const scanGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                        {
                            title: "Bluetooth Scan Permission",
                            message: "This app needs Bluetooth scan permission to find nearby devices.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK",
                        }
                    );

                    const connectGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                        {
                            title: "Bluetooth Connect Permission",
                            message: "This app needs Bluetooth connect permission to pair with devices.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK",
                        }
                    );

                    return (
                        scanGranted === PermissionsAndroid.RESULTS.GRANTED &&
                        connectGranted === PermissionsAndroid.RESULTS.GRANTED
                    );
                } else {
                    const locationGranted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                        {
                            title: "Location Permission",
                            message: "This app needs location permission to scan for Bluetooth devices.",
                            buttonNeutral: "Ask Me Later",
                            buttonNegative: "Cancel",
                            buttonPositive: "OK",
                        }
                    );

                    return locationGranted === PermissionsAndroid.RESULTS.GRANTED;
                }
            } catch (err) {
                console.error("Permission request failed:", err);
                return false;
            }
        }
        return true; // Permissions not required for iOS
    };
    const scanForPeripherals = async () => {
        const hasPermissions = await requestPermissions();

        if (!hasPermissions) {
            console.warn("Permissions not granted for Bluetooth scanning.");
            return;
        }

        try {
            const devices = await BluetoothSerial.getBondedDevices();
            setAllDevices(devices);
            console.log("Discovered Devices:", devices);
        } catch (error) {
            console.error("Error during scan:", error);
        }

    };



    const connectToDevice = async (device: Device) => {
        try {
            const hasPermissions = await requestPermissions();
            if (!hasPermissions) {
                console.warn("Permissions not granted for Bluetooth scanning.");
                return;
            }
            console.log(device.id)

            const isConnected = await BluetoothSerial.connectToDevice(device.id);
            if (isConnected) {
                setConnectedDevice(device);
                console.log(`Connected to ${device.name}`);

                startStreamingData(device);
            }
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    };





    const startStreamingData = async (device:Device) => {
        try {
            const listener = (event: BluetoothDeviceReadEvent) => {
                console.log("Received Data:", event.data);
                const extractedLocation = extractAndValidateLocation(event.data);
                if (extractedLocation) {
                    setLocation(extractedLocation);
                    console.log("Valid Location:", extractedLocation);
                } else {
                    console.warn("Invalid location data received.");
                }
                // Process the received data as needed
            };


            // Subscribe to the data events for the connected device
            BluetoothSerial.onDeviceRead(device.id, listener);
        } catch (error) {
            console.error("Failed to start streaming data:", error);
        }
    };


    const extractAndValidateLocation = (data: string): { latitude: number; longitude: number } | null => {
        const match = data.match(/Lat\s(-?\d+(\.\d+)?),\sLong\s(-?\d+(\.\d+)?)/);
        if (match) {
            const latitude = parseFloat(match[1]);
            const longitude = parseFloat(match[3]);

            if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
                return { latitude, longitude };
            }
        }
        return null;
    };



    return {
        requestPermissions,
        scanForPeripherals,
        allDevices,
        connectToDevice,
        connectedDevice,
        location

    };
}

export default useBluetoothClassic;
