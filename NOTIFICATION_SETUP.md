# WhatsApp & SMS Notification Setup Guide

## ✅ Implementation Complete!

Real-time order notifications via WhatsApp and SMS have been implemented for FUDORO.

---

## 🎯 What's Implemented

### **1. Notification Service** ✓
- File: `src/services/notificationService.js`
- Supports multiple providers (Twilio, MSG91)
- WhatsApp + SMS notifications
- Fallback to console logging (for development)

### **2. Order Integration** ✓
- Automatically triggers after order placement
- Sends to your business numbers
- Non-blocking (won't fail order if notification fails)

### **3. Message Format** ✓
```
🍽️ NEW ORDER RECEIVED! 🍽️

📋 Order: #BNAJMC
💰 Amount: ₹2,850

👤 Customer Details:
Name: Munsheer
Phone: 7897656889
Location: 500032

📦 Items:
15x Platter Name

📅 Event Details:
Date: 2025-12-27
Time: 16:28

📍 Business Location: HYDERABAD

Reply to confirm order!
```

---

## 🚀 Setup Instructions

### **Option 1: Development Mode (NO API Keys Required)**

Perfect for testing - notifications will appear in browser console.

**No setup needed!** Just:
1. Place an order
2. Check browser console (F12)
3. You'll see formatted notification messages

---

### **Option 2: Production Mode with Twilio (Recommended)**

**Best for:** Hyderabad-based business with international reach

#### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial includes $15 credit)
3. Verify your phone number
4. Get your credentials from dashboard:
   - Account SID
   - Auth Token
   - Phone Number (for SMS)
   - WhatsApp Number (use Twilio sandbox)


Option 3: Add MSG91 (Best for Production in India)
Cheaper, better for Indian numbers

Cost: ₹0.10-0.20 per SMS vs Twilio's ₹3.20

Sign up: https://msg91.com/
Get API key
Add to .env.development:
#### Step 2: Configure Environment Variables

Create `.env.development` file in project root:

```bash
# Twilio Configuration
REACT_APP_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token_here
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
REACT_APP_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Enable notifications
REACT_APP_NOTIFICATIONS_ENABLED=true
REACT_APP_NOTIFICATION_PROVIDER=twilio
```

#### Step 3: Test

1. Restart your dev server: `npm start`
2. Place a test order
3. Check your phone for WhatsApp/SMS!

#### Twilio Pricing (India):
- WhatsApp: $0.005 per message (~₹0.40)
- SMS: $0.04 per message (~₹3.20)
- Free trial: $15 credit (~75 WhatsApp messages)

---

### **Option 3: Production Mode with MSG91 (Best for India)**

**Best for:** Indian businesses, cheaper rates, better delivery in India

#### Step 1: Create MSG91 Account
1. Go to: https://msg91.com/
2. Sign up (free credits available)
3. Verify your business
4. Get API credentials from dashboard

#### Step 2: Configure SMS Flow
1. Go to MSG91 Dashboard → Flow
2. Create new flow: "Order Notification"
3. Add variables: {{VAR1}} for order details
4. Copy Flow ID

#### Step 3: Configure WhatsApp (Optional)
1. Apply for WhatsApp Business API
2. Get approval (takes 2-3 days)
3. Create message template
4. Copy Template ID

#### Step 4: Add Environment Variables

```bash
# MSG91 Configuration
REACT_APP_MSG91_AUTH_KEY=your_auth_key_here
REACT_APP_MSG91_SENDER_ID=FUDORO
REACT_APP_MSG91_FLOW_ID=your_flow_id_here
REACT_APP_MSG91_WHATSAPP_NUMBER=918919354409
REACT_APP_MSG91_WHATSAPP_TEMPLATE_ID=your_template_id

# Enable notifications
REACT_APP_NOTIFICATIONS_ENABLED=true
REACT_APP_NOTIFICATION_PROVIDER=msg91
```

#### MSG91 Pricing (India):
- SMS: ₹0.10 - ₹0.20 per message
- WhatsApp: ₹0.25 - ₹0.35 per message
- Much cheaper than Twilio for India!

---

## 📱 Testing the Notifications

### **Test Flow:**

1. **Start dev server:**
   ```bash
   npm start
   ```

2. **Place a test order:**
   - Go to your app
   - Browse platters
   - Customize & add to cart
   - Complete order form
   - Submit order

3. **Check results:**
   
   **Development Mode (no API keys):**
   - Open browser console (F12)
   - Look for notification box with order details
   
   **Production Mode (with API keys):**
   - Check your phone for WhatsApp message
   - Check your phone for SMS
   - Check browser console for success logs

---

## 🎯 What You'll Receive

When a customer places an order, you'll get:

### **WhatsApp Message:**
```
🍽️ NEW ORDER RECEIVED! 🍽️
Order: #BNAJMC
Amount: ₹2,850
Customer: Munsheer (7897656889)
Items: 15x Authentic Hyderabadi Biryani Platter
Event: 27 Dec 2025, 4:28 PM
Location: Hyderabad
```

### **SMS Message:**
```
FUDORO Order #BNAJMC
₹2,850 | Munsheer
Event: 27-Dec 4:28PM
View: fudoro.com/admin
```

---

## ⚙️ Configuration Options

### Enable/Disable Channels

In `src/services/notificationService.js`:

```javascript
const NOTIFICATION_CONFIG = {
  enabled: true,  // Master switch
  whatsapp: {
    enabled: true,  // Toggle WhatsApp
    businessNumbers: ['+918919354409', '+919703344431']
  },
  sms: {
    enabled: true,  // Toggle SMS
    businessNumbers: ['+918919354409']
  }
};
```

### Change Business Numbers

Update the arrays with your actual numbers:
```javascript
businessNumbers: [
  '+918919354409',  // Primary (Hyderabad)
  '+919703344431',  // Secondary
  '+917396081234'   // Khammam
]
```

---

## 🐛 Troubleshooting

### Problem: "Configuration missing"
**Solution:** 
- Check `.env.development` file exists
- Verify API keys are correct
- Restart dev server after adding env vars

### Problem: "WhatsApp not received"
**Solution:**
- For Twilio: Join WhatsApp sandbox first
- For MSG91: Wait for WhatsApp API approval
- Check phone number format (+91 prefix)

### Problem: "SMS not received"
**Solution:**
- Verify Twilio phone number is active
- Check SMS credits in dashboard
- Ensure receiver number is not in DND

### Problem: Notifications slow down order placement
**Solution:**
- Notifications run asynchronously (won't block)
- If still slow, disable in development:
  ```javascript
  NOTIFICATION_CONFIG.enabled = false
  ```

---

## 💰 Cost Comparison

### For 1000 orders/month:

**Twilio (International):**
- WhatsApp: 1000 × $0.005 = $5 (~₹400)
- SMS: 1000 × $0.04 = $40 (~₹3,200)
- **Total: ~₹3,600/month**

**MSG91 (India):**
- WhatsApp: 1000 × ₹0.30 = ₹300
- SMS: 1000 × ₹0.15 = ₹150
- **Total: ~₹450/month**

**Recommendation:** Use MSG91 for Indian business (80% cheaper!)

---

## 🚀 Production Deployment

### Before Going Live:

1. **Get Production API Keys**
   - Don't use trial/sandbox in production
   - Upgrade to paid plan
   - Set spending limits

2. **Update Environment Variables**
   - Create `.env.production`
   - Use production API keys
   - Remove `.env` files from Git!

3. **Test Thoroughly**
   - Place 5-10 test orders
   - Verify all notifications received
   - Check timing (should be instant)

4. **Set Up Monitoring**
   - Check notification delivery rates
   - Monitor API usage
   - Set up alerts for failures

5. **Add to .gitignore**
   ```
   .env
   .env.development
   .env.production
   .env.local
   ```

---

## 🎓 Next Steps

After notifications are working:

1. **Add Customer Notifications**
   - Send order confirmation to customers
   - Send status updates
   - Send delivery notifications

2. **Add Email Notifications**
   - Fallback when SMS fails
   - Send detailed order summary
   - Include invoice/receipt

3. **Add Admin Dashboard**
   - View notification history
   - Resend failed notifications
   - Configure settings via UI

4. **Add Notification Templates**
   - Multiple message formats
   - Language support (English/Hindi)
   - Personalized messages

---

## ✅ Summary

**What's Working:**
- ✅ Notification service created
- ✅ Integrated with order placement
- ✅ Multiple provider support
- ✅ Fallback to console logging
- ✅ Non-blocking (won't fail orders)

**What You Need to Do:**
1. Choose provider (Twilio or MSG91)
2. Get API credentials
3. Add to `.env.development`
4. Test with real order
5. Receive notifications! 🎉

**Current Status:**
- Development Mode: ✅ Working (console logs)
- Production Mode: ⏳ Waiting for API keys

---

**Questions?** Just test it now in development mode - you'll see notifications in console! 🚀

**Last Updated:** December 25, 2025
**Status:** ✅ Ready to Test
