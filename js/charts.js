import { database } from './firebase-init.js';
import { ref, onValue, query, limitToLast } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

// Load the Visualization API and the corechart package.
google.charts.load('current', { 'packages': ['corechart'] });

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
  drawHumidityChart();
  drawTemperatureChart();

  // Redraw the charts when the window is resized
  window.addEventListener('resize', function () {
    drawHumidityChart();
    drawTemperatureChart();
  });
}

function drawHumidityChart() {
  const chartHumidity = new google.visualization.LineChart(document.getElementById('humidityChart'));
  const dbRef = query(ref(database, 'HistoricalData'), limitToLast(240));

  onValue(dbRef, snapshot => {
    // Create a new DataTable for each update
    const dataHumidity = new google.visualization.DataTable();
    dataHumidity.addColumn('string', 'Time');
    dataHumidity.addColumn('number', 'Humidity');

    const rowsHumidity = [];
    let latestHumidity = null;
    let latestTime = null;

    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      rowsHumidity.push([childData.currentTime, childData.humidity]);

      // Store the latest humidity data for display
      latestHumidity = childData.humidity;
      latestTime = childData.currentTime;
    });

    // Add new rows to the data table
    dataHumidity.addRows(rowsHumidity);

    // Define the chart options
    const optionsHumidity = {
      title: 'Humidity over Time',
      curveType: 'function',
      legend: { position: 'bottom' },
      chartArea: { width: '70%', height: '70%' }
    };

    // Clear the chart area and redraw with new data
    chartHumidity.clearChart();
    chartHumidity.draw(dataHumidity, optionsHumidity);

    // Update the displayed humidity and time
    document.getElementById('humidityDisplay').innerText = `Humidity: ${latestHumidity} %`;
    document.getElementById('timeDisplay').innerText = `Last Update: ${latestTime}`;
  });
}

function drawTemperatureChart() {
  const chartTemperature = new google.visualization.LineChart(document.getElementById('temperatureChart'));
  const dbRef = query(ref(database, 'HistoricalData'), limitToLast(240));

  onValue(dbRef, snapshot => {
    // Create a new DataTable for each update
    const dataTemperature = new google.visualization.DataTable();
    dataTemperature.addColumn('string', 'Time');
    dataTemperature.addColumn('number', 'Temperature');

    const rowsTemperature = [];
    let latestTemperature = null;

    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      rowsTemperature.push([childData.currentTime, childData.temperature]);

      // Store the latest temperature data for display
      latestTemperature = childData.temperature;
    });

    // Add new rows to the data table
    dataTemperature.addRows(rowsTemperature);

    // Define the chart options
    const optionsTemperature = {
      title: 'Temperature over Time',
      curveType: 'function',
      legend: { position: 'bottom' },
      chartArea: { width: '70%', height: '70%' }
    };

    // Clear the chart area and redraw with new data
    chartTemperature.clearChart();
    chartTemperature.draw(dataTemperature, optionsTemperature);

    // Update the displayed temperature
    document.getElementById('temperatureDisplay').innerText = `Temperature: ${latestTemperature} °F`;
  });
}
