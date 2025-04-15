function generateServiceButtons() {
    return [
        { label: 'Exterior Car Cleaning', value: 'Exterior Car Cleaning', price: 599 },
        { label: 'Interior Car Cleaning', value: 'Interior Car Cleaning', price: 699 },
        { label: 'Entire Car Cleaning', value: 'Entire Car Cleaning', price: 1199 },
    ];
}

function generateAddonButtons() {
    return [
        { label: 'AC Vent Cleaning (₹150)', value: 'AC Vent Cleaning', price: 150 },
        { label: 'Wheel and Window Shine (₹200)', value: 'Wheel and Window Shine', price: 200 },
        { label: 'None', value: 'None', price: 0 },
    ];
}

module.exports = { generateServiceButtons, generateAddonButtons };
