function getAvailableTimeSlots() {
    const timeSlots = [];
    const currentHour = new Date().getHours();

    // Shows evening slots if it's earlier in the day, otherwise shows next day morning slots
    if (currentHour < 17) {
        timeSlots.push({ label: '4-5PM', value: '4-5PM' });
        timeSlots.push({ label: '5-6PM', value: '5-6PM' });
        timeSlots.push({ label: '6-7PM', value: '6-7PM' });
    } else {
        timeSlots.push({ label: '10-11AM', value: '10-11AM' });
        timeSlots.push({ label: '11-12PM', value: '11-12PM' });
        timeSlots.push({ label: '12-1PM', value: '12-1PM' });
    }

    return timeSlots;
}

module.exports = { getAvailableTimeSlots };
