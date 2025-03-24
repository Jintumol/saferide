
import { useState, useRef } from "react"
import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle } from "react-native-svg"
import Icon from "react-native-vector-icons/MaterialIcons"
import { Link } from "expo-router"
import { Animated } from "react-native"
import { useGlobalContext } from "@/lib/global-provider"
import { useEffect } from "react"
import axios from 'axios';
import { Alert } from 'react-native';
import DeviceModal from "../../../components/DeviceConnectionModal";

import useBLE from "../../../lib/useBLE";

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const { width } = Dimensions.get("window")
export default function Index() {
  const { user,emails } = useGlobalContext()

  console.log("hey there",user?.name)

  const [connectionStatus, setConnectionStatus] = useState("Disconnected")
  const [isConnected, setIsConnected] = useState(false)
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const progress = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    location,
} = useBLE();
const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.log(isPermissionsEnabled)
    if (isPermissionsEnabled) {
      console.log("scanning...")
        scanForPeripherals();
    }
};



useEffect(() => {
  if (connectedDevice) {
    // Connected animation
    Animated.timing(progress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setConnectionStatus('Connected');
    });
  } else {
    // Reset to disconnected state
    Animated.timing(progress, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => {
      setConnectionStatus('Disconnected');
    });
  }
}, [connectedDevice]);

// Pulse animation when not connected
useEffect(() => {
  if (!connectedDevice) {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  } else {
    pulseAnim.setValue(1);
  }
}, [connectedDevice, pulseAnim]);

const hideModal = () => {
    setIsModalVisible(false);
};

