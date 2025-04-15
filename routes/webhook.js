const { getTimeBasedGreeting } = require('../utils/greetings');
const { generateServiceButtons, generateAddonButtons } = require('../utils/buttons');
const { getAvailableTimeSlots } = require('../utils/time');
const express = require('express');
const router = express.Router();

const db = require('../path/to/your/firebase-init-file'); // Firebase Firestore instance

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

const getSessionRef = (senderId) => db.collection('sessions').doc(senderId);

const handleMessageFlow = async (senderId, message, sendMessage) => {
  const sessionRef = getSessionRef(senderId);
  let sessionSnap = await sessionRef.get();
  let session = sessionSnap.exists ? sessionSnap.data() : { stage: 'greet' };

  const text = message?.text?.trim() || '';

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
        { type: 'postback', title: 'Others', payload: 'LOCATION_OTHERS' },
      ]);
      break;
    }

    case 'get_service': {
      session.stage = 'addons';
      if (text.includes('Exterior')) {
        session.service = 'exterior';
        session.total = services.exterior;
        sendMessage(senderId, 'Would you like any addons?', generateAddonButtons());
      } else if (text.includes('Interior')) {
        session.service = 'interior';
        session.total = services.interior;
        sendMessage(senderId, 'Would you like any addons?', generateAddonButtons());
      } else if (text.includes('Full')) {
        session.service = 'full';
        session.total = services.full;
        session.stage = 'time';
        askTimeSlots(senderId, sendMessage);
      } else {
        sendMessage(senderId, 'Please choose a valid service option: Exterior, Interior, or Full.');
      }
      break;
    }

    case 'time': {
      session.time = text;
      session.stage = 'confirm';
      sendMessage(senderId, `Your total is ₹${session.total}. Proceed to payment or start again?`, [
        { type: 'postback', title: 'Pay Now', payload: 'PAY_NOW' },
        { type: 'postback', title: 'Start Over', payload: 'RESTART' },
      ]);
      break;
    }

    case 'confirm': {
      if (text.includes('Pay')) {
        const orderId = generateOrderId();
        sendMessage(
          senderId,
          `Payment confirmed ✅\nOrder ID: ${orderId}\nThank you ${session.name}! We'll see you soon at your location.`
        );
        await sessionRef.delete();
        return;
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

  await sessionRef.set(session);
};

const handlePostbackFlow = async (senderId, payload, sendMessage) => {
  const sessionRef = getSessionRef(senderId);
  let sessionSnap = await sessionRef.get();
  let session = sessionSnap.exists ? sessionSnap.data() : {};

  switch (payload) {
    case 'LOCATION_U_BLOCK':
      session.stage = 'get_service';
      sendServiceOptions(senderId, sendMessage);
      break;

    case 'LOCATION_OTHERS':
      sendMessage(senderId, 'Sorry! We are currently not servicing your area. 😔');
      await sessionRef.delete();
      return;

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

    case 'PAY_NOW': {
      const orderId = generateOrderId();
      sendMessage(
        senderId,
        `Payment confirmed ✅\nOrder ID: ${orderId}\nThank you ${session.name}! We'll see you soon at your location.`
      );
      await sessionRef.delete();
      return;
    }

    case 'RESTART':
      session.stage = 'get_service';
      sendServiceOptions(senderId, sendMessage);
      break;

    default:
      sendMessage(senderId, 'Not sure what you meant. Let’s start over.');
      session.stage = 'greet';
      break;
  }

  await sessionRef.set(session);
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

module.exports = {
  handleMessageFlow,
  handlePostbackFlow,
  generateReply: handleMessageFlow,
};