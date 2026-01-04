// Revoke Admin Access Script
// Run this to remove admin access: node revoke-admin.js <email>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function revokeAdminRole(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Remove custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: false });
    console.log(`✅ Admin claim removed for ${email}`);
    
    // Update Firestore
    await db.collection('users').doc(userRecord.uid).set({
      role: 'customer',
      isAdmin: false,
      revokedAt: admin.firestore.FieldValue.serverTimestamp(),
      revokedBy: 'system'
    }, { merge: true });
    
    console.log(`✅ Admin role removed from Firestore`);
    console.log(`\n🎉 SUCCESS! ${email} is no longer an admin.`);
    console.log(`\n⚠️  User must log out and log back in for changes to take effect.\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node revoke-admin.js <email>');
  console.log('Example: node revoke-admin.js user@example.com');
  process.exit(1);
}

revokeAdminRole(email);
