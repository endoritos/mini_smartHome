import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  //
  //
  //
  // YOUR FIREBASE CONFIG HERE
  //
  //
  //
};

let app;
try {
  app = getApp();
} catch (error) {
  if (error.message.includes("No Firebase App")) {
    app = initializeApp(firebaseConfig);
  } else {
    console.log('idk wat to do') //this just for fun 
    throw error; // Unhandled error, rethrow
  }
}

// Initialize Firebase
const db = getDatabase(app);

export { db, ref, onValue };