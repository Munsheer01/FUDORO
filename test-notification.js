// test-notification.js - Test notification service without placing real order
// Run with: node test-notification.js

const testOrderData = {
  orderReference: 'TEST123',
  customerId: 'test-user-123',
  customerInfo: {
    name: 'Test Customer',
    phone: '+919876543210',
    email: 'test@example.com',
    address: 'Test Address, Hyderabad',
    pincode: '500032'
  },
  items: [
    {
      platterName: 'Authentic Hyderabadi Biryani Platter',
      quantity: 15,
      basePrice: 190,
      totalPrice: 2850
    }
  ],
  totalAmount: 2850,
  totalQuantity: 15,
  eventDate: '2025-12-27',
  eventTime: '16:28',
  businessLocation: 'hyderabad',
  status: 'pending'
};

// Simulate the notification function
const formatOrderMessage = (orderData) => {
  const { orderReference, customerInfo, items, totalAmount, eventDate, eventTime, businessLocation } = orderData;
  
  const itemsList = items.map(item => 
    `${item.quantity}x ${item.platterName || item.mealBoxName}`
  ).join(', ');

  const message = `
🍽️ NEW ORDER RECEIVED! 🍽️

📋 Order: #${orderReference}
💰 Amount: ₹${totalAmount.toLocaleString('en-IN')}

👤 Customer Details:
Name: ${customerInfo.name}
Phone: ${customerInfo.phone}
Location: ${customerInfo.pincode}

📦 Items:
${itemsList}

📅 Event Details:
Date: ${eventDate}
Time: ${eventTime}

📍 Business Location: ${businessLocation.toUpperCase()}

🔗 View in Admin: https://fudoro.com/admin/orders

---
Reply to confirm order!
`.trim();

  return message;
};

console.log('\n' + '='.repeat(60));
console.log('🧪 TESTING NOTIFICATION SERVICE');
console.log('='.repeat(60) + '\n');

const message = formatOrderMessage(testOrderData);

console.log('📱 WhatsApp/SMS Message Preview:');
console.log('\n' + '─'.repeat(60));
console.log(message);
console.log('─'.repeat(60) + '\n');

console.log('✅ Message format looks good!');
console.log('\n📋 Next Steps:');
console.log('1. Add your API credentials to .env.development');
console.log('2. Place a real order in the app');
console.log('3. Check your phone for the message!');
console.log('\n' + '='.repeat(60) + '\n');
