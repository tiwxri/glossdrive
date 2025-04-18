// utils/constants.js
exports.flowSteps = {
  chooseService: {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'What service would you like?',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'exterior_wash',
              title: '🧼 Exterior Wash',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'interior_detailing',
              title: '🧽 Interior Detailing',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'full_service',
              title: '🚗 Full Service',
            },
          },
        ],
      },
    },
  },
  // Define other steps similarly...
  vehicleType: {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: 'What type of vehicle do you have?\nYou got other vehicle type? Let us know.',
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'hatchback',
              title: '🚙 Hatchback',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'sedan',
              title: '🚗 Sedan',
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'suv',
              title: '🚐 SUV',
            },
          },
        ],
      },
    },
  },
  
    // Define other steps similarly...
    addonsStep1: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: 'Choose an addon (optional):'
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'addon_wheel_polish', title: '🛞 Wheel Polish' } },
            { type: 'reply', reply: { id: 'addon_window_shine', title: '✨ Window Shine' } },
            { type: 'reply', reply: { id: 'addon_none', title: '❌ None' } }
          ]
        }
      }
    },

  // Subscription type (One-Time, Weekly, Monthly)---------------------------------------------------
    subscriptionType: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: 'How often would you like your car cleaned?' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'onetime', title: 'One-Time' } },
            { type: 'reply', reply: { id: 'weekly', title: 'Weekly' } },
            { type: 'reply', reply: { id: 'monthly', title: 'Monthly' } }
          ]
        }
      }
    }
};
