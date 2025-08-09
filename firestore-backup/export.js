const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  try {
    console.log(`Starting export of ${collectionName}...`);
    
    const snapshot = await db.collection(collectionName).get();
    const exportData = {};
    
    snapshot.forEach(doc => {
      exportData[doc.id] = doc.data();
    });
    
    // Save to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${collectionName}_backup_${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`✅ Export completed! Saved as: ${filename}`);
    console.log(`📊 Total documents exported: ${snapshot.size}`);
    
    return exportData;
  } catch (error) {
    console.error('❌ Export failed:', error);
  }
}

// Export your "Authentic Platters" collection
exportCollection('Authentic Platters')
  .then(() => {
    console.log('🎉 Backup process completed!');
    process.exit(0);
  })
  .catch(console.error);
