// data-fetch.js
import { database } from './firebase-init.js';  // Import the database object from your initialization script
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

const dataRef = ref(database, 'LiveData');  // Update 'your_data_node' to the path where your data is stored

function updateUI(data) {
  const humidityElement = document.getElementById('humidityDisplay');
  const temperatureElement = document.getElementById('temperatureDisplay');
  const timeElement = document.getElementById('timeDisplay');

  humidityElement.textContent = `Humidity: ${data.humidity}%`;
  temperatureElement.textContent = `Temp: ${data.temperature} F`;
  timeElement.textContent = data.currentTime;
}

onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
  updateUI(data);
}, { onlyOnce: true });
