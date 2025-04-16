// Main bot logic for initiating and managing the chat

const axios = require('axios');
const { getAvailableTimeSlots } = require('../utils/time');
const { generateServiceButtons, generateAddonButtons } = require('../utils/buttons');
const { getSession, setSession, deleteSession } = require('../firebase/session');

// WhatsApp Cloud API credentials
const META_WHATSAPP_API_URL = 'https://graph.facebook.com/v15.0/';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

async function handleMessage(message, from) {
    let user = await getSession(from) || {};

    if (!user.name) {
        // Greet user and ask for name
        await sendMessage(from, `Hello! What's your name?`);
        await setSession(from, { ...user, stage: 'name' });
    } else if (user.stage === 'name') {
        // Save name and ask for location
        user.name = message;
        await sendButtons(from, 'Where do you stay?', [
            { label: 'U Block DLF phase 3', value: 'DLF' },
            { label: 'Others', value: 'Others' }
        ]);
        await setSession(from, { ...user, stage: 'location' });
    } else if (user.stage === 'location') {
        if (message === 'Others') {
            await sendMessage(from, 'Sorry, we do not service your location.');
            await deleteSession(from); // End chat
        } else {
            await sendServiceOptions(from);
            await setSession(from, { ...user, location: message, stage: 'service' });
        }
    } else if (user.stage === 'service') {
        await handleServiceSelection(message, from, user);
    } else if (user.stage === 'addon') {
        await handleAddonSelection(message, from, user);
    } else if (user.stage === 'time') {
        await handleTimeSlotSelection(message, from, user);
    } else if (user.stage === 'payment') {
        await handlePaymentSelection(message, from, user);
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
        console.error('Error sending message:', error?.response?.data || error);
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
        interactive: {
            type: 'button',
            body: { text: message },
            action: { buttons: buttonPayload },
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
        console.error('Error sending buttons:', error?.response?.data || error);
    }
}

// Generate service options
async function sendServiceOptions(from) {
    const buttons = generateServiceButtons();
    await sendButtons(from, 'What services are you looking for?', buttons);
}

// Handle service selection
async function handleServiceSelection(service, from, user) {
    if (service === 'Exterior Car Cleaning' || service === 'Interior Car Cleaning') {
        await sendAddonOptions(from);
        await setSession(from, { ...user, service, stage: 'addon' });
    } else {
        // Whole car cleaning skips addon
        await sendTimeSlots(from);
        await setSession(from, { ...user, service, stage: 'time' });
    }
}

// Send addon options
async function sendAddonOptions(from) {
    const buttons = generateAddonButtons();
    await sendButtons(from, 'Do you want to add any addons?', buttons);
}

// Handle addon selection
async function handleAddonSelection(addon, from, user) {
    await sendTimeSlots(from);
    await setSession(from, { ...user, addon, stage: 'time' });
}

// Send time slots
async function sendTimeSlots(from) {
    const timeSlots = getAvailableTimeSlots();
    await sendButtons(from, 'Please select a preferred time slot:', timeSlots);
}

// Handle time slot selection
async function handleTimeSlotSelection(timeSlot, from, user) {
    await sendPaymentOptions(from);
    await setSession(from, { ...user, timeSlot, stage: 'payment' });
}

// Send payment options
async function sendPaymentOptions(from) {
    const buttons = [
        { label: 'Pay Now', value: 'pay_now' },
        { label: 'Start Over', value: 'start_over' },
    ];
    await sendButtons(from, 'Would you like to proceed with payment or start over?', buttons);
}

// Handle payment or restart
async function handlePaymentSelection(selection, from, user) {
    if (selection === 'pay_now') {
        await sendMessage(from, 'Proceeding to payment... (link coming soon)');
        // Here you can integrate with Razorpay or Stripe
    } else {
        await sendServiceOptions(from);
        await setSession(from, { ...user, stage: 'service' });
    }
}

module.exports = { handleMessage };
