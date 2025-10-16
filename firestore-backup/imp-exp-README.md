# Firestore Import/Export Scripts

## Overview
These scripts allow you to export collections or specific documents from Firestore to JSON files, and import them back into Firestore. They support batch operations, custom document IDs, merging, and more.

## Prerequisites
- Node.js installed
- Firebase Admin SDK service account key (`serviceAccountKey.json`) in the same directory
- Install dependencies:  
  ```powershell
  npm install firebase-admin
  ```

## Export Usage

**Command:**
```powershell
node export.js --collection <collectionName>
```
- Exports all documents from the specified collection.

**Export specific documents:**
```powershell
node export.js --collection <collectionName> --documents <docId1,docId2>
```
- Exports only the specified document IDs.

**Help:**
```powershell
node export.js --help
```

**Output:**
- JSON file saved in the `exports/` directory, named with collection, type, and timestamp.

## Import Usage

**Command:**
```powershell
node import.js --collection <collectionName> --file <pathToJson>
```
- Imports all documents from the JSON file into the specified collection.

**Import specific documents:**
```powershell
node import.js --collection <collectionName> --file <pathToJson> --documents <docId1,docId2>
```

**Options:**
- `--auto-id`: Use auto-generated Firestore IDs instead of those in the JSON.
- `--merge` or `-m`: Merge with existing documents instead of overwriting.
- `--help`: Show usage instructions.

**Example:**
```powershell
node import.js --collection "Enhanced_Authentic_Platters" --file "./enhanced_platters.json"
```

## Notes
- Ensure your service account key is valid and has access to the Firestore project.
- For large imports/exports, the scripts handle batching (Firestore limit: 500 documents per batch).
- All logs and errors are printed to the console.
