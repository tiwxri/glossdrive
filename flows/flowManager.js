const { flowSteps } = require('../utils/constants');

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

      case 'chooseService':
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
  
      // Handle other steps...

      case 'vehicleType': {
        const vehicleMap = {
          hatchback: 'Hatchback',
          sedan: 'Sedan',
          suv: 'SUV',
        };
      
        const selectedVehicle = vehicleMap[msg.toLowerCase()];
        if (selectedVehicle) {
          next.vehicle = selectedVehicle;
          next.step = 'addons';
          return { reply: flowSteps.addons, nextSession: next };
        } else {
          return { reply: flowSteps.vehicleType, nextSession: next };
        }
      } 

      //Addons Options
          case 'addons':
            const availableAddons = [
              'Tyre Polishing',
              'Engine Bay Cleaning',
              'Ceramic Coating',
              'Wax Polish',
              'Interior Shampooing'
            ];
          
            if (/no/i.test(msg)) {
              next.addons = [];
            } else {
              const selected = msg.split(',').map(a => a.trim());
              const invalid = selected.filter(a => !availableAddons.includes(a));
              if (invalid.length > 0) {
                return {
                  reply: `Invalid addon(s): ${invalid.join(', ')}. Please select from:\n✅ ${availableAddons.join('\n✅ ')}`,
                  nextSession: session
                };
              }
              next.addons = selected;
            }
          
            next.step = 'timeSlot';
            return { reply: flowSteps.timeSlot, nextSession: next };

            case 'timeSlot':
              const lowerMsg = msg.toLowerCase();
              if (['today', 'tomorrow'].includes(lowerMsg) || /\d{4}-\d{2}-\d{2}/.test(msg)) {
                next.dateTime = msg;
                next.step = 'userDetails';
                return { reply: flowSteps.userDetails, nextSession: next };
              } else {
                return {
                  reply: `Please select a valid date option:
            📅 Today
            📅 Tomorrow
            📅 Or enter a custom date like 2025-04-20`,
                  nextSession: next
                };
              }

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
