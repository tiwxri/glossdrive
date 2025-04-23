const express = require('express');
const { storeOrderInAirtable } = require('./services/airtableService'); // adjust path as needed

const app = express();
app.use(express.json());

app.get('/test-airtable', async (req, res) => {
  const mockOrder = {
    phone_number: '+911234567890',
    service: 'Basic Wash',
    addOns: 'Tyre Polish, Interior Vacuum',
    time_slot: '7:00 - 7:30 AM',
    booking_type: 'One-time',
    payment_status: 'Paid',
    payment_id: 'TEMP123456',
    amount: 499,
    notes: 'Customer prefers early morning.'
  };

  await storeOrderInAirtable(mockOrder);
  res.send('✅ Mock order sent to Airtable!');
});

app.listen(4000, () => console.log(`✅ Test server running at http://localhost:4000`));
