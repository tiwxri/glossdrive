function generateServiceButtons() {
    return [
        { label: 'Exterior Car Cleaning (₹500)', value: 'Exterior Car Cleaning' },
        { label: 'Interior Car Cleaning (₹400)', value: 'Interior Car Cleaning' },
        { label: 'Whole Car Cleaning (₹800)', value: 'Whole Car Cleaning' },
    ];
}

function generateAddonButtons() {
    return [
        { label: 'AC Vent Cleaning (₹150)', value: 'AC Vent Cleaning' },
        { label: 'Wheel and Window Shine (₹200)', value: 'Wheel and Window Shine' },
        { label: 'None', value: 'None' },
    ];
}

module.exports = { generateServiceButtons, generateAddonButtons };
