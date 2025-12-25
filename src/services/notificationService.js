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
  email: {
    enabled: true, // Client-side email (works on Spark plan!)
    provider: 'sendgrid', // 'sendgrid' (client-side only)
    fromEmail: 'orders@fudoro.com',
    fromName: 'FUDORO - Authentic Platters',
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
 * Format customer order confirmation message
 */
const formatCustomerConfirmationMessage = (orderData) => {
  const { orderReference, customerInfo, items, totalAmount, eventDate, eventTime, deliveryAddress } = orderData;
  
  const itemsList = items.map(item => 
    `${item.quantity}x ${item.platterName || item.mealBoxName}`
  ).join(', ');

  const message = `
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

  return message;
};

/**
 * Format customer order confirmation message for SMS (shorter version)
 */
const formatCustomerSMS = (orderData) => {
  const { orderReference, totalAmount, eventDate } = orderData;
  
  return `FUDORO Order #${orderReference} confirmed! ₹${totalAmount.toLocaleString('en-IN')} for ${eventDate}. Track: fudoro.com/orders. Help: +918919354409`;
};

/**
 * Send order confirmation to customer via WhatsApp and SMS
 */
export const sendCustomerOrderConfirmation = async (orderData) => {
  if (!NOTIFICATION_CONFIG.enabled) {
    console.log('Notifications disabled');
    return { success: false, message: 'Notifications disabled' };
  }

  const { customerInfo } = orderData;
  const customerPhone = customerInfo.phone;

  if (!customerPhone) {
    console.warn('No customer phone number provided');
    return { success: false, message: 'No phone number' };
  }

  console.log('📧 Sending order confirmation to customer:', customerPhone);

  const results = {
    whatsapp: [],
    sms: [],
    errors: []
  };

  // Format messages
  const whatsappMessage = formatCustomerConfirmationMessage(orderData);
  const smsMessage = formatCustomerSMS(orderData);

  // Send WhatsApp notification
  if (NOTIFICATION_CONFIG.whatsapp.enabled) {
    try {
      let result;
      
      if (NOTIFICATION_CONFIG.whatsapp.provider === 'twilio') {
        result = await sendWhatsAppViaTwilio(customerPhone, whatsappMessage);
      } else if (NOTIFICATION_CONFIG.whatsapp.provider === 'msg91') {
        result = await sendWhatsAppViaMSG91(customerPhone, whatsappMessage);
      } else {
        // Development fallback
        result = logNotification('Customer WhatsApp', customerPhone, whatsappMessage);
      }

      results.whatsapp.push(result);
      
      if (!result.success) {
        results.errors.push(`WhatsApp to customer: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp to customer:', error);
      results.errors.push(`WhatsApp error: ${error.message}`);
    }
  }

  // Send SMS notification
  if (NOTIFICATION_CONFIG.sms.enabled) {
    try {
      let result;
      
      if (NOTIFICATION_CONFIG.sms.provider === 'twilio') {
        result = await sendSMSViaTwilio(customerPhone, smsMessage);
      } else if (NOTIFICATION_CONFIG.sms.provider === 'msg91') {
        result = await sendSMSViaMSG91(customerPhone, smsMessage);
      } else {
        // Development fallback
        result = logNotification('Customer SMS', customerPhone, smsMessage);
      }

      results.sms.push(result);
      
      if (!result.success) {
        results.errors.push(`SMS to customer: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending SMS to customer:', error);
      results.errors.push(`SMS error: ${error.message}`);
    }
  }

  // Summary
  const successCount = results.whatsapp.filter(r => r.success).length + 
                       results.sms.filter(r => r.success).length;
  const totalAttempts = results.whatsapp.length + results.sms.length;

  console.log(`✅ Customer notifications sent: ${successCount}/${totalAttempts}`);
  
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

/**
 * Format customer email HTML template
 */
const formatCustomerEmailHTML = (orderData) => {
  const { orderReference, customerInfo, items, totalAmount, eventDate, eventTime, deliveryAddress } = orderData;
  
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}x ${item.platterName || item.mealBoxName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.pricePerItem * item.quantity).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - FUDORO</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Thank you for choosing FUDORO</p>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #fff9f0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Order Reference</p>
              <h2 style="margin: 10px 0 0 0; color: #FF6B6B; font-size: 32px; letter-spacing: 2px;">#${orderReference}</h2>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📋 Order Details</h3>
              <table width="100%" cellpadding="5" cellspacing="0">
                <tr>
                  <td style="color: #666;">Customer Name:</td>
                  <td style="text-align: right; font-weight: bold; color: #333;">${customerInfo.name}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Phone:</td>
                  <td style="text-align: right; font-weight: bold; color: #333;">${customerInfo.phone}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Event Date:</td>
                  <td style="text-align: right; font-weight: bold; color: #333;">${eventDate}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Event Time:</td>
                  <td style="text-align: right; font-weight: bold; color: #333;">${eventTime}</td>
                </tr>
                <tr>
                  <td style="color: #666;">Venue:</td>
                  <td style="text-align: right; font-weight: bold; color: #333;">${deliveryAddress}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📦 Your Order</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #FF6B6B;">
                ${itemsHTML}
                <tr>
                  <td style="padding: 15px 10px; font-size: 18px; font-weight: bold; color: #333;">Total Amount</td>
                  <td style="padding: 15px 10px; text-align: right; font-size: 22px; font-weight: bold; color: #FF6B6B;">₹${totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa;">
              <h3 style="margin: 0 0 15px 0; color: #333;">✅ What Happens Next?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                <li>We'll prepare your order fresh with premium ingredients</li>
                <li>You'll receive updates via WhatsApp and SMS</li>
                <li>Our team will deliver on time for your event</li>
                <li>Contact us anytime for changes or questions</li>
              </ul>
            </td>
          </tr>

          <!-- Support -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #fff;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📞 Need Help?</h3>
              <p style="margin: 5px 0; color: #666;">Call/WhatsApp: <strong style="color: #FF6B6B;">+91 8919354409</strong></p>
              <p style="margin: 5px 0; color: #666;">Hyderabad: <strong style="color: #FF6B6B;">+91 9703344431</strong></p>
              <p style="margin: 15px 0 5px 0; color: #666;">Email: <a href="mailto:orders@fudoro.com" style="color: #FF6B6B; text-decoration: none;">orders@fudoro.com</a></p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">FUDORO - Authentic Platters for Every Occasion</p>
              <p style="margin: 5px 0 0 0; color: #999; font-size: 12px;">Hyderabad | Khammam</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Send email via SendGrid (Client-Side - Works on Spark Plan!)
 * No Cloud Functions needed - calls SendGrid API directly from browser
 */
const sendEmailViaSendGrid = async (toEmail, subject, htmlContent) => {
  try {
    const apiKey = process.env.REACT_APP_SENDGRID_API_KEY;

    if (!apiKey) {
      console.warn('SendGrid API key not configured (development mode)');
      return logNotification('Email', toEmail, `Subject: ${subject}\n\n${htmlContent.substring(0, 200)}...`);
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          subject: subject
        }],
        from: {
          email: NOTIFICATION_CONFIG.email.fromEmail,
          name: NOTIFICATION_CONFIG.email.fromName
        },
        content: [{
          type: 'text/html',
          value: htmlContent
        }]
      })
    });

    if (response.ok || response.status === 202) {
      console.log('✅ Email sent via SendGrid:', toEmail);
      return { success: true, provider: 'sendgrid' };
    } else {
      const error = await response.json();
      console.error('❌ SendGrid error:', error);
      return { success: false, error: error.errors?.[0]?.message || 'Failed to send' };
    }
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send order confirmation email to customer
 * Client-side implementation - works on FREE Spark plan!
 */
export const sendCustomerOrderEmail = async (orderData) => {
  if (!NOTIFICATION_CONFIG.enabled || !NOTIFICATION_CONFIG.email.enabled) {
    console.log('Email notifications disabled');
    return { success: false, message: 'Email disabled' };
  }

  const { customerInfo, orderReference } = orderData;
  const customerEmail = customerInfo.email;

  if (!customerEmail) {
    console.warn('No customer email provided');
    return { success: false, message: 'No email address' };
  }

  console.log('📧 Sending order confirmation email to:', customerEmail);

  try {
    const subject = `Order Confirmed #${orderReference} - FUDORO`;
    const htmlContent = formatCustomerEmailHTML(orderData);

    const result = await sendEmailViaSendGrid(customerEmail, subject, htmlContent);

    if (result.success) {
      console.log('✅ Order confirmation email sent successfully');
    } else {
      console.warn('⚠️ Email failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderNotification,
  sendCustomerOrderConfirmation,
  sendCustomerOrderEmail,
  sendStatusUpdateNotification,
  NOTIFICATION_CONFIG
};
