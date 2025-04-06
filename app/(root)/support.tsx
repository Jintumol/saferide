import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    StatusBar
} from "react-native";
import axios from "axios"; // Make sure to install axios if not already installed

const Support = ({ user, location }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [isSendingAlert, setIsSendingAlert] = useState(false);
    const [emails, setEmails] = useState([]); // For storing emergency contact emails

    // Pre-fill user name if available
    useEffect(() => {
        if (user?.name) {
            setName(user.name);
        }
    }, [user]);

    const handleSubmit = () => {
        if (!name || !email || !phone || !description) {
            Alert.alert("Error", "Please fill out all fields before submitting.");
            return;
        }
        setModalVisible(true);
    };

    const sendEmergencyAlert = async () => {
        setIsSendingAlert(true);

        // Dummy latitude and longitude (or use actual location if available)
        const latitude = location?.latitude || 37.7749; // San Francisco coordinates as example
        const longitude = location?.longitude || -122.4194;

        try {
            // Replace with your actual Vercel hosted endpoint
            const response = await axios.post('https://mail-api-one.vercel.app/send-support', {

                name: name,
                email: email,
                phoneNumber: phone,
                problemDescription: description,
            });

            // Show success feedback to user
            Alert.alert(
                "Feedback Sent",
                "Thank you for your valuable feedback!",
                [{ text: "OK" }]
            );
        } catch (error) {
            console.error('Error sending alert:', error);

            // Show error message to user
            Alert.alert(
                "Failed to Send Feedback",
                "Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSendingAlert(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Fix White Space at the Top */}
            <StatusBar backgroundColor="#000000" barStyle="light-content" />

            <Text style={styles.header}>Need Support?</Text>

            <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#dddddd"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#dddddd"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor="#dddddd"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Problem description"
                placeholderTextColor="#dddddd"
                value={description}
                onChangeText={setDescription}
                multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={sendEmergencyAlert}>
                <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>

            {/* Emergency Alert Button */}


            {/* Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>
                            Thank you for contacting us. We will provide the needful at the earliest.
                        </Text>
                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000", // Black background
        padding: 20,
        paddingTop: StatusBar.currentHeight || 20, // Prevents content from hiding under the status bar
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "left",
        marginBottom: 20,
        color: "#ffffff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#cccccc",
        padding: 12,
        marginBottom: 15,
        borderRadius: 5,
        fontSize: 16,
        backgroundColor: "#1E1E1E", // Darker gray for better contrast
        color: "#ffffff",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "green",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 15,
    },
    emergencyButton: {
        backgroundColor: "red",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        textAlign: "center",
        marginBottom: 20,
        color: "#000000",
    },
    okButton: {
        backgroundColor: "black",
        padding: 10,
        borderRadius: 5,
        width: "50%",
        alignItems: "center",
    },
});

export default Support;