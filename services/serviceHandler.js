const { sendMessage } = require('./messageSender'); // Correctly importing sendMessage

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

  await sendMessage(to, message); // Use sendMessage properly
};

module.exports = { sendServiceOptions, handleServiceResponse };
