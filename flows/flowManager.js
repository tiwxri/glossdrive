const { flowSteps } = require('../utils/constants');

// -----------------------------------------
// Helper function to generate one-time slots
function getOneTimeSlots() {
  const now = new Date();
  const hour = now.getHours();

  const allSlots = [
    { label: '9–10 AM', start: 9, end: 10 },
    { label: '10–11 AM', start: 10, end: 11 },
    { label: '11–12 PM', start: 11, end: 12 },
    { label: '12–1 PM', start: 12, end: 13 },
    { label: '1–2 PM', start: 13, end: 14 },
    { label: '2–3 PM', start: 14, end: 15 },
    { label: '3–4 PM', start: 15, end: 16 },
    { label: '4–5 PM', start: 16, end: 17 }
  ];

  const available = allSlots.filter(slot => hour < slot.start);
  if (available.length === 0) {
    return {
      type: 'text',
      body: 'No more slots available for today. Please try again tomorrow!',
    };
  }

  return {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'Choose a time slot for your one-time service:',
      },
      action: {
        buttons: available.map(slot => ({
          type: 'reply',
          reply: {
            id: `slot_${slot.start}_${slot.end}`,
            title: slot.label,
          },
        })),
      },
    },
  };
}

// -----------------------------------------
// Helper function to generate recurring time slots
function getRecurringTimeSlots(timeOfDay) {
  const slotMap = {
    Morning: ['5–6 AM', '6–7 AM', '7–8 AM'],
    Afternoon: ['12–1 PM', '1–2 PM', '2–3 PM'],
    Evening: ['7–8 PM', '8–9 PM', '9–10 PM'],
  };

  const slots = slotMap[timeOfDay] || [];

  return {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: `Choose your preferred ${timeOfDay.toLowerCase()} slot:`,
      },
      action: {
        buttons: slots.map((slot, idx) => ({
          type: 'reply',
          reply: {
            id: `recurring_${timeOfDay}_${idx}`,
            title: slot,
          },
        })),
      },
    },
  };
}


