// firebase-init.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyDr45hyxmAx0n7rdkZPsaV-dhC4DG7PgQA",
  authDomain: "esp32---dht22.firebaseapp.com",
  databaseURL: "https://esp32---dht22-default-rtdb.firebaseio.com/",
  projectId: "esp32---dht22",
  storageBucket: "esp32---dht22.appspot.com",
  messagingSenderId: "567307934678",
  appId: "1:567307934678:web:0c91870a50685e1fc6e277",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
