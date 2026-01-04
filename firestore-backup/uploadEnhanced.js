// uploadEnhanced.js
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin (using your existing serviceAccountKey.json)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadEnhancedData() {
  try {
    console.log('🚀 Starting upload of enhanced platter data...');
    
    // Read the enhanced data
    const rawData = fs.readFileSync('./enhanced_platters.json', 'utf8');
    const data = JSON.parse(rawData);
    
    const entries = Object.entries(data);
    console.log(`📊 Found ${entries.length} enhanced documents to upload`);
    
    // Upload in batches
    const batchSize = 500;
    let totalUploaded = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = entries.slice(i, i + batchSize);
      
      currentBatch.forEach(([docId, docData]) => {
        // Upload to a new collection: "Enhanced_Authentic_Platters"
        const docRef = db.collection('Enhanced_Authentic_Platters').doc(docId);
        batch.set(docRef, docData);
      });
      
      await batch.commit();
      totalUploaded += currentBatch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} uploaded. Progress: ${totalUploaded}/${entries.length}`);
    }
    
    console.log(`🎉 Upload completed successfully!`);
    console.log(`📈 Total documents uploaded: ${totalUploaded}`);
    console.log(`📁 Collection: Enhanced_Authentic_Platters`);
    
    // Verify upload
    console.log('🔍 Verifying upload...');
    const snapshot = await db.collection('Enhanced_Authentic_Platters').get();
    console.log(`✅ Verification: ${snapshot.size} documents found in Firestore`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the upload
uploadEnhancedData();
