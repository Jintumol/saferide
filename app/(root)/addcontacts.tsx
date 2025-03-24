import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from "react-native";
import { useGlobalContext } from "@/lib/global-provider";
import firestore from '@react-native-firebase/firestore';
import { fetchEmergencyContactEmails } from "@/lib/appwrite";

// Define TypeScript interfaces
interface Contact {
  id: string;
  name: string;
  email: string;
}

const App = () => {
  const { user, updateUser } = useGlobalContext(); // Assuming updateUser is available in context
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [data, setData] = useState<Contact[]>([]);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [count,setcount]=useState(0);

  // Fetch contacts when component mounts or user changes
  useEffect(() => {
    const fetchContacts = async () => {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          
          if (userDoc.exists) {
            const userData = userDoc.data();
            const contactEmails = userData?.contactEmails || [];
            
            // Handle both array of objects and array of arrays formats
            const formattedContacts: Contact[] = contactEmails.map((contact: any) => {
              // If contact is an array, convert to object
              if (Array.isArray(contact)) {
                return {
                  id: contact[1] || contact.email || String(Math.random()),
                  name: contact[0] || contact.name || "",
                  email: contact[1] || contact.email || ""
                };
              }
              
              return {
                id: contact.email || String(Math.random()),
                name: contact.name || "",
                email: contact.email || ""
              };
            });
            
            setData(formattedContacts);
          } else {
            setData([]);
          }
        } catch (error) {
          console.error("Failed to fetch contacts:", error);
          Alert.alert("Error", "Failed to fetch contacts");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setData([]);
      }
    };
    
    fetchContacts();
  }, [user,count]);



  // Add New Contact
 // Add New Contact
