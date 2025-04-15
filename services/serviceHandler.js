const { sendMessage } = require('./messageSender');

const sendServiceOptions = async (to) => {
  const message = {
    type: 'buttons',
    text: 'Please select a service:',
    buttons: [
      { title: 'Exterior Wash', payload: 'EXTERIOR_WASH' },
      { title: 'Interior Wash', payload: 'INTERIOR_WASH' },
      { title: 'Full Car Cleaning', payload: 'FULL_CLEANING' }
    ]
  };

  await sendMessage(to, message);
};

const handleServiceResponse = async (to, text) => {
  switch (text) {
    case 'exterior wash':
      await sendMessage(to, 'You selected Exterior Wash. Please choose additional options:');
      await sendExteriorOptions(to);
      break;
    case 'interior wash':
      await sendMessage(to, 'You selected Interior Wash. We will proceed with that.');
      break;
    case 'full cleaning':
      await sendMessage(to, 'You selected Full Car Cleaning. We will proceed with that.');
      break;
    default:
      await sendMessage(to, 'Sorry, I didn\'t understand that. Please select one of the services.');
      await sendServiceOptions(to);
      break;
  }
};

const sendExteriorOptions = async (to) => {
  const message = {
    type: 'buttons',
    text: 'Choose additional options for Exterior Wash:',
    buttons: [
      { title: 'Window Shine', payload: 'WINDOW_SHINE' },
      { title: 'Wheel Shine', payload: 'WHEEL_SHINE' },
      { title: 'None', payload: 'NONE' }
    ]
  };

  await sendMessage(to, message);
};

module.exports = { sendServiceOptions, handleServiceResponse };
