const { flowSteps } = require('../utils/constants');

exports.processMessage = async (msg, session, phone) => {
  const step = session?.step || 'welcome';
  const next = { ...session };

  switch (step) {
    case 'welcome':
      if (/yes/i.test(msg)) {
        next.step = 'chooseService';
        return { reply: flowSteps.chooseService, nextSession: next };
      }
      return { reply: "No problem! Let us know when you're ready.", nextSession: {} };

    case 'chooseService':
      next.service = msg;
      next.step = 'vehicleType';
      return { reply: flowSteps.vehicleType, nextSession: next };

    case 'vehicleType':
      next.vehicle = msg;
      next.step = 'addons';
      return { reply: flowSteps.addons, nextSession: next };

    case 'addons':
      if (/no/i.test(msg)) {
        next.addons = [];
      } else {
        next.addons = msg.split(',').map(a => a.trim());
      }
      next.step = 'timeSlot';
      return { reply: flowSteps.timeSlot, nextSession: next };

    case 'timeSlot':
      next.dateTime = msg;
      next.step = 'userDetails';
      return { reply: flowSteps.userDetails, nextSession: next };

    case 'userDetails':
      const [location, phoneNum, name] = msg.split(',');
      next.location = location?.trim();
      next.phone = phoneNum?.trim();
      next.name = name?.trim();
      next.step = 'summary';

      const summary = `
Here’s your booking summary:
Service: ${next.service}
Vehicle: ${next.vehicle}
Addons: ${next.addons?.join(', ') || 'None'}
Date: ${next.dateTime}
Location: ${next.location}
Name: ${next.name}
Price: ₹2,499

✅ Confirm Booking?
`;
      return { reply: summary, nextSession: next };

    case 'summary':
      if (/confirm/i.test(msg)) {
        next.step = 'payment';
        return { reply: "💳 Please complete your payment: [Payment Link]", nextSession: next };
      }
      return { reply: flowSteps.chooseService, nextSession: { step: 'chooseService' } };

    case 'payment':
      next.step = 'confirmed';
      return {
        reply: `✅ Your booking is confirmed! We'll see you on ${next.dateTime} 🚗✨`,
        nextSession: {}
      };

    default:
      return { reply: flowSteps.welcome, nextSession: { step: 'welcome' } };
  }
};
