const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importCollection(collectionName, dataFile, options = {}) {
  try {
    console.log(`Starting import to ${collectionName}...`);
    
    // Read JSON data
    const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const entries = Object.entries(jsonData);
    
    console.log(`📁 Found ${entries.length} documents to import`);
    
    // Process in batches of 500 (Firestore limit)
    const batchSize = 500;
    let processedCount = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = entries.slice(i, i + batchSize);
      
      currentBatch.forEach(([docId, docData]) => {
        const docRef = options.useCustomId 
          ? db.collection(collectionName).doc(docId)
          : db.collection(collectionName).doc(); // Auto-generate ID
        
        batch.set(docRef, docData);
      });
      
      await batch.commit();
      processedCount += currentBatch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed. Progress: ${processedCount}/${entries.length}`);
    }
    
    console.log(`🎉 Import completed! ${processedCount} documents imported to ${collectionName}`);
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Usage examples:
const collectionName = 'Authentic Platters';
const backupFile = 'Authentic Platters_backup_2025-08-04T17-00-00-000Z.json'; // Your backup file

// Import with original document IDs
importCollection(collectionName, backupFile, { useCustomId: true })
  .then(() => {
    console.log('Import process completed!');
    process.exit(0);
  })
  .catch(console.error);
