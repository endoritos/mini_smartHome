import { initializeApp, getApp } from 'firebase/app';
import { getDatabase, ref, onValue ,set } from 'firebase/database';
import "firebase/database";


const firebaseConfig = {
  apiKey: "AIzaSyC8zFLx8IrsQBwmAiceg8kFolwzvRIi2m4",
  authDomain: "mini-smarthome.firebaseapp.com",
  databaseURL: "https://mini-smarthome-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "mini-smarthome",
  storageBucket: "mini-smarthome.appspot.com",
  messagingSenderId: "481979855555",
  appId: "1:481979855555:web:b16c6dfc455a3854822876"
};

let app;
try {
  app = getApp();
} catch (error) {
  if (error.message.includes("No Firebase App")) {
    app = initializeApp(firebaseConfig);
  } else {
    console.log('idk wat to do')
    throw error; // Unhandled error, rethrow
  }
}

const db = getDatabase(app);

export { db, ref, onValue,set };
