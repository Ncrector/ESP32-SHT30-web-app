import { database } from './firebase-init.js';
import { ref, onValue, query, limitToLast } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';

// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(drawCharts);

function drawCharts() {
  drawHumidityChart();
  drawTemperatureChart();

  // Redraw the charts when window is resized
  window.addEventListener('resize', function() {
    drawHumidityChart();
    drawTemperatureChart();
  });
}

function drawHumidityChart() {
  const dataHumidity = new google.visualization.DataTable();
  dataHumidity.addColumn('string', 'Time');
  dataHumidity.addColumn('number', 'Humidity');
  
  const optionsHumidity = {
    title: 'Humidity over Time',
    curveType: 'function',
    legend: { position: 'bottom' },
    chartArea: { width: '70%', height: '70%' }
  };

  var chartHumidity = new google.visualization.LineChart(document.getElementById('humidityChart'));
  const dbRef = query(ref(database, 'HistoricalData'), limitToLast(240));
  onValue(dbRef, snapshot => {
    const rowsHumidity = [];
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      rowsHumidity.push([childData.currentTime, childData.humidity]);
    });
    dataHumidity.addRows(rowsHumidity);
    chartHumidity.draw(dataHumidity, optionsHumidity);
  });
}

function drawTemperatureChart() {
  const dataTemperature = new google.visualization.DataTable();
  dataTemperature.addColumn('string', 'Time');
  dataTemperature.addColumn('number', 'Temperature');
  
  const optionsTemperature = {
    title: 'Temperature over Time',
    curveType: 'function',
    legend: { position: 'bottom' },
    chartArea: { width: '70%', height: '70%' }
  };

  var chartTemperature = new google.visualization.LineChart(document.getElementById('temperatureChart'));
  const dbRef = query(ref(database, 'HistoricalData'), limitToLast(240));
  onValue(dbRef, snapshot => {
    const rowsTemperature = [];
    snapshot.forEach(childSnapshot => {
      const childData = childSnapshot.val();
      rowsTemperature.push([childData.currentTime, childData.temperature]);
    });
    dataTemperature.addRows(rowsTemperature);
    chartTemperature.draw(dataTemperature, optionsTemperature);
  });
}
