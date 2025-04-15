const { sendMessage } = require('./messageSender'); // Import sendMessage function
const moment = require('moment'); // For time-related functions

async function handleMessage(phoneNumber, messageText) {
  const currentTime = moment(); // Get current time

  // Greeting message based on time of day
  let greetingMessage = "Hello!";
  if (currentTime.hour() < 12) {
    greetingMessage = "Good Morning!";
  } else if (currentTime.hour() < 18) {
    greetingMessage = "Good Afternoon!";
  } else {
    greetingMessage = "Good Evening!";
  }

  await sendMessage(phoneNumber, { type: 'text', body: `${greetingMessage} How can I assist you today?` });

  const servicesMessage = {
    type: 'buttons',
    text: 'Please choose a service:',
    buttons: [
      { title: 'Exterior Cleaning', payload: 'EXTERIOR_CLEANING' },
      { title: 'Interior Cleaning', payload: 'INTERIOR_CLEANING' },
      { title: 'Full Car Cleaning', payload: 'FULL_CLEANING' }
    ]
  };
  await sendMessage(phoneNumber, servicesMessage);
}

async function handlePostback(phoneNumber, postbackPayload) {
  switch (postbackPayload) {
    case 'EXTERIOR_CLEANING':
      await sendMessage(phoneNumber, { type: 'text', body: 'What type of Exterior Cleaning would you prefer?' });
      await sendMessage(phoneNumber, {
        type: 'buttons',
        text: 'Choose a cleaning type:',
        buttons: [
          { title: 'Foam Wash', payload: 'FOAM_WASH' },
          { title: 'Water Based Cleaning', payload: 'WATER_BASED' },
          { title: 'Eco-friendly', payload: 'ECO_FRIENDLY' }
        ]
      });
      break;

    case 'INTERIOR_CLEANING':
      await sendMessage(phoneNumber, { type: 'text', body: 'You selected Interior Cleaning. Would you like to add any extras?' });
      await sendMessage(phoneNumber, {
        type: 'buttons',
        text: 'Choose an add-on:',
        buttons: [
          { title: 'Window Shine', payload: 'WINDOW_SHINE' },
          { title: 'Wheel Shine', payload: 'WHEEL_SHINE' },
          { title: 'None', payload: 'NONE' }
        ]
      });
      break;

    case 'FULL_CLEANING':
      await sendMessage(phoneNumber, { type: 'text', body: 'You selected Full Car Cleaning. We will proceed with the booking.' });
      await sendMessage(phoneNumber, { type: 'text', body: 'Please provide your car model and brand.' });
      break;

    case 'FOAM_WASH':
    case 'WATER_BASED':
    case 'ECO_FRIENDLY':
    case 'WINDOW_SHINE':
    case 'WHEEL_SHINE':
    case 'NONE':
      await sendMessage(phoneNumber, { type: 'text', body: 'Please provide your car model and brand.' });
      break;

    case 'CAR_MODEL':
      await sendMessage(phoneNumber, { type: 'text', body: 'Please share your address for the service location.' });
      break;

    case 'ADDRESS':
      await sendMessage(phoneNumber, { type: 'text', body: 'Please select a preferred time for the service.' });
      await sendMessage(phoneNumber, {
        type: 'buttons',
        text: 'Choose a time slot:',
        buttons: [
          { title: '6-7 AM', payload: 'TIME_6_7' },
          { title: '7-8 AM', payload: 'TIME_7_8' },
          { title: '8-9 AM', payload: 'TIME_8_9' }
        ]
      });
      break;

    case 'TIME_6_7':
    case 'TIME_7_8':
    case 'TIME_8_9':
      await sendMessage(phoneNumber, { type: 'text', body: 'Thank you for your booking! Your order ID is #12345.' });
      await sendMessage(phoneNumber, { type: 'text', body: 'We will see you there. Have a great day!' });
      break;

    default:
      await sendMessage(phoneNumber, { type: 'text', body: 'Sorry, I didn’t understand that.' });
  }
}

module.exports = { handleMessage, handlePostback };
