function getTimeBasedGreeting() {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

module.exports = { getTimeBasedGreeting };
