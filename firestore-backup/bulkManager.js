const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser'); // npm install csv-parser

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

class FirestoreManager {
  // Export collection to JSON
  async exportToJSON(collectionName, outputPath) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const data = {};
      
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      
      fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
      console.log(`✅ Exported ${snapshot.size} documents to ${outputPath}`);
      return data;
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
  
  // Import from JSON
  async importFromJSON(collectionName, filePath, options = {}) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await this.batchWrite(collectionName, data, options);
    } catch (error) {
      console.error('Import failed:', error);
    }
  }
  
  // Import from CSV (for flat data)
  async importFromCSV(collectionName, csvPath, options = {}) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const dataObject = {};
            results.forEach((item, index) => {
              const id = item.id || `doc_${index}`;
              dataObject[id] = item;
            });
            
            await this.batchWrite(collectionName, dataObject, options);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
    });
  }
  
  // Batch write helper
  async batchWrite(collectionName, data, options = {}) {
    const entries = Object.entries(data);
    const batchSize = 500;
    let processed = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = db.batch();
      const currentBatch = entries.slice(i, i + batchSize);
      
      currentBatch.forEach(([docId, docData]) => {
        // Clean data - remove undefined values
        const cleanData = this.cleanData(docData);
        
        const docRef = options.useCustomId 
          ? db.collection(collectionName).doc(docId)
          : db.collection(collectionName).doc();
        
        batch.set(docRef, cleanData, { merge: options.merge || false });
      });
      
      await batch.commit();
      processed += currentBatch.length;
      console.log(`Processed ${processed}/${entries.length} documents`);
    }
    
    console.log(`✅ Successfully processed ${processed} documents`);
  }
  
  // Clean data helper
  cleanData(obj) {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(item => this.cleanData(item));
    
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined) {
        cleaned[key] = this.cleanData(value);
      }
    });
    
    return cleaned;
  }
  
  // Delete collection (be careful!)
  async deleteCollection(collectionName, batchSize = 500) {
    const collectionRef = db.collection(collectionName);
    const query = collectionRef.limit(batchSize);
    
    return new Promise((resolve, reject) => {
      this.deleteQueryBatch(db, query, resolve).catch(reject);
    });
  }
  
  async deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();
    
    const batchSize = snapshot.size;
    if (batchSize === 0) {
      resolve();
      return;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
    process.nextTick(() => {
      this.deleteQueryBatch(db, query, resolve);
    });
  }
}

// Usage examples:
const manager = new FirestoreManager();

async function main() {
  const action = process.argv[2];
  const collection = process.argv[3] || 'Authentic Platters';
  const file = process.argv[4];
  
  switch(action) {
    case 'export':
      await manager.exportToJSON(collection, `${collection}_backup.json`);
      break;
      
    case 'import':
      if (!file) {
        console.log('Please provide file path');
        return;
      }
      if (file.endsWith('.json')) {
        await manager.importFromJSON(collection, file, { useCustomId: true });
      } else if (file.endsWith('.csv')) {
        await manager.importFromCSV(collection, file);
      }
      break;
      
    case 'delete':
      console.log(`⚠️  This will delete all documents in ${collection}`);
      // Uncomment the line below if you're sure
      // await manager.deleteCollection(collection);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node bulkManager.js export [collection]');
      console.log('  node bulkManager.js import [collection] [file.json|file.csv]');
      console.log('  node bulkManager.js delete [collection]');
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = FirestoreManager;
