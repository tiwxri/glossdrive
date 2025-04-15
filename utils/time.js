const getGreeting = () => {
    const now = new Date();
    const istOffset = 330 * 60 * 1000; // IST = UTC + 5:30
    const istTime = new Date(now.getTime() + istOffset);
    const hours = istTime.getUTCHours();
  
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  const getNextTimeSlots = () => {
    const now = new Date();
    const istOffset = 330 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    let hour = istTime.getUTCHours() + 1; // Start from next hour
  
    const timeSlots = [];
    for (let i = 0; i < 3; i++) {
      const start = hour + i;
      const end = start + 1;
      if (start >= 22) break; // cutoff at 10PM
      timeSlots.push(`${start}:00-${end}:00`);
    }
  
    return timeSlots;
  };
  
  module.exports = { getGreeting, getNextTimeSlots };
  