const handleAdd = async () => {
  if (name.trim() && email.trim() && user?.uid) {
    try {
      // Create new contact object with consistent format
      const newContact = {
        name: name.trim(),
        email: email.trim()
      };
      
      // Get current contactEmails array or initialize as empty array
      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      
      const existingContacts = userDoc.exists && userDoc.data()?.contactEmails 
        ? userDoc.data()?.contactEmails 
        : [];
      
      // Add new contact to the array
      
      const updatedContacts = [...existingContacts, newContact];
      const increment = () => setcount(count + 1);
      increment
      
      // Update Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          contactEmails: updatedContacts
        });
      
      // Update local state with properly formatted contact
      const formattedNewContact: Contact = {
        id: email.trim(), // Using email as ID
        name: name.trim(),
        email: email.trim()
      };
      
      setData(prevData => [...prevData, formattedNewContact]);
      
      // Update global context correctly
      if (updateUser) {
        await updateUser({
          contactEmails: updatedContacts
        });
      }
      
      setName("");
      setEmail("");
      setIsFormVisible(false);
      
    } catch (error) {
      console.error("Failed to add contact:", error);
      Alert.alert("Error", "Failed to add contact");
    }
  } else {
    Alert.alert("Validation Error", "Name and email are required");
  }
};

  // Delete Contact
  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      // Find the contact to delete
      const contactToDelete = data.find(contact => contact.id === id);
      if (!contactToDelete) return;
      
      // Get current contacts from Firestore
      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (!userDoc.exists) return;
      
      const existingContacts = userDoc.data()?.contactEmails || [];
      
      // Filter out the contact to delete
      const updatedContacts = existingContacts.filter((contact: any) => {
        if (Array.isArray(contact)) {
          return contact[1] !== id;
        }
        return contact.email !== id;
      });
      
      // Update Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          contactEmails: updatedContacts
        });
      
      // Update local state
      setData(data.filter(contact => contact.id !== id));
      
      // Update global context if available
      if (updateUser) {
        updateUser({
          ...user,
          contactEmails: updatedContacts
        });
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
      Alert.alert("Error", "Failed to delete contact");
    }
  };

  // Start Editing
  const handleEdit = async (index: number) => {
    setEditIndex(index);
    setName(data[index].name);
    setEmail(data[index].email);
    setIsFormVisible(true);
  };

  // Update Edited Contact
  const handleUpdate = async () => {
    if (editIndex === null || !user?.uid) return;
    
    try {
      const contactToUpdate = data[editIndex];
      
      // Get current contacts from Firestore
      const userDoc = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      
      if (!userDoc.exists) return;
      
      const existingContacts = userDoc.data()?.contactEmails || [];
      
      // Update the contact in the array
      const updatedContacts = existingContacts.map((contact: any) => {
        if (Array.isArray(contact)) {
          if (contact[1] === contactToUpdate.id) {
            return [name.trim(), email.trim()];
          }
          return contact;
        }
        
        if (contact.email === contactToUpdate.id) {
          return {
            name: name.trim(),
            email: email.trim()
          };
        }
        return contact;
      });
      
      // Update Firestore
      await firestore()
        .collection('users')
        .doc(user.uid)
        .update({
          contactEmails: updatedContacts
        });
      
      // Update local state
      const updatedData = [...data];
      updatedData[editIndex] = {
        id: email.trim(), // Update ID if email changed
        name: name.trim(),
        email: email.trim()
      };
      setData(updatedData);
      
      // Update global context if available
      if (updateUser) {
        updateUser({
          ...user,
          contactEmails: updatedContacts
        });
      }
      
      setEditIndex(null);
      setName("");
      setEmail("");
      setIsFormVisible(false);
    } catch (error) {
      console.error("Failed to update contact:", error);
      Alert.alert("Error", "Failed to update contact");
    }
  };

  const renderItem = ({ item, index }: { item: Contact; index: number }) => (
    <View style={styles.row}>
      <View style={styles.contactInfo}>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.emailText}>{item.email}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(index)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Contact Manager</Text>
        <Text style={styles.subtitle}>Manage your contacts with ease</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Action Bar */}
        <View style={styles.actionBar}>
          <Text style={styles.contactCount}>
            {data.length} {data.length === 1 ? "Contact" : "Contacts"}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsFormVisible(!isFormVisible);
              setEditIndex(null);
              setName("");
              setEmail("");
            }}
            style={styles.addButton}
          >
            <Text style={styles.buttonText}>
              {isFormVisible ? "Cancel" : "Add Contact"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        {isFormVisible && (
          <View style={styles.form}>
            <View style={styles.formField}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
              />
            </View>
            <View style={styles.formField}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formActions}>
              {editIndex === null ? (
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={!name.trim() || !email.trim()}
                  style={[
                    styles.formButton,
                    (!name.trim() || !email.trim()) ? styles.disabledButton : styles.addFormButton
                  ]}
                >
                  <Text style={styles.buttonText}>Add Contact</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditIndex(null);
                      setName("");
                      setEmail("");
                      setIsFormVisible(false);
                    }}
                    style={[styles.formButton, styles.cancelButton]}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={!name.trim() || !email.trim()}
                    style={[
                      styles.formButton,
                      (!name.trim() || !email.trim()) ? styles.disabledButton : styles.updateButton
                    ]}
                  >
                    <Text style={styles.buttonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
          </View>
        ) : (
          /* Contact List */
          data.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No contacts yet</Text>
              <Text style={styles.emptyStateSubtitle}>Add your first contact to get started</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setIsFormVisible(true)}
              >
                <Text style={styles.buttonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => String(item.id)}
              style={styles.list}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contactCount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
  },
  addButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  form: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  formField: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  formActions: {
    marginTop: 16,
    alignItems: "flex-end",
  },
  formButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
  addFormButton: {
    backgroundColor: "#34A853",
  },
  updateButton: {
    backgroundColor: "#4285F4",
  },
  cancelButton: {
    backgroundColor: "#9AA0A6",
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  editActions: {
    flexDirection: "row",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  contactInfo: {
    flex: 1,
  },
  idText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
    color: "#666",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#F9AB00",
  },
  deleteButton: {
    backgroundColor: "#EA4335",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyStateButton: {
    backgroundColor: "#4285F4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
  },
});

export default App;