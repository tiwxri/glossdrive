// utils/airtableService.js
const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

async function storeOrderInAirtable(orderData) {
  try {
    await base('Orders').create([
      {
        fields: {
          phone_number: orderData.phone_number,
          service: orderData.service,
          'Add-ons': orderData.addOns || '',
          time_slot: orderData.time_slot,
          booking_type: orderData.booking_type,
          payment_status: orderData.payment_status,
          payment_id: orderData.payment_id,
          amount: orderData.amount,
          timestamp: new Date().toISOString(),
          notes: orderData.notes || ''
        }
      }
    ]);
    console.log('✅ Order saved to Airtable');
  } catch (error) {
    console.error('❌ Error saving order to Airtable:', error);
  }
}

module.exports = { storeOrderInAirtable };
