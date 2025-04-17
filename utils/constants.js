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
  }
  
    // Define other steps similarly...
};
