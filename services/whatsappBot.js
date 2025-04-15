// Main bot logic for initiating and managing the chat

const axios = require('axios');
const { getAvailableTimeSlots } = require('../utils/time');
const { generateServiceButtons, generateAddonButtons } = require('../utils/buttons');

// WhatsApp Cloud API credentials
const META_WHATSAPP_API_URL = 'https://graph.facebook.com/v15.0/';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

let userState = {};

async function handleMessage(message, from) {
    let user = userState[from] || {};

    if (!user.name) {
        // Greet user and ask for name
        await sendMessage(from, `Hello! What's your name?`);
        userState[from] = { ...user, stage: 'name' };
    } else if (user.stage === 'name') {
        // Save name and ask for location
        user.name = message;
        await sendButtons(from, 'Where do you stay?', [
            { label: 'U Block DLF phase 3', value: 'DLF' },
            { label: 'Others', value: 'Others' }
        ]);
        userState[from] = { ...user, stage: 'location' };
    } else if (user.stage === 'location') {
        if (message === 'Others') {
            await sendMessage(from, 'Sorry, we do not service your location.');
            delete userState[from]; // End chat
        } else {
            // Proceed to service selection
            await sendServiceOptions(from);
            userState[from] = { ...user, stage: 'service' };
        }
    } else if (user.stage === 'service') {
        // Process service selection
        await handleServiceSelection(message, from);
    } else if (user.stage === 'addon') {
        // Process addon selection
        await handleAddonSelection(message, from);
    } else if (user.stage === 'time') {
        // Handle time slot selection
        await handleTimeSlotSelection(message, from);
    } else if (user.stage === 'payment') {
        // Handle payment flow
        await handlePaymentSelection(message, from);
    }
}

// Send simple text message
async function sendMessage(to, message) {
    const url = `${META_WHATSAPP_API_URL}${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const body = {
        messaging_product: 'whatsapp',
        to: to,
        text: { body: message },
    };

    try {
        await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Send interactive buttons
async function sendButtons(to, message, buttons) {
    const url = `${META_WHATSAPP_API_URL}${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const buttonPayload = buttons.map(button => ({
        type: 'reply',
        reply: { id: button.value, title: button.label }
    }));

    const body = {
        messaging_product: 'whatsapp',
        to: to,
        text: { body: message },
        interactive: {
            type: 'button',
            body: {
                text: message,
            },
            action: {
                buttons: buttonPayload,
            },
        },
    };

    try {
        await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error sending buttons:', error);
    }
}

// Generate the service options buttons
async function sendServiceOptions(from) {
    const buttons = generateServiceButtons();
    await sendButtons(from, 'What services are you looking for?', buttons);
}

// Handle service selection
async function handleServiceSelection(service, from) {
    // Logic for service selection, could be exterior/interior/whole
    if (service === 'Exterior Car Cleaning') {
        await sendAddonOptions(from);
        userState[from].service = 'Exterior Car Cleaning';
    } else if (service === 'Interior Car Cleaning') {
        await sendAddonOptions(from);
        userState[from].service = 'Interior Car Cleaning';
    } else {
        // Handle "Whole Car Cleaning"
        userState[from].service = 'Whole Car Cleaning';
        await sendTimeSlots(from);
    }
}

// Send addon options (AC vent cleaning, Wheel/Window shine)
async function sendAddonOptions(from) {
    const buttons = generateAddonButtons();
    await sendButtons(from, 'Do you want to add any addons?', buttons);
}

// Handle addon selection
async function handleAddonSelection(addon, from) {
    // Logic to handle addon selection
    userState[from].addon = addon;
    await sendTimeSlots(from);
}

// Send available time slots based on user input time
async function sendTimeSlots(from) {
    const timeSlots = getAvailableTimeSlots();
    await sendButtons(from, 'Please select a preferred time slot:', timeSlots);
}

// Handle time slot selection
async function handleTimeSlotSelection(timeSlot, from) {
    userState[from].timeSlot = timeSlot;
    await sendPaymentOptions(from);
}

// Send payment options
async function sendPaymentOptions(from) {
    const buttons = [
        { label: 'Pay Now', value: 'pay_now' },
        { label: 'Start Over', value: 'start_over' },
    ];
    await sendButtons(from, 'Would you like to proceed with payment or start over?', buttons);
}

// Handle payment or restart flow
async function handlePaymentSelection(selection, from) {
    if (selection === 'pay_now') {
        await sendMessage(from, 'Proceeding to payment...');
        // Provide payment link here
    } else {
        // Restart the flow
        await sendServiceOptions(from);
        userState[from].stage = 'service';
    }
}

module.exports = { handleMessage };
