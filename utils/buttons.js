exports.getServiceButtons = () => [
    {
      type: 'reply',
      reply: { id: 'exterior_wash', title: '🧽 Exterior Wash' },
    },
    {
      type: 'reply',
      reply: { id: 'interior_wash', title: '🧼 Interior Wash' },
    },
    {
      type: 'reply',
      reply: { id: 'full_cleaning', title: '🧴 Full Car Cleaning' },
    },
  ];
  
  exports.getServiceOptionsButtons = (service) => {
    if (service === 'exterior wash') {
      return [
        { type: 'reply', reply: { id: 'window_shine', title: 'Window Shine' } },
        { type: 'reply', reply: { id: 'wheel_shine', title: 'Wheel Shine' } },
        { type: 'reply', reply: { id: 'preen_none', title: 'Preen None' } },
      ];
    }
    return [];
  };
  