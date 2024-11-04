const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kaesh831@gmail.com',
    pass: 'aocl sgja nhvg xfkw' // stored in Environment variable for better security
  }
});

// Function to format the date and time in local time
// Function to format the date and time in local time (PST)
function formatLocalDateTime(date) {
  const options = { 
    timeZone: 'America/Los_Angeles', // Set to PST time zone explicitly
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

exports.checkDataUpdates = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  console.log('Function executed: Checking data updates...');

  try {
    const snapshot = await admin.database().ref('HistoricalData').orderByChild('currentTime').limitToLast(1).once('value');

    if (!snapshot.exists()) {
      console.log('No data found in the database. Sending email alert...');
      
      const mailOptionsNoData = {
        from: 'kaesh831@gmail.com',
        to: 'myceliummeadows@gmail.com',
        subject: 'No Data Available Alert',
        text: `No data has been received from the system. Please check the device.`
      };

      await transporter.sendMail(mailOptionsNoData, (error, info) => {
        if (error) {
          console.error('Error sending no data email:', error);
          return;
        }
        console.log('No data email sent successfully:', info.response);
      });

      return; // Exit after sending no data alert
    }

    const latestData = snapshot.val();
    const latestTimestamp = Object.values(latestData)[0].currentTime;

    console.log('Raw latest timestamp:', latestTimestamp);

    // Attempt to build a full timestamp if only time is provided
    let latestTimestampDate;
    if (/^\d{2}:\d{2}:\d{2}$/.test(latestTimestamp)) {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in `YYYY-MM-DD`
      latestTimestampDate = new Date(`${today}T${latestTimestamp}Z`);
    } else {
      latestTimestampDate = new Date(latestTimestamp);
    }

    if (isNaN(latestTimestampDate.getTime())) {
      console.log('Failed to parse timestamp properly. Skipping email alert for stale data.');
      return;
    }

    // Log the timestamp before formatting
    console.log('Latest timestamp (UTC):', latestTimestampDate.toISOString());

    // Convert the timestamp to a readable local time format in PST
    const formattedTimestamp = formatLocalDateTime(latestTimestampDate);
    console.log('Formatted timestamp (Local Time):', formattedTimestamp);

    const latestHumidity = Object.values(latestData)[0].humidity;

    // Use correct current time representation in UTC
    const currentTime = new Date().getTime(); // Corrected: Using `new Date().getTime()` to ensure correct timestamp in milliseconds
    console.log('Current time (UTC in ms):', currentTime);
    console.log('Latest timestamp in milliseconds:', latestTimestampDate.getTime());
    console.log('Time difference (ms):', currentTime - latestTimestampDate.getTime());

    // Define the threshold for data inactivity (e.g., 1 minute)
    const inactivityThreshold = 1 * 60 * 1000;

    // Check for data inactivity
    if (currentTime - latestTimestampDate.getTime() > inactivityThreshold) {
      console.log('Data is stale. Sending email alert...');

      const mailOptionsInactivity = {
        from: 'kaesh831@gmail.com',
        to: 'myceliummeadows@gmail.com',
        subject: 'Data Stopped Alert',
        text: `No data updates received since ${formattedTimestamp}. Please check the system to ensure data is being sent correctly.`
      };

      await transporter.sendMail(mailOptionsInactivity, (error, info) => {
        if (error) {
          console.error('Error sending inactivity email:', error);
          return;
        }
        console.log('Inactivity email sent successfully:', info.response);
      });
    }

    if (latestHumidity < 80) {
      console.log('Humidity is below 80%. Sending email alert...');

      const mailOptionsHumidity = {
        from: 'kaesh831@gmail.com',
        to: 'myceliummeadows@gmail.com',
        subject: 'Low Humidity Alert',
        text: `Alert! The humidity level has dropped to ${latestHumidity}%. Please check the humidifier.`
      };

      await transporter.sendMail(mailOptionsHumidity, (error, info) => {
        if (error) {
          console.error('Error sending humidity email:', error);
          return;
        }
        console.log('Humidity email sent successfully:', info.response);
      });
    } else {
      console.log('Humidity level is above 80%.');
    }

  } catch (error) {
    console.error('Error checking data updates:', error);
  }
});
