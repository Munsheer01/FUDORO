// firestore-backup/import-real-meal-boxes.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fudoro-webapp'
});

const db = admin.firestore();

// ✅ REAL MEAL BOXES DATA from your actual content
const realMealBoxesData = [
  {
    id: "twin-treat-box-2comp",
    name: "Twin Treat Box",
    displayName: "Twin Treat Box (2 Compartments)",
    description: "Two compartments of pure flavor. Select either vegetarian or non-vegetarian options, complete with special rice and a flavorful curry.",
    category: "meal-boxes",
    
    configuration: {
      totalCompartments: 2,
      layout: [
        { position: 1, type: "large", category: "flavored-rice", displayName: "Flavored Rice", required: true },
        { position: 2, type: "medium", category: "curry", displayName: "Curry", required: true }
      ]
    },
    
    pricing: {
      veg: { basePrice: 120, pricePerPlate: 120, currency: "INR" },
      nonVeg: { basePrice: 150, pricePerPlate: 150, currency: "INR" }
    },
    
    foodOptions: {
      "flavored-rice": {
        veg: [
          { id: "bagaraa-rice", name: "Bagaraa", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "jeera-rice", name: "Jeera", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "veg-pulav", name: "Veg Pulav", isDefault: false, extraPrice: 10, isAvailable: true },
          { id: "veg-biryani", name: "Veg Biryani", isDefault: false, extraPrice: 15, isAvailable: true },
          { id: "paneer-biryani", name: "Paneer Biryani", isDefault: false, extraPrice: 20, isAvailable: true }
        ],
        nonVeg: [
          { id: "fish-biryani", name: "Fish Biryani", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "chicken-dum-biryani", name: "Chicken Dum", isDefault: false, extraPrice: 15, isAvailable: true },
          { id: "chicken-fry-biryani", name: "Chicken Fry Biryani", isDefault: false, extraPrice: 20, isAvailable: true }
        ]
      },
      "curry": {
        veg: [
          { id: "paneer-masala", name: "Paneer Masala", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "kadai-veg", name: "Kadai Veg", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "gutti-vankaya", name: "Gutti Vankaya", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "mushroom-curry", name: "Mushroom", isDefault: false, extraPrice: 8, isAvailable: true },
          { id: "aloo-kurma", name: "Aloo Kurma", isDefault: false, extraPrice: 5, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-curry", name: "Chicken Curry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-curry", name: "Fish Curry", isDefault: false, extraPrice: 10, isAvailable: true },
          { id: "egg-masala", name: "Egg Masala", isDefault: false, extraPrice: 5, isAvailable: true }
        ]
      }
    },
    
    businessRules: {
      minimumOrder: 10,
      maximumOrder: 100,
      advanceBookingHours: 2,
      preparationTime: { min: 30, max: 45, unit: "minutes" }
    },
    
    availability: { isActive: true, isPopular: true },
    location: { city: "Hyderabad", areas: ["Madhapur", "Gachibowli", "Hitech City"] }
  },

  {
    id: "triple-treat-box-3comp",
    name: "Triple Treat Box",
    displayName: "Triple Treat Box (3 Compartments)",
    description: "Three compartments of simple indulgence. Choose from vegetarian and non-vegetarian options, each including special rice, sweet dessert, and flavorful curry.",
    category: "meal-boxes",
    
    configuration: {
      totalCompartments: 3,
      layout: [
        { position: 1, type: "large", category: "flavored-rice", displayName: "Flavored Rice", required: true },
        { position: 2, type: "medium", category: "curry", displayName: "Curry", required: true },
        { position: 3, type: "small", category: "dessert", displayName: "Dessert", required: true }
      ]
    },
    
    pricing: {
      veg: { basePrice: 150, pricePerPlate: 150, currency: "INR" },
      nonVeg: { basePrice: 180, pricePerPlate: 180, currency: "INR" }
    },
    
    foodOptions: {
      "flavored-rice": {
        veg: [
          { id: "bagaraa-rice", name: "Bagaraa", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "veg-biryani", name: "Veg Biryani", isDefault: false, extraPrice: 15, isAvailable: true },
          { id: "paneer-biryani", name: "Paneer Biryani", isDefault: false, extraPrice: 20, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-dum-biryani", name: "Chicken Dum", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-biryani", name: "Fish Biryani", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "curry": {
        veg: [
          { id: "paneer-masala", name: "Paneer Masala", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "kadai-veg", name: "Kadai Veg", isDefault: false, extraPrice: 5, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-curry", name: "Chicken Curry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-curry", name: "Fish Curry", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "dessert": {
        veg: [
          { id: "halwa", name: "Halwa", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "double-ka-meetha", name: "Double ka Meetha", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "gulab-jamun", name: "Gulab Jamun", isDefault: false, extraPrice: 8, isAvailable: true },
          { id: "rasmalai", name: "Rasmalai", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      }
    },
    
    businessRules: {
      minimumOrder: 8,
      maximumOrder: 80,
      advanceBookingHours: 2,
      preparationTime: { min: 40, max: 55, unit: "minutes" }
    },
    
    availability: { isActive: true, isPopular: false },
    location: { city: "Hyderabad", areas: ["Madhapur", "Gachibowli"] }
  },

  {
    id: "mega-meal-box-5comp",
    name: "Mega Meal Box",
    displayName: "Mega Meal Box (5 Compartments)",
    description: "Five compartments of diverse culinary experience. Both vegetarian and non-vegetarian options available, complete with rice, curry, fried dish, starter and sweet treat.",
    category: "meal-boxes",
    
    configuration: {
      totalCompartments: 5,
      layout: [
        { position: 1, type: "small", category: "appetizer", displayName: "Appetizer", required: true },
        { position: 2, type: "large", category: "flavored-rice", displayName: "Flavored Rice", required: true },
        { position: 3, type: "medium", category: "curry", displayName: "Curry", required: true },
        { position: 4, type: "medium", category: "crispy-fry", displayName: "Crispy Fry", required: false },
        { position: 5, type: "small", category: "dessert", displayName: "Dessert", required: true }
      ]
    },
    
    pricing: {
      veg: { basePrice: 200, pricePerPlate: 200, currency: "INR" },
      nonVeg: { basePrice: 240, pricePerPlate: 240, currency: "INR" }
    },
    
    foodOptions: {
      "appetizer": {
        veg: [
          { id: "paneer-tikka", name: "Paneer Tikka", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "potato-wedges", name: "Potato Wedges", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "gobi-65", name: "Gobi 65", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "veg-cutlet", name: "Veg Cutlet", isDefault: false, extraPrice: 8, isAvailable: true },
          { id: "paneer-65", name: "Paneer 65", isDefault: false, extraPrice: 10, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-65", name: "Chicken 65", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "apollo-fish", name: "Apollo Fish", isDefault: false, extraPrice: 15, isAvailable: true }
        ]
      },
      "flavored-rice": {
        veg: [
          { id: "veg-biryani", name: "Veg Biryani", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "paneer-biryani", name: "Paneer Biryani", isDefault: false, extraPrice: 15, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-dum-biryani", name: "Chicken Dum", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-biryani", name: "Fish Biryani", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "curry": {
        veg: [
          { id: "paneer-masala", name: "Paneer Masala", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "kadai-veg", name: "Kadai Veg", isDefault: false, extraPrice: 5, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-curry", name: "Chicken Curry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-curry", name: "Fish Curry", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "crispy-fry": {
        veg: [
          { id: "paneer-fry", name: "Paneer Fry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "gobi-fry", name: "Gobi Fry", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "bendakaya-fry", name: "Bendakaya Fry", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "aloo-fry", name: "Aloo Fry", isDefault: false, extraPrice: 3, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-fry", name: "Chicken Fry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-fry", name: "Fish Fry", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "dessert": {
        veg: [
          { id: "halwa", name: "Halwa", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "double-ka-meetha", name: "Double ka Meetha", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "gulab-jamun", name: "Gulab Jamun", isDefault: false, extraPrice: 8, isAvailable: true }
        ]
      }
    },
    
    businessRules: {
      minimumOrder: 5,
      maximumOrder: 50,
      advanceBookingHours: 3,
      preparationTime: { min: 45, max: 60, unit: "minutes" }
    },
    
    availability: { isActive: true, isPopular: true },
    location: { city: "Hyderabad", areas: ["Madhapur", "Gachibowli", "Hitech City"] }
  },

  {
    id: "grand-meal-box-7comp",
    name: "Grand Meal Box",
    displayName: "Grand Meal Box (7 Compartments)",
    description: "Seven compartments of culinary excellence. Vegetarian and non-vegetarian selections available, featuring special rice, curry, fried dish, starter, sweet treat, and extras.",
    category: "meal-boxes",
    
    configuration: {
      totalCompartments: 7,
      layout: [
        { position: 1, type: "small", category: "appetizer", displayName: "Appetizer", required: true },
        { position: 2, type: "large", category: "flavored-rice", displayName: "Flavored Rice", required: true },
        { position: 3, type: "medium", category: "plain-rice", displayName: "Plain Rice", required: false },
        { position: 4, type: "medium", category: "curry", displayName: "Curry", required: true },
        { position: 5, type: "medium", category: "crispy-fry", displayName: "Crispy Fry", required: false },
        { position: 6, type: "small", category: "dessert", displayName: "Dessert", required: true },
        { position: 7, type: "small", category: "extras", displayName: "Extras", required: false }
      ]
    },
    
    pricing: {
      veg: { basePrice: 280, pricePerPlate: 280, currency: "INR" },
      nonVeg: { basePrice: 320, pricePerPlate: 320, currency: "INR" }
    },
    
    foodOptions: {
      "appetizer": {
        veg: [
          { id: "paneer-tikka", name: "Paneer Tikka", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "gobi-65", name: "Gobi 65", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "paneer-65", name: "Paneer 65", isDefault: false, extraPrice: 10, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-65", name: "Chicken 65", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "apollo-fish", name: "Apollo Fish", isDefault: false, extraPrice: 15, isAvailable: true }
        ]
      },
      "flavored-rice": {
        veg: [
          { id: "paneer-biryani", name: "Paneer Biryani", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "veg-biryani", name: "Veg Biryani", isDefault: false, extraPrice: 10, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-dum-biryani", name: "Chicken Dum", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-biryani", name: "Fish Biryani", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "plain-rice": {
        veg: [
          { id: "plain-rice", name: "Plain Rice", isDefault: true, extraPrice: 0, isAvailable: true }
        ],
        nonVeg: [
          { id: "plain-rice", name: "Plain Rice", isDefault: true, extraPrice: 0, isAvailable: true }
        ]
      },
      "curry": {
        veg: [
          { id: "paneer-masala", name: "Paneer Masala", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "kadai-veg", name: "Kadai Veg", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "mushroom-curry", name: "Mushroom", isDefault: false, extraPrice: 8, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-curry", name: "Chicken Curry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-curry", name: "Fish Curry", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "crispy-fry": {
        veg: [
          { id: "paneer-fry", name: "Paneer Fry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "gobi-fry", name: "Gobi Fry", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "cabbage-fry", name: "Cabbage Fry", isDefault: false, extraPrice: 3, isAvailable: true }
        ],
        nonVeg: [
          { id: "chicken-fry", name: "Chicken Fry", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "fish-fry", name: "Fish Fry", isDefault: false, extraPrice: 10, isAvailable: true }
        ]
      },
      "dessert": {
        veg: [
          { id: "kesari", name: "Kesari", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "halwa", name: "Halwa", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "kaju-katli", name: "Kaju Katli", isDefault: false, extraPrice: 15, isAvailable: true }
        ]
      },
      "extras": {
        veg: [
          { id: "dal", name: "Dal", isDefault: true, extraPrice: 0, isAvailable: true },
          { id: "sambar", name: "Sambar", isDefault: false, extraPrice: 5, isAvailable: true },
          { id: "fruit-pickles", name: "Fruit Pickles", isDefault: false, extraPrice: 3, isAvailable: true }
        ]
      }
    },
    
    businessRules: {
      minimumOrder: 4,
      maximumOrder: 40,
      advanceBookingHours: 4,
      preparationTime: { min: 60, max: 75, unit: "minutes" }
    },
    
    availability: { isActive: true, isPopular: false },
    location: { city: "Hyderabad", areas: ["Madhapur", "Gachibowli", "Hitech City"] }
  }
];

async function importRealMealBoxes() {
  try {
    console.log('🍱 Starting REAL FUDORO MealBoxes Import...\n');
    console.log('📂 Based on your actual business content');
    console.log('🔗 Project ID: fudoro-webapp');
    console.log('📊 Collection: MealBoxes\n');

    // Clear existing meal boxes first
    console.log('🧹 Clearing existing meal boxes...');
    const existingBoxes = await db.collection('MealBoxes').get();
    const batch = db.batch();
    existingBoxes.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    if (!existingBoxes.empty) {
      await batch.commit();
      console.log(`✅ Cleared ${existingBoxes.docs.length} existing meal boxes\n`);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const mealBox of realMealBoxesData) {
      try {
        const fullMealBoxData = {
          ...mealBox,
          media: {
            imageUrl: `https://storage.googleapis.com/fudoro-images/meal-boxes/${mealBox.id}.jpg`,
            thumbnailUrl: `https://storage.googleapis.com/fudoro-images/meal-boxes/${mealBox.id}-thumb.jpg`
          },
          seo: {
            slug: mealBox.id,
            metaTitle: `${mealBox.displayName} | FUDORO`,
            metaDescription: mealBox.description,
            keywords: ["meal box", "compartments", "hyderabad", "food delivery"]
          },
          analytics: {
            totalOrders: 0,
            averageRating: 0,
            totalReviews: 0
          },
          // Contact information from your content
          contactInfo: {
            hyderabad: ["+91 8919354409", "+91 9703344431"],
            khammam: ["+91 7396081234", "+91 9246946473"]
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          createdBy: "admin",
          version: "2.0"
        };

        await db.collection('MealBoxes').doc(mealBox.id).set(fullMealBoxData);
        
        console.log(`✅ Successfully imported: ${mealBox.displayName}`);
        console.log(`   ├── Compartments: ${mealBox.configuration?.totalCompartments}`);
        console.log(`   ├── Veg Price: ₹${mealBox.pricing?.veg?.basePrice}`);
        console.log(`   ├── Non-Veg Price: ₹${mealBox.pricing?.nonVeg?.basePrice}`);
        console.log(`   └── Min Order: ${mealBox.businessRules?.minimumOrder} boxes\n`);
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error importing ${mealBox.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('🎉 REAL FUDORO MealBoxes Import Completed Successfully!\n');
    console.log('📋 Import Summary:');
    console.log(`   ├── Total Documents: ${realMealBoxesData.length}`);
    console.log(`   ├── Successfully Imported: ${successCount}`);
    console.log(`   ├── Errors: ${errorCount}`);
    console.log(`   ├── Collection: MealBoxes (Updated with Real Data)`);
    console.log(`   └── Compartment Range: 2-7 compartments\n`);
    
    console.log('🏢 Business Locations:');
    console.log('   ├── Hyderabad: +91 8919354409 / +91 9703344431');
    console.log('   └── Khammam: +91 7396081234 / +91 9246946473\n');
    
    console.log('🌐 Firebase Console: https://console.firebase.google.com/project/fudoro-webapp/firestore');

  } catch (error) {
    console.error('❌ Fatal error during Real MealBoxes import:', error);
  } finally {
    console.log('\n👋 Real data import completed. Exiting...');
    process.exit(0);
  }
}

// Execute the real data import
console.log('🚀 Initializing REAL FUDORO MealBoxes Import Script...');
importRealMealBoxes();
