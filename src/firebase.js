import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCDr-10Z965w-sljUBXi9BSvaQGctUqlC8",
  authDomain: "chat-app-v12.firebaseapp.com",
  projectId: "chat-app-v12",
  storageBucket: "chat-app-v12.appspot.com",
  messagingSenderId: "962281579902",
  appId: "1:962281579902:web:c0fa1d4504e1e3b512ff2f",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
