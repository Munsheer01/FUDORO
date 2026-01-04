// firestore-backup/setup-collections.js (Enhanced)
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fudoro-webapp'
});

const db = admin.firestore();

async function setupAdminCollections() {
  try {
    console.log('🚀 Setting up FUDORO Admin Collections...\n');

    // 1. Create Orders Collection
    console.log('📋 Creating ORDERS collection...');
    const orderSamples = [
      {
        customerId: 'guest_customer_1',
        customerInfo: {
          name: 'Rajesh Kumar',
          phone: '+91-9876543210',
          email: 'rajesh@example.com',
          address: 'Plot 123, Madhapur, Hyderabad - 500081'
        },
        items: [{
          platterId: 'north-indian-breakfast',
          platterName: 'North Indian Breakfast Platter',
          quantity: 25,
          basePrice: 220,
          totalPrice: 5500,
          selections: [
            {
              categoryName: 'Beverages',
              items: [
                { name: 'Coffee', extraPrice: 0 },
                { name: 'Masala Tea', extraPrice: 0 }
              ]
            },
            {
              categoryName: 'Main Items',
              items: [
                { name: 'Aloo Paratha', extraPrice: 10 },
                { name: 'Bhatura', extraPrice: 15 },
                { name: 'Bread Pakoda', extraPrice: 5 }
              ]
            }
          ]
        }],
        totalAmount: 5500,
        totalQuantity: 25,
        status: 'pending',
        paymentMethod: 'online',
        paymentStatus: 'paid',
        eventDate: '2025-01-20',
        eventTime: '10:00 AM',
        specialInstructions: 'Please deliver on time for corporate meeting',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        customerId: 'guest_customer_2',
        customerInfo: {
          name: 'Priya Sharma',
          phone: '+91-9876543211',
          email: 'priya@example.com',
          address: 'Flat 456, Gachibowli, Hyderabad - 500032'
        },
        items: [{
          platterId: 'south-indian-breakfast',
          platterName: 'South Indian Breakfast Platter',
          quantity: 40,
          basePrice: 190,
          totalPrice: 7600,
          selections: [
            {
              categoryName: 'Beverages',
              items: [
                { name: 'Filter Coffee', extraPrice: 0 },
                { name: 'Tea', extraPrice: 0 }
              ]
            }
          ]
        }],
        totalAmount: 7600,
        totalQuantity: 40,
        status: 'confirmed',
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        eventDate: '2025-01-21',
        eventTime: '9:00 AM',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (let i = 0; i < orderSamples.length; i++) {
      const docRef = await db.collection('orders').add(orderSamples[i]);
      console.log(`✅ Order ${i + 1} created with ID: ${docRef.id}`);
    }

    // 2. Create Inventory Collection
    console.log('\n📦 Creating INVENTORY collection...');
    const inventoryItems = [
      {
        name: 'Basmati Rice',
        description: 'Premium basmati rice for platters',
        category: 'grains',
        currentStock: 100,
        minThreshold: 20,
        maxCapacity: 500,
        unit: 'kg',
        unitPrice: 80,
        supplier: 'Hyderabad Rice Mill',
        supplierContact: '+91-9876543212',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Paneer',
        description: 'Fresh cottage cheese',
        category: 'dairy',
        currentStock: 15,
        minThreshold: 5,
        maxCapacity: 50,
        unit: 'kg',
        unitPrice: 300,
        supplier: 'Fresh Dairy Farm',
        supplierContact: '+91-9876543213',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Mixed Vegetables',
        description: 'Fresh vegetables for curries',
        category: 'vegetables',
        currentStock: 30,
        minThreshold: 10,
        maxCapacity: 100,
        unit: 'kg',
        unitPrice: 50,
        supplier: 'Local Vegetable Market',
        supplierContact: '+91-9876543214',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Cooking Oil',
        description: 'Sunflower cooking oil',
        category: 'oils',
        currentStock: 25,
        minThreshold: 5,
        maxCapacity: 50,
        unit: 'liters',
        unitPrice: 120,
        supplier: 'Oil Distributor',
        supplierContact: '+91-9876543215',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        name: 'Onions',
        description: 'Fresh onions for cooking',
        category: 'vegetables',
        currentStock: 8, // Low stock for testing alerts
        minThreshold: 10,
        maxCapacity: 50,
        unit: 'kg',
        unitPrice: 40,
        supplier: 'Local Vegetable Market',
        supplierContact: '+91-9876543214',
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    for (let i = 0; i < inventoryItems.length; i++) {
      const docRef = await db.collection('inventory').add(inventoryItems[i]);
      console.log(`✅ Inventory item created: ${inventoryItems[i].name} (ID: ${docRef.id})`);
    }

    // 3. Create Inventory Logs Collection
    console.log('\n📊 Creating INVENTORY_LOGS collection...');
    const inventoryLogs = [
      {
        itemName: 'Basmati Rice',
        action: 'restock',
        previousStock: 50,
        newStock: 100,
        difference: 50,
        notes: 'Weekly restock from supplier',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'admin_user'
      },
      {
        itemName: 'Paneer',
        action: 'consumed',
        previousStock: 20,
        newStock: 15,
        difference: -5,
        notes: 'Used for North Indian breakfast orders',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'kitchen_staff'
      },
      {
        itemName: 'Onions',
        action: 'consumed',
        previousStock: 15,
        newStock: 8,
        difference: -7,
        notes: 'Used for curry preparation',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'kitchen_staff'
      }
    ];

    for (let i = 0; i < inventoryLogs.length; i++) {
      const docRef = await db.collection('inventory_logs').add(inventoryLogs[i]);
      console.log(`✅ Inventory log created: ${inventoryLogs[i].itemName} - ${inventoryLogs[i].action}`);
    }

    console.log('\n🎉 SUCCESS! All admin collections created successfully!');
    console.log('\n📋 Collections Created:');
    console.log('   ├── orders (2 sample orders)');
    console.log('   ├── inventory (5 items with 1 low-stock alert)');
    console.log('   └── inventory_logs (3 sample logs)');
    console.log('\n🔗 Check your Firebase Console: https://console.firebase.google.com/project/fudoro-webapp/firestore');

  } catch (error) {
    console.error('❌ Error setting up collections:', error);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupAdminCollections();
