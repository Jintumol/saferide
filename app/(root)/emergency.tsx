import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Emergency = () => {
    const [buttonText, setButtonText] = useState('SOS');
    const [showOptions, setShowOptions] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    const handleSOSPress = () => {
        setShowOptions(true);
    };

    const handleAlert = (type: string) => {
        setButtonText('Alert Sent');
        setAlertSent(true);
        setShowOptions(false);
        console.log(`${type} alert sent`);
    };

    return (
        <View style={styles.container}>
            {!showOptions ? (
                <TouchableOpacity
                    style={[styles.sosButton, alertSent && styles.alertSentButton]}
                    onPress={handleSOSPress}
                >
                    <Text style={[styles.buttonText, alertSent && styles.smallText]}>
                        {buttonText}
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.optionContainer}>
                    <TouchableOpacity style={styles.optionButton} onPress={() => handleAlert('Police')}>
                        <Text style={styles.optionText}>Alert to Police</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.optionButton} onPress={() => handleAlert('Ambulance')}>
                        <Text style={styles.optionText}>Alert to Ambulance</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosButton: {
        backgroundColor: 'red',
        width: 210,
        height: 210,
        borderRadius: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertSentButton: {
        backgroundColor: 'green',
    },
    buttonText: {
        color: 'white',
        fontSize: 70,
        fontWeight: 'bold',
        letterSpacing: 3,
    },
    smallText: {
        fontSize: 30,
    },
    optionContainer: {
        alignItems: 'center',
    },
    optionButton: {
        backgroundColor: 'blue',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: 200,
        alignItems: 'center',
    },
    optionText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Emergency;