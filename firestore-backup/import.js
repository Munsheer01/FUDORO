const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('./ServiceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importCollection(collectionName, dataFile, documentIds = null, options = {}) {
    try {
        console.log(`Starting import to ${collectionName}...`);
        
        // Read JSON data
        const jsonData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        let entries;
        if (documentIds && documentIds.length > 0) {
            // Filter specific documents
            console.log(`📋 Importing specific documents: ${documentIds.join(', ')}`);
            entries = Object.entries(jsonData).filter(([docId]) => documentIds.includes(docId));
            
            if (entries.length === 0) {
                console.error('❌ None of the specified documents found in the data file');
                return;
            }
        } else {
            // Import all documents
            entries = Object.entries(jsonData);
        }
        
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
                
                if (options.merge) {
                    batch.set(docRef, docData, { merge: true });
                } else {
                    batch.set(docRef, docData);
                }
            });
            
            await batch.commit();
            processedCount += currentBatch.length;
            console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} completed. Progress: ${processedCount}/${entries.length}`);
        }
        
        console.log(`🎉 Import completed! ${processedCount} documents imported to ${collectionName}`);
    } catch (error) {
        console.error('❌ Import failed:', error);
        throw error;
    }
}

// Command line argument parsing
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        collection: null,
        file: null,
        documents: [],
        useCustomId: true,
        merge: false,
        help: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--collection':
            case '-c':
                options.collection = args[i + 1];
                i++;
                break;
            case '--file':
            case '-f':
                options.file = args[i + 1];
                i++;
                break;
            case '--documents':
            case '-d':
                options.documents = args[i + 1].split(',').map(id => id.trim());
                i++;
                break;
            case '--auto-id':
                options.useCustomId = false;
                break;
            case '--merge':
            case '-m':
                options.merge = true;
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
🔥 Firestore Import Tool

Usage: node enhanced_import.js [options]

Options:
  -c, --collection <name>     Collection name to import to (required)
  -f, --file <path>           JSON file to import from (required)
  -d, --documents <ids>       Comma-separated document IDs to import (optional)
  --auto-id                   Use auto-generated IDs instead of original IDs
  -m, --merge                 Merge with existing documents instead of overwriting
  -h, --help                  Show this help message

Examples:
  # Import entire file to collection
  node enhanced_import.js --collection "users" --file "./exports/users_backup.json"
  
  # Import specific documents
  node enhanced_import.js -c "orders" -f "./data/orders.json" -d "order1,order2"
  
  # Import with merge and auto-generated IDs
  node enhanced_import.js -c "products" -f "./data/products.json" --auto-id --merge
    `);
}

// Main execution
async function main() {
    const options = parseArguments();
    
    if (options.help) {
        showHelp();
        process.exit(0);
    }
    
    if (!options.collection || !options.file) {
        console.error('❌ Collection name and file path are required');
        console.log('Use --help for usage information');
        process.exit(1);
    }
    
    // Check if file exists
    if (!fs.existsSync(options.file)) {
        console.error(`❌ File not found: ${options.file}`);
        process.exit(1);
    }
    
    try {
        await importCollection(
            options.collection,
            options.file,
            options.documents.length > 0 ? options.documents : null,
            {
                useCustomId: options.useCustomId,
                merge: options.merge
            }
        );
        console.log('🎉 Import process completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Import process failed:', error);
        process.exit(1);
    }
}

main();