const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
};

  const sendEmergencyAlert = async () => {
    setIsSendingAlert(true)

   
    
    // Dummy latitude and longitude (you can replace with actual GPS data if needed)
    
      const latitude= location?.latitude||9.7271080
      const longitude= location?.longitude||76.7266070
    
    
    try {
      // Replace with your actual Vercel hosted endpoint
      const response = await axios.post('https://app-mailer.vercel.app/send-alert', {
        username: user?.name || 'Rider',
        emails: emails, // Sending the emails array directly
        latitude: latitude,
        longitude: longitude
      });
      
      //console.log('Alert sent successfully:', response.data);
      
      // Show success feedback to user
      Alert.alert(
        "Alert Sent",
        "Emergency services have been notified of your location.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('Error sending alert:', error);
      
      // Show error message to user
      Alert.alert(
        "Failed to Send Alert",
        "Please try again or call emergency services directly.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSendingAlert(false)
    }
  }

  useEffect(() => {
        if (location) {
            sendEmergencyAlert();
        }
    }, [location]);


  //console.log(connectedDevice)

  // Function to animate the circular progress bar
  

  // Progress circle properties
  const strokeWidth = 10
  const radius = 50
  const circumference = 2 * Math.PI * radius

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Elements */}
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.contentContainer}>
          {/* Header with User Profile */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <Image source={user?.avatar} style={styles.avatar} />

              <View style={styles.userTextContainer}>
                <Text style={styles.welcomeText}>Hello,</Text>
                <Text style={styles.userName}>{user?.name || "Rider"}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Icon name="notifications" size={24} color="white" />
            </TouchableOpacity>
          </View>



          {/* Safety Status Card */}
          <View style={styles.safetyStatusContainer}>
            <Text style={styles.safetyStatusTitle}>Safety Device Status</Text>

            <Animated.View style={[styles.connectionButtonContainer, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity onPress={connectedDevice ? undefined : openModal} style={styles.connectionButton}>
                <Svg height="180" width="180" viewBox="0 0 120 120">
                  <Circle cx="60" cy="60" r={radius} stroke="#333333" strokeWidth={strokeWidth} fill="none" />
                  <AnimatedCircle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={connectedDevice ? "#4CAF50" : "#FF5252"}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [circumference, 0],
                    })}
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.connectionStatusContainer}>
                  <Icon
                    name={connectedDevice ? "bluetooth-connected" : "bluetooth-disabled"}
                    size={32}
                    color={connectedDevice ? "#4CAF50" : "#FF5252"}
                  />
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit={false}
                    style={[styles.connectionStatusText, { color: connectedDevice ? "#4CAF50" : "#FF5252" }]}
                  >
                    {connectionStatus}
                  </Text>
                  <Text style={styles.tapToConnectText}>{connectedDevice ? "Protected" : "Tap to connect"}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            {connectedDevice && (
              <View style={styles.protectionActiveContainer}>
                <Icon name="shield" size={20} color="#4CAF50" />
                <Text style={styles.protectionActiveText}>Accident detection active</Text>
              </View>
            )}
          </View>
          <DeviceModal
                closeModal={hideModal}
                visible={isModalVisible}
                connectToPeripheral={connectToDevice}
                devices={allDevices}
            />
          <TouchableOpacity
              style={styles.sendAlertButton}
              onPress={sendEmergencyAlert}
              disabled={isSendingAlert}
          >
            <LinearGradient colors={["#D32F2F", "#B71C1C"]} style={styles.emergencyButtonGradient}>
              <Icon name="warning" size={28} color="white" />
              <Text style={styles.emergencyButtonText}>
                {isSendingAlert ? "Sending..." : "Emergency SOS"}
              </Text>
            </LinearGradient>

          </TouchableOpacity>



          {/* Quick Actions Grid */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <View style={styles.actionsGrid}>
              <Link href="/addcontacts" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <View style={[styles.actionIconContainer, { backgroundColor: "#212121" }]}>
                    <Icon name="person-add" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionText}>Emergency Contacts</Text>
                </TouchableOpacity>
              </Link>





              <Link href="/support" asChild>
                <TouchableOpacity style={styles.actionCard}>
                  <View style={[styles.actionIconContainer, { backgroundColor: "#212121" }]}>
                    <Icon name="contact-support" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionText}>Support</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Safety Tips */}
          <View style={styles.safetyTipsContainer}>
            <View style={styles.safetyTipsHeader}>
              <Text style={styles.sectionTitle}>Safety Tips</Text>

            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tipsScrollContent}
            >
              <View style={styles.tipCard}>
                <Icon name="helmet-safety" size={24} color="#4CAF50" />
                <Text style={styles.tipTitle}>Always Wear a Helmet</Text>
                <Text style={styles.tipDescription}>Helmets reduce the risk of head injury by up to 85%.</Text>
              </View>

              <View style={styles.tipCard}>
                <Icon name="visibility" size={24} color="#4CAF50" />
                <Text style={styles.tipTitle}>Stay Visible</Text>
                <Text style={styles.tipDescription}>Use lights and reflective gear, especially at night.</Text>
              </View>

              <View style={styles.tipCard}>
                <Icon name="speed" size={24} color="#4CAF50" />
                <Text style={styles.tipTitle}>Watch Your Speed</Text>
                <Text style={styles.tipDescription}>Adjust your speed based on road conditions.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
        
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 80, // Added extra padding for tab bar
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  userTextContainer: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  sendAlertButton: {
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    flex: 1,
    marginLeft: 8,
    marginTop: 10,
    color: "red",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  safetyStatusContainer: {
    backgroundColor: "#121212",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#333333",
  },
  safetyStatusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  connectionButtonContainer: {
    marginVertical: 10,
  },
  connectionButton: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  connectionStatusContainer: {
    position: "absolute",
    alignItems: "center",
    width: 120, // Set a fixed width to contain the text
  },
  connectionStatusText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center", // Center the text
    includeFontPadding: false, // Removes extra padding
  },
  tapToConnectText: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
  },
  protectionActiveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  protectionActiveText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  emergencyActionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "white",
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickActionsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 50) / 2,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333333",
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  safetyTipsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  safetyTipsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  tipsScrollContent: {
    paddingRight: 20,
  },
  tipCard: {
    width: 200,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#333333",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 10,
    marginBottom: 5,
  },
  tipDescription: {
    fontSize: 12,
    color: "#AAAAAA",
    lineHeight: 18,
  },
})

