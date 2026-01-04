// Test Customer Order Confirmation
// Run with: node test-customer-confirmation.js

const sampleOrder = {
  orderReference: 'TESTXYZ',
  customerInfo: {
    name: 'Rajesh Kumar',
    phone: '+919876543210',
    pincode: '500001',
  },
  items: [
    { quantity: 50, platterName: 'Biryani Platter', pricePerItem: 150 },
    { quantity: 30, platterName: 'Paneer Tikka', pricePerItem: 120 },
  ],
  totalAmount: 11100,
  eventDate: '2025-03-15',
  eventTime: '2:00 PM - 5:00 PM',
  deliveryAddress: 'Gachibowli, Hyderabad',
  businessLocation: 'Hyderabad',
};

// Format customer confirmation message
const formatCustomerConfirmation = (orderData) => {
  const { orderReference, customerInfo, items, totalAmount, eventDate, eventTime, deliveryAddress } = orderData;
  
  const itemsList = items.map(item => 
    `${item.quantity}x ${item.platterName || item.mealBoxName}`
  ).join(', ');

  return `
🎉 Thank you for your order!

FUDORO - Authentic Platters
Order Confirmed: #${orderReference}

📦 Your Order:
${itemsList}

💰 Total: ₹${totalAmount.toLocaleString('en-IN')}

📅 Event Details:
Date: ${eventDate}
Time: ${eventTime}
Venue: ${deliveryAddress}

✅ What's Next?
• We'll prepare your order fresh
• You'll receive updates on WhatsApp/SMS
• Contact us for any changes

📞 Need Help?
Call/WhatsApp: +91 8919354409
Hyderabad: +91 9703344431

Thank you for choosing FUDORO! 🙏
`.trim();
};

// Format SMS version (shorter)
const formatCustomerSMS = (orderData) => {
  const { orderReference, totalAmount, eventDate } = orderData;
  
  return `FUDORO Order #${orderReference} confirmed! ₹${totalAmount.toLocaleString('en-IN')} for ${eventDate}. Track: fudoro.com/orders. Help: +918919354409`;
};

// Test output
console.log('═══════════════════════════════════════════════');
console.log('CUSTOMER ORDER CONFIRMATION TEST');
console.log('═══════════════════════════════════════════════\n');

console.log('📱 WHATSAPP/LONG MESSAGE:');
console.log(formatCustomerConfirmation(sampleOrder));

console.log('\n\n📲 SMS VERSION (Short):');
console.log(formatCustomerSMS(sampleOrder));
console.log(`\nCharacter count: ${formatCustomerSMS(sampleOrder).length} chars`);

console.log('\n\n═══════════════════════════════════════════════');
console.log('✅ Test Complete! Messages formatted successfully');
console.log('═══════════════════════════════════════════════');

console.log('\n📝 INTEGRATION NOTES:');
console.log('1. Customer receives confirmation immediately after order placement');
console.log('2. WhatsApp: Full detailed message with emojis');
console.log('3. SMS: Concise version under 160 characters');
console.log('4. Both sent in parallel with business notifications');
console.log('5. Graceful failure - order succeeds even if notifications fail');
