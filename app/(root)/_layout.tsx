import { useGlobalContext } from "@/lib/global-provider";
import { ActivityIndicator, SafeAreaView, Text } from "react-native";
import { Redirect, Slot } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
    const { loading, isLogged ,updateEmails} = useGlobalContext();
    
    // Debug logging
    useEffect(() => {
        updateEmails()
        console.log("Auth state:", { loading, isLogged });
    }, [loading, isLogged]);
    
    if (loading) {
        return (
            <SafeAreaView className="bg-white h-full flex justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
                <Text className="mt-4">Verifying authentication...</Text>
            </SafeAreaView>
        );
    }
    
    // Only redirect when loading is complete AND user is not logged in
    if (!isLogged) {
        console.log("Redirecting to sign-in page");
        return <Redirect href="/sign-in" />;
    }
    
    console.log("Rendering authenticated content");
    return <Slot />;
}