exports.processMessage = async (msg, session, phone) => {
  const step = session?.step || 'chooseService';
  const next = { ...session };

  switch (step) {
    case 'welcome':
      if (/start/i.test(msg)) {
        next.step = 'chooseService';
        return { reply: flowSteps.chooseService, nextSession: next };
      }
      return { reply: "No problem! Let us know when you're ready.", nextSession: next };

    case 'chooseService':{
      // Handle button reply IDs

      // Extract reply ID from interactive button click
      const buttonId = msg?.interactive?.button_reply?.id || msg?.button_reply?.id || msg?.toLowerCase(); // fallback for testing
      console.log('Service selection ID:', buttonId); // helpful for debugging

      const serviceMap = {
        exterior_wash: 'Exterior Wash',
        interior_detailing: 'Interior Detailing',
        full_service: 'Full Service',
      };

      const selectedService = serviceMap[buttonId];
      if (selectedService) {
        next.service = selectedService;
        next.step = 'vehicleType';
        return { reply: flowSteps.vehicleType, nextSession: next };
      } else {
        // If the message doesn't match any button ID, prompt again
        return { reply: flowSteps.chooseService, nextSession: next };
      }
    }
  
      // Handle other steps...

      case 'vehicleType': {
        // Extract reply ID from button click or fallback to lowercase text
        const buttonId = msg?.interactive?.button_reply?.id || msg?.button_reply?.id || msg?.toLowerCase();

        const vehicleMap = {
          hatchback: 'Hatchback',
          sedan: 'Sedan',
          suv: 'SUV',
        };

        const selectedVehicle = vehicleMap[buttonId];
        if (selectedVehicle) {
          next.vehicle = selectedVehicle;
          next.step = 'addons';
          return { reply: flowSteps.addonsStep1, nextSession: next }; // Send first batch of addons
        } else {
          return { reply: flowSteps.vehicleType, nextSession: next }; // Repeat question
        }
      }

      // After vehicleType...
      case 'addons':
        // Kick‐off with first batch
        next.step = 'addonsStep1';
        return { reply: flowSteps.addonsStep1, nextSession: next };

      case 'addonsStep1': {
        if (msg === 'more_addons') {
          next.step = 'addonsStep2';
          return { reply: flowSteps.addonsStep2, nextSession: next };
        }
        const map1 = {
          addon_tyre_polishing: 'Tyre Polishing',
          addon_engine_bay:     'Engine Bay'
        };
        if (map1[msg]) {
          next.addons = [...(session.addons || []), map1[msg]];
          next.step = 'addons';
          return { reply: flowSteps.timeSlot, nextSession: next };
        }
        // fallback
        return { reply: flowSteps.addonsStep1, nextSession: next };
      }

      case 'addonsStep2': {
        const map2 = {
          addon_ceramic_coating:    'Ceramic Coating',
          addon_wax_polish:         'Wax Polish',
          addon_interior_shampoo:   'Interior Shampoo'
        };
        if (map2[msg]) {
          next.addons = [ ...(session.addons || []), map2[msg] ];
          next.step = 'subscriptionType';
          return { reply: flowSteps.timeSlot, nextSession: next };
        }
        // fallback
        return { reply: flowSteps.addonsStep2, nextSession: next };
      }

//Booking Frequency ---------------------------------------------------------------------------------------------------------
      case 'subscriptionType': {
        const id = msg?.interactive?.button_reply?.id || msg?.button_reply?.id || msg?.toLowerCase();
        const valid = { onetime: 'One-Time', weekly: 'Weekly', monthly: 'Monthly' };
        const selected = valid[id];
        if (selected) {
          next.subscription = selected;
          next.step = selected === 'One-Time' ? 'timeSlotOneTime' : 'timeOfDay';
          return {
            reply: selected === 'One-Time' ? getOneTimeSlots() : flowSteps.timeOfDay,
            nextSession: next
          };
        }
        return { reply: flowSteps.subscriptionType, nextSession: next };
      }

      case 'timeSlotOneTime': {
        const id = msg?.interactive?.button_reply?.id;
        if (id?.startsWith('slot_')) {
          const [, start, end] = id.split('_');
          next.dateTime = `${start}:00 - ${end}:00`;
          next.step = 'userDetails';
          return { reply: flowSteps.userDetails, nextSession: next };
        }
        return { reply: getOneTimeSlots(), nextSession: next };
      }

      case 'timeOfDay': {
        const id = msg?.interactive?.button_reply?.id || msg?.button_reply?.id || msg?.toLowerCase();
        const timeMap = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };
        const selected = timeMap[id];
        if (selected) {
          next.timeOfDay = selected;
          next.step = 'timeSlotRecurring';
          return { reply: getRecurringTimeSlots(selected), nextSession: next };
        }
        return { reply: flowSteps.timeOfDay, nextSession: next };
      }

      case 'timeSlotRecurring': {
        const id = msg?.interactive?.button_reply?.id;
        if (id?.startsWith('recurring_')) {
          const [, timeOfDay, idx] = id.split('_');
          const map = {
            Morning: ['5–6 AM', '6–7 AM', '7–8 AM'],
            Afternoon: ['12–1 PM', '1–2 PM', '2–3 PM'],
            Evening: ['7–8 PM', '8–9 PM', '9–10 PM']
          };
          const slot = map[timeOfDay][parseInt(idx)];
          next.dateTime = slot;
          next.step = 'userDetails';
          return { reply: flowSteps.userDetails, nextSession: next };
        }
        return { reply: getRecurringTimeSlots(next.timeOfDay), nextSession: next };
      }
      
      // ... other cases ...

      case 'userDetails':
        const [location, phoneNum, name] = msg.split(',').map(s => s?.trim());
        if (!location || !phoneNum || !name) {
          return {
            reply: `Please share details in this format:\n📍 Location, 📞 Phone Number, 🧑 Name`,
            nextSession: session
          };
        }
      
        next.location = location;
        next.phone = phoneNum;
        next.name = name;
        next.step = 'summary';
      
        const bookingSummary = `Here’s your booking summary:
      Service: ${next.service}
      Vehicle: ${next.vehicle}
      Addons: ${next.addons?.join(', ') || 'None'}
      Date: ${next.dateTime}
      Location: ${next.location}
      Name: ${next.name}
      Price: ₹2,499
      
      ✅ Confirm Booking?`;
      
        return { reply: bookingSummary, nextSession: next };

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
