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
};
