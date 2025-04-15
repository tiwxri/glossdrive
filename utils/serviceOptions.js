exports.getAdditionalOptions = (service) => {
    if (service === 'exterior wash') {
      return ['Window Shine', 'Wheel Shine', 'Preen None'];
    }
    // Add similar options for other services
    return [];
  };
  