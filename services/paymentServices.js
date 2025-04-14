async function processPayment(userId, amount) {
    // Your Razorpay or Stripe logic here
    return `🧾 Payment of ₹${amount} for user ${userId} processed.`;
  }
  
  module.exports = { processPayment };
  