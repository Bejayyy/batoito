  // Import Firebase SDK functions
  import { initializeApp } from "firebase/app";
  import { getStorage } from "firebase/storage";
  import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
  import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; // ✅ Firestore imports
  import { getDatabase } from "firebase/database";
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBfpYzrAxKERLFgr0q1xLotMncxIcs6QMM",
    authDomain: "bato-norlitz.firebaseapp.com",
    projectId: "bato-norlitz",
    storageBucket:"bato-norlitz.appspot.com", // ✅ Corrected storageBucket
    messagingSenderId: "953475105939",
    appId: "1:953475105939:web:eb7b1d8bfe56c5072a3966",
    measurementId: "G-GE5JWPGT3D"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app); // ✅ Export Authentication
  export const db = getFirestore(app); // ✅ Export Firestore Database
  export const storage = getStorage(app);
  export const realtimeDb = getDatabase(app); // Realtime Database


  // Sign-in function
  export const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in: ", error.message);
      return null;
    }
  };

  // 🔥 Firestore CRUD functions

  // Create a new document
  export const addUser = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, "users"), userData);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Read all documents from "users" collection
  export const getUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Update a document
  export const updateUser = async (userId, updatedData) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, updatedData);
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Delete a document
  export const deleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      console.log("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
