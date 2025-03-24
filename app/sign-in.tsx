import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
  } from "react-native"
  import { useState } from "react"
  import { useGlobalContext } from "@/lib/global-provider"
  import { Redirect, router } from "expo-router"
  import { Shield, User, Lock, AlertTriangle, CheckCircle, XCircle } from "lucide-react-native"
  import {  firebaseLogin, firebaseSignup } from "@/lib/appwrite" // Import your firebase auth functions
  
  const SignIn = () => {
    const { loading, isLogged } = useGlobalContext()
  
    // State for modals
    const [signInModalVisible, setSignInModalVisible] = useState(false)
    const [signUpModalVisible, setSignUpModalVisible] = useState(false)
  
    // State for form inputs
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [username, setUsername] = useState("")
  
    // State for status messages
    const [signInStatus, setSignInStatus] = useState({ message: "", isError: false, show: false })
    const [signUpStatus, setSignUpStatus] = useState({ message: "", isError: false, show: false })
  
    if (!loading && isLogged) return <Redirect href="/" />
  
    // Handle sign in submission
    const handleSignIn = async () => {
      // Reset previous status
      setSignInStatus({ message: "", isError: false, show: false })
      
      if (!email || !password) {
        setSignInStatus({
          message: "Please fill in all fields",
          isError: true,
          show: true
        })
        return
      }
  
      try {
        console.log("hi")
        const result = await firebaseLogin(email, password)
        console.log(result)
        
        if (result.success) {
            
          setSignInStatus({
            message: "Signed in successfully!",
            isError: false,
            show: true
          })
          
          // Clear fields and close modal after successful sign in
          setTimeout(() => {
            setSignInModalVisible(false)
            setEmail("")
            setPassword("")
            
            
          }, 1500)
        } else {
          setSignInStatus({
            message: result.success || "Failed to sign in",
            isError: true,
            show: true
          })
        }
      } catch (error) {
        setSignInStatus({
          message: "An unexpected error occurred",
          isError: true,
          show: true
        })
      }
    }
  
    // Handle sign up submission
    const handleSignUp = async () => {
      // Reset previous status
      setSignUpStatus({ message: "", isError: false, show: false })
      
      if (!email || !password || !confirmPassword || !username) {
        setSignUpStatus({
          message: "Please fill in all fields",
          isError: true,
          show: true
        })
        return
      }
  
      if (password !== confirmPassword) {
        setSignUpStatus({
          message: "Passwords do not match",
          isError: true,
          show: true
        })
        return
      }
  
      try {
        const result = await firebaseSignup(email, password, username)
        
        if (result.success) {
          setSignUpStatus({
            message: "Account created successfully!",
            isError: false,
            show: true
          })
          
          // Clear fields and close modal after successful sign up
          setTimeout(() => {
            setSignUpModalVisible(false)
            setEmail("")
            setPassword("")
            setConfirmPassword("")
            setUsername("")
            // Optionally open the sign in modal
            setSignInModalVisible(true)
          }, 1500)
        } else {
          setSignUpStatus({
            message: result.message || "Failed to create account",
            isError: true,
            show: true
          })
        }
      } catch (error) {
        setSignUpStatus({
          message: "An unexpected error occurred",
          isError: true,
          show: true
        })
      }
    }
  
    // Status message component
    const StatusMessage = ({ status }:any) => {
      if (!status.show) return null
      
      return (
        <View style={[
          styles.statusContainer,
          status.isError ? styles.errorStatus : styles.successStatus
        ]}>
          {status.isError ? 
            <XCircle size={18} color="#fff" style={styles.statusIcon} /> :
            <CheckCircle size={18} color="#fff" style={styles.statusIcon} />
          }
          <Text style={styles.statusText}>{status.message}</Text>
        </View>
      )
    }
  
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.mainContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Shield size={80} color="#FF5722" style={styles.logo} />
              <Text style={styles.title}>SAFE RIDE</Text>
              <Text style={styles.subtitle}>Bike Accident Detection System</Text>
              <Text style={styles.description}>
                Ride with confidence knowing you're protected with real-time accident detection and emergency response
              </Text>
            </View>
  
            {/* Button Section */}
            <View style={styles.buttonSection}>
              <Text style={styles.loginText}>Access your account</Text>
  
              {/* Sign In Button */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => setSignInModalVisible(true)}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
  
              {/* Sign Up Button */}
              <TouchableOpacity 
                style={[styles.button, styles.signUpButton]} 
                onPress={() => setSignUpModalVisible(true)}
              >
                <Text style={[styles.buttonText, styles.signUpButtonText]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
  
            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <AlertTriangle size={24} color="#FF5722" />
                <Text style={styles.featureText}>Automatic Crash Detection</Text>
              </View>
              <View style={styles.featureItem}>
                <CheckCircle size={24} color="#FF5722" />
                <Text style={styles.featureText}>Emergency Contact Alerts</Text>
              </View>
            </View>
          </ScrollView>
  
          {/* Sign In Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={signInModalVisible}
            onRequestClose={() => {
              setSignInModalVisible(false)
              setSignInStatus({ message: "", isError: false, show: false })
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Sign In</Text>
  
                {/* Status Message */}
                <StatusMessage status={signInStatus} />
  
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
  
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
  
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setSignInModalVisible(false)
                      setEmail("")
                      setPassword("")
                      setSignInStatus({ message: "", isError: false, show: false })
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]} 
                    onPress={handleSignIn}
                  >
                    <Text style={styles.submitButtonText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
  
          {/* Sign Up Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={signUpModalVisible}
            onRequestClose={() => {
              setSignUpModalVisible(false)
              setSignUpStatus({ message: "", isError: false, show: false })
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Create Account</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>
                {/* Status Message */}
                <StatusMessage status={signUpStatus} />
  
                <View style={styles.inputContainer}>
                  <User size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
  
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
  
                <View style={styles.inputContainer}>
                  <Lock size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>
  
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setSignUpModalVisible(false)
                      setEmail("")
                      setPassword("")
                      setConfirmPassword("")
                      setUsername("")
                      setSignUpStatus({ message: "", isError: false, show: false })
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.submitButton]} 
                    onPress={handleSignUp}
                  >
                    <Text style={styles.submitButtonText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    mainContainer: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "space-between",
      padding: 24,
    },
    headerSection: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 40,
    },
    logo: {
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#333333",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: "#666666",
      marginBottom: 16,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: "#666666",
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 24,
    },
    buttonSection: {
      alignItems: "center",
      marginBottom: 40,
    },
    loginText: {
      fontSize: 18,
      color: "#333333",
      marginBottom: 24,
      fontWeight: "500",
    },
    button: {
      backgroundColor: "#FF5722",
      paddingVertical: 16,
      borderRadius: 12,
      width: "100%",
      marginBottom: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    signUpButton: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#FF5722",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "600",
    },
    signUpButtonText: {
      color: "#FF5722",
    },
    featuresSection: {
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      backgroundColor: "#FFF5F2",
      padding: 16,
      borderRadius: 12,
    },
    featureText: {
      marginLeft: 12,
      fontSize: 16,
      color: "#333333",
      fontWeight: "500",
    },
    // Modal styles
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "85%",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 24,
      color: "#333333",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      height: 56,
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      backgroundColor: "#F9F9F9",
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: "100%",
      fontSize: 16,
      color: "#333333",
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 16,
    },
    modalButton: {
      paddingVertical: 14,
      borderRadius: 12,
      width: "48%",
      alignItems: "center",
    },
    cancelButton: {
      backgroundColor: "#F5F5F5",
    },
    submitButton: {
      backgroundColor: "#FF5722",
    },
    cancelButtonText: {
      color: "#666666",
      fontSize: 16,
      fontWeight: "600",
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    // Status message styles
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    successStatus: {
      backgroundColor: "#4CAF50",
    },
    errorStatus: {
      backgroundColor: "#F44336",
    },
    statusText: {
      color: "white",
      fontSize: 14,
      fontWeight: "500",
    },
    statusIcon: {
      marginRight: 8,
    },
  })
  
  export default SignIn