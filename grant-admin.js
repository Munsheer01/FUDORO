// Grant Admin Access Script
// Run this to make a user an admin: node grant-admin.js <email>

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function grantAdminRole(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log(`✅ Admin claim set for ${email}`);
    
    // Also save to Firestore for easy reference
    await db.collection('users').doc(userRecord.uid).set({
      email: email,
      uid: userRecord.uid,
      role: 'admin',
      isAdmin: true,
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      grantedBy: 'system'
    }, { merge: true });
    
    console.log(`✅ Admin role saved to Firestore`);
    console.log(`\n🎉 SUCCESS! ${email} is now an admin.`);
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
  console.log('Usage: node grant-admin.js <email>');
  console.log('Example: node grant-admin.js munsh5518@gmail.com');
  process.exit(1);
}

grantAdminRole(email);
