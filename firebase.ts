import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB7wSMrZPrb3wa60yz4EZeU72x21ArDnX8",
  authDomain: "luu-but-cnn.firebaseapp.com",
  databaseURL: "https://luu-but-cnn-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "luu-but-cnn",
  storageBucket: "luu-but-cnn.firebasestorage.app",
  messagingSenderId: "198493120405",
  appId: "1:198493120405:web:b11457eacfb50d7d87389c",
  measurementId: "G-SGW8QX96GM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
