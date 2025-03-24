import {
    Client,
    Account,
    ID,
    Databases,
    OAuthProvider,
    Avatars,
    Query,
    Storage,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface FirebaseAuthError {
  code: string;
  message: string;
}

interface Contact {
  name: string;
  email: string;
  isEmergency?: boolean;
}

interface EmergencyContact extends Contact {
  isEmergency: true;
}

interface UserData {
  username: string;
  email: string;
  contactEmails?: Contact[];
  emergencyContacts?: EmergencyContact[];
  createdAt?: any;
}



export const config = {
    platform: "com.jsm.restate",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId:process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId:process.env.EXPO_PUBLIC_APPWRITE_GALLERY_COLLECTION_ID,
    reviewsCollectionId:process.env.EXPO_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID,
    agentsCollectionId:process.env.EXPO_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID,
    propertiesCollectionId:process.env.EXPO_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID,
    emergencycontactid:process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID

};

export const client = new Client();
client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export async function login() {
    try {
        const redirectUri = Linking.createURL('/');


        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );

        console.log(response)

        if (!response) throw new Error("Create OAuth2 token failed");




        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri,
        );

        //console.log(browserResult);




        if (browserResult.type !== "success")
            throw new Error("Create browser token failed");

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get("secret")?.toString();
        const userId = url.searchParams.get("userId")?.toString();
        if (!secret || !userId) throw new Error("Create OAuth2 token failed");

        const session = await account.createSession(userId, secret);
        if (!session) throw new Error("Failed to create session");

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function firebaseSignup(
  email: string, 
  password: string, 
  username: string, 
  contactEmails?: Array<{name: string, email: string}>
) {
  try {
    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Create a user data object without any undefined values
    const userData = {
      username: username,
      email: email,
      createdAt: firestore.FieldValue.serverTimestamp()
    };
    
    // Only add contactEmails to userData if it's defined
    if (contactEmails) {
      Object.assign(userData, { contactEmails });
    }
    
    // Store user data in Firestore
    await firestore()
      .collection('users')
      .doc(user.uid)
      .set(userData);
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        username: username
      },
      message: 'User account created successfully!'
    };
  } catch (error) {
    console.error('Error creating user:', error);

    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during sign-up.'
    );
  }
}
export async function fetchEmergencyContactEmails(): Promise<string[]> {
  try {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user found');
    }

    // Get the user document
    const userDoc = await firestore()
      .collection('users')
      .doc(currentUser.uid)
      .get();

    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data() as UserData;
    console.log(userData);

    const allContacts = userData.contactEmails || [];

    // Extract emails into an array
    const contactEmails = allContacts.map(contact => contact.email);
    console.log(contactEmails)
    return contactEmails;

  } catch (error) {
    console.error('Error fetching contact emails:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while fetching contact emails.'
    );
  }
}

export async function firebaseLogin(email: string, password: string) {
  try {
    // 1. Sign in with email and password
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // 2. Fetch additional user details from Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      // Create a basic profile if it doesn't exist (fallback)
      await firestore().collection('users').doc(user.uid).set({
        email: user.email,
        username: '',
        contactEmails: [],
        createdAt: firestore.Timestamp.now()
      });
    }
    
    const userData = userDoc.data();
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email || "unknown@example.com",
        username: userData?.username || '',
        contactEmails: userData?.contactEmails || []
      }
    };
  } catch (error) {
    const firebaseError = error as any;
    let errorMessage = "Failed to log in.";
    
    switch (firebaseError.code) {
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      default:
        errorMessage = firebaseError.message;
    }
    throw new Error(errorMessage);
  }
}

  export async function firebaseLogout() {
    try {
        await auth().signOut();
        return { success: true, message: "Logged out successfully." };
    } catch (error) {
        console.error("Error during logout:", error);
        throw new Error("Failed to log out.");
    }
}

export async function logout() {
    try {
        const result = await account.deleteSession("current");
        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const result = await account.get();
        if (result.$id) {
            const userAvatar = avatar.getInitials(result.name);
           // console.log(result.toString());

            return {
                ...result,
                avatar: userAvatar.toString(),
            };
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getLatestProperties(){
    try {
        const result=await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            [Query.orderAsc('$createdAt'),Query.limit(5)]
        )
        return result.documents;


    }catch(error){
        console.error(error);
        return [];
    }
}

export async function getProperties({filter,query,limit}:{
    filter:string;
    query:string;
    limit?:number;
}){
    try{
        const buildQuery=[Query.orderDesc(('$createdAt'))];

        if(filter&&filter!='All'){
            buildQuery.push(Query.equal('type',filter))
        }

        if (query){
            buildQuery.push(
                Query.or([
                    Query.search('name',query),
                    Query.search('address',query),
                    Query.search('type',query),

                ])
            )
        }

        if (limit){
            buildQuery.push(Query.limit(limit));
        }

        const result=await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
           buildQuery
        )
        return result.documents;

    }catch(error){
        console.error(error);
        return [];
    }
}




export async function getPropertyById({ id }: { id: string }) {
    try {
        const result = await databases.getDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            id
        );
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function addUser(name: string, email: string, userId: string) {
    try {
      const result = await databases.createDocument(
        config.databaseId!,               // Database ID
        config.emergencycontactid!,             // Collection ID (emergencyContactId in your case)
        ID.unique(),                      // Auto-generate unique document ID
        {
          "name":name,
          "email":email,
          "userId":userId
                      // Custom field for emergency contact
        }
      );
  
     // console.log('Document added:', result);
      return result; // Return the created document
    } catch (error) {
      console.error('Error inserting document:', error);
      return null; // Return null in case of error
    }
  }


  export async function getUserContacts(userId: string) {
    try {
      const response = await databases.listDocuments(
        config.databaseId!,
        config.emergencycontactid!,
        [
          Query.equal("userId", userId)
        ]
      );
      
     // console.log('Retrieved contacts:', response.documents);
      return response.documents; // Return the list of documents
    } catch (error) {
      console.error('Error retrieving contacts:', error);
      return []; // Return empty array in case of error
    }
  }


  export async function updateContact(documentId: string, data: { name?: string; email?: string }) {
    try {
      const result = await databases.updateDocument(
        config.databaseId!,
        config.emergencycontactid!,
        documentId,
        data
      );
      //console.log('Document updated:', result);
      return result;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }


  export async function deleteContact(documentId: string) {
    try {
      const result = await databases.deleteDocument(
        config.databaseId!,
        config.emergencycontactid!,
        documentId
      );
     // console.log('Document deleted');
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }


  export async function fetchEmailsByUserId(userId: string) {
    try {
      const response = await databases.listDocuments(
        config.databaseId!,
        config.emergencycontactid!, // Or use the appropriate collection ID if different
        [
          // Filter for documents with matching userId
            Query.equal('userId', userId),
        // Only select the email field to optimize the query
            Query.select(['email', '$id']) // Include document ID for reference
        ]
      );
      
      // Extract just the emails from the response
      const emails = response.documents.map(doc => doc.email);
      
      return emails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      return [];
    }
  }

