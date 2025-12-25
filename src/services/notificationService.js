// src/services/notificationService.js - WhatsApp & SMS Notifications

/**
 * Notification Service for FUDORO
 * Sends real-time notifications via WhatsApp and SMS when orders are placed
 * 
 * Supported Providers:
 * - WhatsApp: Twilio, MSG91, WATI, or direct WhatsApp Business API
 * - SMS: Twilio, MSG91, Firebase SMS
 */

// Notification configuration
const NOTIFICATION_CONFIG = {
  enabled: true, // Set to false to disable all notifications
  whatsapp: {
    enabled: true,
    provider: 'twilio', // 'twilio', 'msg91', 'wati', 'direct'
    businessNumbers: ['+918919354409', '+919703344431'], // Hyderabad
  },
  sms: {
    enabled: true,
    provider: 'twilio', // 'twilio', 'msg91', 'firebase'
    businessNumbers: ['+918919354409', '+919703344431'], // Hyderabad
  },
  fallback: {
    useEmail: true, // Fallback to email if WhatsApp/SMS fails
    emailAddress: 'orders@fudoro.com',
  }
};

/**
 * Format order details for notification message
 */
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

/**
 * Send WhatsApp notification via Twilio
 */
const sendWhatsAppViaTwilio = async (phoneNumber, message) => {
  try {
    // Twilio WhatsApp API endpoint
    const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
    const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.REACT_APP_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured');
      return { success: false, error: 'Configuration missing' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', twilioWhatsAppNumber);
    formData.append('To', `whatsapp:${phoneNumber}`);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ WhatsApp sent via Twilio:', data.sid);
      return { success: true, messageId: data.sid };
    } else {
      const error = await response.json();
      console.error('❌ Twilio WhatsApp error:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS notification via Twilio
 */
const sendSMSViaTwilio = async (phoneNumber, message) => {
  try {
    const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID;
    const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.REACT_APP_TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.warn('Twilio SMS credentials not configured');
      return { success: false, error: 'Configuration missing' };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    // Shorten message for SMS (160 characters limit)
    const shortMessage = message.length > 160 ? message.substring(0, 157) + '...' : message;
    
    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', phoneNumber);
    formData.append('Body', shortMessage);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SMS sent via Twilio:', data.sid);
      return { success: true, messageId: data.sid };
    } else {
      const error = await response.json();
      console.error('❌ Twilio SMS error:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp notification via MSG91 (Popular in India)
 */
const sendWhatsAppViaMSG91 = async (phoneNumber, message) => {
  try {
    const authKey = process.env.REACT_APP_MSG91_AUTH_KEY;
    const templateId = process.env.REACT_APP_MSG91_WHATSAPP_TEMPLATE_ID;

    if (!authKey) {
      console.warn('MSG91 credentials not configured');
      return { success: false, error: 'Configuration missing' };
    }

    const url = 'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
    
    const payload = {
      integrated_number: process.env.REACT_APP_MSG91_WHATSAPP_NUMBER,
      content_type: 'template',
      payload: {
        to: phoneNumber.replace('+', ''),
        type: 'template',
        template: {
          name: templateId,
          language: {
            code: 'en',
            policy: 'deterministic'
          },
          components: [{
            type: 'body',
            parameters: [{ type: 'text', text: message }]
          }]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ WhatsApp sent via MSG91:', data);
      return { success: true, messageId: data.message_id };
    } else {
      const error = await response.json();
      console.error('❌ MSG91 WhatsApp error:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('❌ WhatsApp send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send SMS notification via MSG91 (Popular in India)
 */
const sendSMSViaMSG91 = async (phoneNumber, message) => {
  try {
    const authKey = process.env.REACT_APP_MSG91_AUTH_KEY;
    const senderId = process.env.REACT_APP_MSG91_SENDER_ID || 'FUDORO';

    if (!authKey) {
      console.warn('MSG91 credentials not configured');
      return { success: false, error: 'Configuration missing' };
    }

    const url = 'https://api.msg91.com/api/v5/flow/';
    
    const payload = {
      flow_id: process.env.REACT_APP_MSG91_FLOW_ID,
      sender: senderId,
      mobiles: phoneNumber.replace('+91', ''),
      VAR1: message.substring(0, 500) // Limit message length
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ SMS sent via MSG91:', data);
      return { success: true, messageId: data.type };
    } else {
      const error = await response.json();
      console.error('❌ MSG91 SMS error:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('❌ SMS send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Fallback: Create a simple notification log (for development)
 */
const logNotification = (type, phoneNumber, message) => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                 📱 ${type.toUpperCase()} NOTIFICATION                  ║
╠════════════════════════════════════════════════════════════╣
║ To: ${phoneNumber}
║ 
║ Message:
${message.split('\n').map(line => `║ ${line}`).join('\n')}
╚════════════════════════════════════════════════════════════╝
  `);
  
  return { success: true, logged: true };
};

/**
 * Main function: Send order notification to business
 */
export const sendOrderNotification = async (orderData) => {
  if (!NOTIFICATION_CONFIG.enabled) {
    console.log('📴 Notifications disabled in config');
    return { success: true, disabled: true };
  }

  const message = formatOrderMessage(orderData);
  const results = {
    whatsapp: [],
    sms: [],
    errors: []
  };

  // Send WhatsApp notifications
  if (NOTIFICATION_CONFIG.whatsapp.enabled) {
    console.log('📱 Sending WhatsApp notifications...');
    
    for (const phoneNumber of NOTIFICATION_CONFIG.whatsapp.businessNumbers) {
      let result;
      
      switch (NOTIFICATION_CONFIG.whatsapp.provider) {
        case 'twilio':
          result = await sendWhatsAppViaTwilio(phoneNumber, message);
          break;
        case 'msg91':
          result = await sendWhatsAppViaMSG91(phoneNumber, message);
          break;
        default:
          result = logNotification('WhatsApp', phoneNumber, message);
      }
      
      results.whatsapp.push({ phoneNumber, ...result });
      
      if (!result.success) {
        results.errors.push(`WhatsApp to ${phoneNumber}: ${result.error}`);
      }
    }
  }

  // Send SMS notifications
  if (NOTIFICATION_CONFIG.sms.enabled) {
    console.log('💬 Sending SMS notifications...');
    
    for (const phoneNumber of NOTIFICATION_CONFIG.sms.businessNumbers) {
      let result;
      
      switch (NOTIFICATION_CONFIG.sms.provider) {
        case 'twilio':
          result = await sendSMSViaTwilio(phoneNumber, message);
          break;
        case 'msg91':
          result = await sendSMSViaMSG91(phoneNumber, message);
          break;
        default:
          result = logNotification('SMS', phoneNumber, message);
      }
      
      results.sms.push({ phoneNumber, ...result });
      
      if (!result.success) {
        results.errors.push(`SMS to ${phoneNumber}: ${result.error}`);
      }
    }
  }

  // Summary
  const successCount = results.whatsapp.filter(r => r.success).length + 
                       results.sms.filter(r => r.success).length;
  const totalAttempts = results.whatsapp.length + results.sms.length;

  console.log(`✅ Notifications sent: ${successCount}/${totalAttempts}`);
  
  return {
    success: successCount > 0,
    results,
    summary: {
      total: totalAttempts,
      successful: successCount,
      failed: results.errors.length
    }
  };
};

/**
 * Send order status update notification to customer
 */
export const sendStatusUpdateNotification = async (orderData, newStatus) => {
  const { customerInfo, orderReference, items } = orderData;
  
  const statusMessages = {
    confirmed: '✅ Your order has been confirmed! We\'ll start preparing soon.',
    preparing: '👨‍🍳 Your order is being prepared with love!',
    ready: '✨ Your order is ready! We\'ll dispatch it soon.',
    dispatched: '🚚 Your order is on the way!',
    delivered: '🎉 Order delivered! Enjoy your meal from FUDORO!',
    cancelled: '❌ Your order has been cancelled. Contact us for details.',
  };

  const message = `
FUDORO Order Update

Order #${orderReference}
Status: ${newStatus.toUpperCase()}

${statusMessages[newStatus] || 'Status updated'}

Items: ${items.map(i => i.platterName || i.mealBoxName).join(', ')}

Need help? Call: +91 8919354409
`.trim();

  // Send to customer's phone number
  const phoneNumber = customerInfo.phone;
  
  // For now, just log (can enable SMS later)
  return logNotification('Customer SMS', phoneNumber, message);
};

export default {
  sendOrderNotification,
  sendStatusUpdateNotification,
  NOTIFICATION_CONFIG
};
