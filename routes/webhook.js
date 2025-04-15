const greetings = require('../utils/greetings');
const { generateServiceButtons, generateAddonButtons } = require('../utils/buttons');
const { getAvailableTimeSlots } = require('../utils/time');

const sessionStorage = {}; // Simple session management for now, replace with DB or Redis in production.

const generateOrderId = () => `ORD-${Math.floor(Math.random() * 1000000)}`;

const services = {
  exterior: 500,
  interior: 400,
  full: 800,
};

const addons = {
  acVent: 150,
  shine: 200,
  none: 0,
};

const handleMessageFlow = (senderId, message, sendMessage) => {
  const session = sessionStorage[senderId] || { stage: 'greet' };
  const text = message?.text?.trim();

  switch (session.stage) {
    case 'greet':
      const greeting = getTimeBasedGreeting();
      sendMessage(senderId, `${greeting}! Welcome to GlossDrive 🚗✨\nCan I know your name?`);
      session.stage = 'get_name';
      break;

    case 'get_name':
      session.name = text;
      session.stage = 'get_location';
      sendMessage(senderId, `Hi ${text}, where do you stay?`, [
        { type: 'postback', title: 'U Block DLF phase 3', payload: 'LOCATION_U_BLOCK' },
        { type: 'postback', title: 'Others', payload: 'LOCATION_OTHERS' }
      ]);
      break;

    case 'get_service':
      session.stage = 'addons';
      if (text.includes('Exterior')) {
        session.service = 'exterior';
        session.total = services.exterior;
        sendMessage(senderId, 'Would you like any addons?', generateAddonButtons());
      } else if (text.includes('Interior')) {
        session.service = 'interior';
        session.total = services.interior;
        sendMessage(senderId, 'Would you like any addons?', generateAddonButtons());
      } else {
        session.service = 'full';
        session.total = services.full;
        session.stage = 'time';
        askTimeSlots(senderId, sendMessage);
      }
      break;

    case 'time':
      session.time = text;
      session.stage = 'confirm';
      sendMessage(senderId, `Your total is ₹${session.total}. Proceed to payment or start again?`, [
        { type: 'postback', title: 'Pay Now', payload: 'PAY_NOW' },
        { type: 'postback', title: 'Start Over', payload: 'RESTART' }
      ]);
      break;

    case 'confirm':
      if (text.includes('Pay')) {
        const orderId = generateOrderId();
        sendMessage(senderId, `Payment confirmed ✅\nOrder ID: ${orderId}\nThank you ${session.name}! We'll see you soon at your location.`);
        delete sessionStorage[senderId]; // Clear session after payment
      } else {
        session.stage = 'get_service';
        sendServiceOptions(senderId, sendMessage);
      }
      break;

    default:
      sendMessage(senderId, 'Let’s start over.');
      session.stage = 'greet';
      break;
  }

  sessionStorage[senderId] = session;
};

const handlePostbackFlow = (senderId, payload, sendMessage) => {
  const session = sessionStorage[senderId] || {};

  switch (payload) {
    case 'LOCATION_U_BLOCK':
      session.stage = 'get_service';
      sendServiceOptions(senderId, sendMessage);
      break;
    case 'LOCATION_OTHERS':
      sendMessage(senderId, 'Sorry! We are currently not servicing your area. 😔');
      delete sessionStorage[senderId];
      break;

    case 'ADDON_AC_VENT':
      session.total += addons.acVent;
      session.stage = 'time';
      askTimeSlots(senderId, sendMessage);
      break;
    case 'ADDON_SHINE':
      session.total += addons.shine;
      session.stage = 'time';
      askTimeSlots(senderId, sendMessage);
      break;
    case 'ADDON_NONE':
      session.stage = 'time';
      askTimeSlots(senderId, sendMessage);
      break;

    case 'PAY_NOW':
      const orderId = generateOrderId();
      sendMessage(senderId, `Payment confirmed ✅\nOrder ID: ${orderId}\nThank you ${session.name}! We'll see you soon at your location.`);
      delete sessionStorage[senderId]; // Clear session after payment
      break;

    case 'RESTART':
      session.stage = 'get_service';
      sendServiceOptions(senderId, sendMessage);
      break;

    default:
      sendMessage(senderId, 'Not sure what you meant. Let’s start over.');
      session.stage = 'greet';
      break;
  }

  sessionStorage[senderId] = session;
};

const sendServiceOptions = (senderId, sendMessage) => {
  sendMessage(senderId, 'What services are you looking for?', generateServiceButtons());
};

const askTimeSlots = (senderId, sendMessage) => {
  const timeSlots = getAvailableTimeSlots();
  sendMessage(senderId, 'Pick your preferred time:', timeSlots.map(slot => ({
    type: 'postback',
    title: slot.label,
    payload: slot.value
  })));
};

module.exports = { handleMessageFlow, handlePostbackFlow, generateReply: handleMessageFlow };
