// Manage conversation flow and transitions

const { getTimeBasedGreeting } = require('./utils/greetings');

const userSessions = {}; // store temporary user data like name, selected options, etc.

const generateOrderId = () => `ORD-${Math.floor(Math.random() * 1000000)}`;

const services = {
  exterior: 300,
  interior: 250,
  full: 500,
};

const addons = {
  acVent: 100,
  shine: 120,
  none: 0,
};

const handleMessageFlow = (senderId, message, sendMessage) => {
  const session = userSessions[senderId] || { stage: 'greet' };
  const text = message?.text?.trim();

  switch (session.stage) {
    case 'greet': {
      const greeting = getTimeBasedGreeting();
      sendMessage(senderId, `${greeting}! Welcome to GlossDrive 🚗✨\nCan I know your name?`);
      session.stage = 'get_name';
      break;
    }

    case 'get_name': {
      session.name = text;
      session.stage = 'get_location';
      sendMessage(senderId, `Hi ${text}, where do you stay?`, [
        { type: 'postback', title: 'U Block DLF phase 3', payload: 'LOCATION_U_BLOCK' },
        { type: 'postback', title: 'Others', payload: 'LOCATION_OTHERS' }
      ]);
      break;
    }

    case 'get_service': {
      session.stage = 'addons';
      if (text.includes('Exterior')) {
        session.service = 'exterior';
        session.total = services.exterior;
        sendMessage(senderId, 'Would you like any addons?', [
          { type: 'postback', title: 'AC Vent Cleaning (₹100)', payload: 'ADDON_AC_VENT' },
          { type: 'postback', title: 'Wheel & Window Shine (₹120)', payload: 'ADDON_SHINE' },
          { type: 'postback', title: 'None', payload: 'ADDON_NONE' }
        ]);
      } else if (text.includes('Interior')) {
        session.service = 'interior';
        session.total = services.interior;
        sendMessage(senderId, 'Would you like any addons?', [
          { type: 'postback', title: 'AC Vent Cleaning (₹100)', payload: 'ADDON_AC_VENT' },
          { type: 'postback', title: 'Wheel & Window Shine (₹120)', payload: 'ADDON_SHINE' },
          { type: 'postback', title: 'None', payload: 'ADDON_NONE' }
        ]);
      } else {
        session.service = 'full';
        session.total = services.full;
        session.stage = 'time';
        askTimeSlots(senderId, sendMessage);
      }
      break;
    }

    case 'time': {
      session.time = text;
      session.stage = 'confirm';
      sendMessage(senderId, `Your total is ₹${session.total}. Proceed to payment or start again?`, [
        { type: 'postback', title: 'Pay Now', payload: 'PAY_NOW' },
        { type: 'postback', title: 'Start Over', payload: 'RESTART' }
      ]);
      break;
    }

    case 'confirm': {
      if (text.includes('Pay')) {
        const orderId = generateOrderId();
        sendMessage(senderId, `Payment confirmed ✅\nOrder ID: ${orderId}\nThank you ${session.name}! We'll see you soon at your location.`);
        delete userSessions[senderId];
      } else {
        session.stage = 'get_service';
        sendServiceOptions(senderId, sendMessage);
      }
      break;
    }

    default: {
      sendMessage(senderId, 'Let’s start over.');
      session.stage = 'greet';
      break;
    }
  }

  userSessions[senderId] = session;
};

const handlePostbackFlow = (senderId, payload, sendMessage) => {
  const session = userSessions[senderId] || {};

  switch (payload) {
    case 'LOCATION_U_BLOCK':
      session.stage = 'get_service';
      sendServiceOptions(senderId, sendMessage);
      break;
    case 'LOCATION_OTHERS':
      sendMessage(senderId, 'Sorry! We are currently not servicing your area. 😔');
      delete userSessions[senderId];
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
      delete userSessions[senderId];
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

  userSessions[senderId] = session;
};

const sendServiceOptions = (senderId, sendMessage) => {
  sendMessage(senderId, 'What services are you looking for?', [
    { type: 'postback', title: 'Exterior Cleaning (₹300)', payload: 'SERVICE_EXTERIOR' },
    { type: 'postback', title: 'Interior Cleaning (₹250)', payload: 'SERVICE_INTERIOR' },
    { type: 'postback', title: 'Whole Car Cleaning (₹500)', payload: 'SERVICE_FULL' },
  ]);
};

const askTimeSlots = (senderId, sendMessage) => {
  const hour = new Date().getHours();
  const slot1 = `${hour + 1}-${hour + 2} PM`;
  const slot2 = `${hour + 2}-${hour + 3} PM`;
  const slot3 = `${hour + 3}-${hour + 4} PM`;

  sendMessage(senderId, 'Pick your preferred time:', [
    { type: 'postback', title: slot1, payload: slot1 },
    { type: 'postback', title: slot2, payload: slot2 },
    { type: 'postback', title: slot3, payload: slot3 },
  ]);
};

// Export the relevant functions
module.exports = {
  handleMessageFlow,
  handlePostbackFlow,
  generateReply: handleMessageFlow,  // exporting as generateReply
};
