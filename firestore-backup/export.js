const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./ServiceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportCollection(collectionName, documentIds = null) {
    try {
        console.log(`Starting export of ${collectionName}...`);
        
        let query = db.collection(collectionName);
        const exportData = {};
        
        if (documentIds && documentIds.length > 0) {
            // Export specific documents
            console.log(`📋 Exporting specific documents: ${documentIds.join(', ')}`);
            
            for (const docId of documentIds) {
                const doc = await db.collection(collectionName).doc(docId).get();
                if (doc.exists) {
                    exportData[doc.id] = doc.data();
                } else {
                    console.warn(`⚠️ Document ${docId} not found in ${collectionName}`);
                }
            }
        } else {
            // Export entire collection
            console.log(`📋 Exporting entire collection: ${collectionName}`);
            const snapshot = await query.get();
            
            snapshot.forEach(doc => {
                exportData[doc.id] = doc.data();
            });
        }
        
        // Save to JSON file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const docSuffix = documentIds ? `_docs_${documentIds.length}` : '_full';
        const filename = `${collectionName}${docSuffix}_backup_${timestamp}.json`;
        
        // Ensure exports directory exists
        const exportsDir = './exports';
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir);
        }
        
        const filepath = path.join(exportsDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
        
        console.log(`✅ Export completed! Saved as: ${filepath}`);
        console.log(`📊 Total documents exported: ${Object.keys(exportData).length}`);
        
        return exportData;
    } catch (error) {
        console.error('❌ Export failed:', error);
        throw error;
    }
}

// Command line argument parsing
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        collection: null,
        documents: [],
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--collection':
            case '-c':
                options.collection = args[i + 1];
                i++;
                break;
            case '--documents':
            case '-d':
                options.documents = args[i + 1].split(',').map(id => id.trim());
                i++;
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }
    
    return options;
}

function showHelp() {
    console.log(`
🔥 Firestore Export Tool

Usage: node enhanced_export.js [options]

Options:
  -c, --collection <name>     Collection name to export (required)
  -d, --documents <ids>       Comma-separated document IDs to export (optional)
  -h, --help                  Show this help message

Examples:
  # Export entire collection
  node enhanced_export.js --collection "Authentic Platters"
  
  # Export specific documents
  node enhanced_export.js --collection "users" --documents "user1,user2,user3"
  
  # Short form
  node enhanced_export.js -c "orders" -d "order123,order456"
    `);
}

// Main execution
async function main() {
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    
    if (!options.collection) {
        console.error('❌ Collection name is required. Use --collection or -c');
        console.log('Use --help for usage information');
        process.exit(1);
    }
    
    try {
        await exportCollection(options.collection, options.documents.length > 0 ? options.documents : null);
        console.log('🎉 Export process completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Export process failed:', error);
        process.exit(1);
    }
}

main();
