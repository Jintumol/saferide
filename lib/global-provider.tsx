import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { fetchEmergencyContactEmails, firebaseLogin, firebaseLogout } from "./appwrite";
import firestore from '@react-native-firebase/firestore';


// Define the enriched user type
type EnrichedUser = {
  uid: string;
  email: string;
  name: string;
    avatar: string;
  contactEmails?: Array<{name: string, email: string}>;
  // Add other fields you need
};

interface GlobalContextType {
    isLogged: boolean;
    user: EnrichedUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<object>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<EnrichedUser>) => Promise<void>;
    
    emails?: string[];
    updateEmails:()=>Promise<void>
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
    children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
    const [user, setUser] = useState<EnrichedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState<string[]>([]);
    
    // Listen to authentication state changes
    useEffect(() => {
      const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
          // First set basic user info from auth
          const basicUser: EnrichedUser = {
            uid: currentUser.uid,
            email: currentUser.email || "unknown@example.com",
            name: "Guest User", // Default name until we fetch from Firestore
            avatar:require('../assets/images/avatar2.png'),
          };
          
          // Set loading state while we fetch additional data
          setLoading(true);
          
          // Fetch additional user data from Firestore
          firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get()
            .then(async (userDoc) => {
              if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Enrich the user object with Firestore data
                const enrichedUser: EnrichedUser = {
                  ...basicUser,
                  name: userData?.username || basicUser.name, // Use username as name
                  contactEmails: userData?.contactEmails || [],
                  // Add any other fields you need from Firestore
                };

                const x=await fetchEmergencyContactEmails();
                setEmails(x)
                
                setUser(enrichedUser);
              } else {
                // No Firestore profile exists, use basic info
                setUser(basicUser);
              }
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
              // If there's an error, still set the user with basic info
              setUser(basicUser);
            })
            .finally(() => {
              setLoading(false);
            });

            
            
        } else {
          // No user is signed in
          setUser(null);
          setLoading(false);
        }
      });
        
        return () => unsubscribe();
    }, []);
    
    // Compute isLogged based on user state
    const isLogged = user !== null;
    
    // Login Functionality
    const login = async (email: string, password: string) => {
        try {
            setLoading(true); // Set loading to true during login
            const userCredential = await firebaseLogin(email, password);
            
            // We don't need to manually update the user state here
            // The auth().onAuthStateChanged listener will handle it
            
            return userCredential;
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false); // Make sure to set loading to false on error
            throw error;
        }
    };

    const updateEmails =async()=>{
      try{
        const x=await fetchEmergencyContactEmails();
        setEmails(x)
      }catch (error) {
        console.error("Logout error:", error);
        setLoading(false); // Make sure to set loading to false on error
        throw error;
    }
    }
    
    // Logout Functionality
    const logout = async () => {
        try {
            setLoading(true); // Set loading to true during logout
            await firebaseLogout();
            
            // We don't need to manually update user state here
            // The auth().onAuthStateChanged listener will handle it
            
        } catch (error) {
            console.error("Logout error:", error);
            setLoading(false); // Make sure to set loading to false on error
            throw error;
        }
    };
    
    // Update User Functionality
    const updateUser = async (userData: Partial<EnrichedUser>) => {
        try {
            if (!user) {
                throw new Error("Cannot update user: No user is logged in");
            }
            
            setLoading(true);
            
            // First, update in Firestore
            const userDocRef = firestore().collection('users').doc(user.uid);
            
            // Prepare the data to update in Firestore
            // Omit fields that shouldn't be stored directly in Firestore
            const { uid, email, ...firestoreData } = userData;
            
            // Update the document in Firestore
            await userDocRef.update(firestoreData);
            
            // Then update the local state
            setUser(prevUser => {
                if (!prevUser) return null;
                return { ...prevUser, ...userData };
            });
            
            setLoading(false);
        } catch (error) {
            console.error("Update user error:", error);
            setLoading(false);
            throw error;
        }
    };
    
    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                user,
                loading,
                login,
                logout,
                updateUser,
                emails,updateEmails
                
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (!context)
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    
    return context;
};

export default GlobalProvider;