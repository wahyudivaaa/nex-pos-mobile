/**
 * Firebase Seeding Script untuk NexPOS Mobile
 * Jalankan setelah Firebase setup selesai untuk membuat data awal
 */

const admin = require('firebase-admin');
require('dotenv').config(); // Load environment variables

// Initialize Firebase Admin (gunakan service account key)
// Download service account key dari Firebase Console → Project Settings → Service Accounts
const serviceAccount = require('./nexpos-firebase-adminsdk.json'); // Ganti dengan path ke service account key

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://your-project-id-default-rtdb.firebaseio.com/" // Ganti dengan project ID Anda
});

const db = admin.firestore();

async function seedCategories() {
    console.log('🗂️ Seeding categories...');

    const categories = [{
            name: 'Makanan',
            description: 'Produk makanan utama dan lauk pauk',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Minuman',
            description: 'Minuman segar dan hangat',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Snack',
            description: 'Cemilan dan makanan ringan',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Roti & Kue',
            description: 'Roti dan aneka kue',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    for (const category of categories) {
        await db.collection('categories').add(category);
    }

    console.log('✅ Categories seeded successfully');
}

async function seedProducts() {
    console.log('🛒 Seeding products...');

    // Ambil kategori yang sudah dibuat
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = {};

    categoriesSnapshot.forEach(doc => {
        categories[doc.data().name] = doc.id;
    });

    const products = [
        // Makanan
        {
            name: 'Nasi Goreng Special',
            description: 'Nasi goreng dengan telur, ayam, dan sayuran',
            price: 18000,
            stock: 50,
            alertStock: 10,
            categoryId: categories['Makanan'],
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Ayam Goreng Kremes',
            description: 'Ayam goreng crispy dengan kremes gurih',
            price: 22000,
            stock: 30,
            alertStock: 8,
            categoryId: categories['Makanan'],
            imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Mie Goreng Spesial',
            description: 'Mie goreng dengan telur dan sayuran segar',
            price: 15000,
            stock: 40,
            alertStock: 10,
            categoryId: categories['Makanan'],
            imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },

        // Minuman
        {
            name: 'Es Teh Manis',
            description: 'Teh manis dingin segar',
            price: 5000,
            stock: 100,
            alertStock: 20,
            categoryId: categories['Minuman'],
            imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Jus Alpukat',
            description: 'Jus alpukat segar dengan susu kental manis',
            price: 12000,
            stock: 25,
            alertStock: 5,
            categoryId: categories['Minuman'],
            imageUrl: 'https://images.unsplash.com/photo-1623065422902-4c1e0e640245?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Kopi Hitam',
            description: 'Kopi hitam panas atau dingin',
            price: 8000,
            stock: 60,
            alertStock: 15,
            categoryId: categories['Minuman'],
            imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },

        // Snack
        {
            name: 'Kerupuk Udang',
            description: 'Kerupuk udang crispy',
            price: 3000,
            stock: 80,
            alertStock: 20,
            categoryId: categories['Snack'],
            imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            name: 'Pisang Goreng',
            description: 'Pisang goreng crispy dengan tepung',
            price: 8000,
            stock: 35,
            alertStock: 8,
            categoryId: categories['Snack'],
            imageUrl: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    for (const product of products) {
        await db.collection('products').add(product);
    }

    console.log('✅ Products seeded successfully');
}

async function createAdminUser() {
    console.log('👤 Creating admin user...');

    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexpos.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
    const adminName = process.env.ADMIN_NAME || 'Admin NexPOS';

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
        console.log('⚠️  Warning: Using default admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production.');
    }

    try {
        // Buat user di Firebase Auth
        const user = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminName,
            emailVerified: true
        });

        // Buat profile di Firestore
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: adminEmail,
            name: adminName,
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Admin user created:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);

    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log('⚠️ Admin user already exists');
        } else {
            console.error('❌ Error creating admin user:', error);
        }
    }
}

async function seedAll() {
    try {
        console.log('🚀 Starting Firebase seeding...\n');

        await createAdminUser();
        console.log('');

        await seedCategories();
        console.log('');

        await seedProducts();
        console.log('');

        console.log('🎉 Seeding completed successfully!');
        console.log('\n📱 You can now:');
        console.log(`   1. Login with ${process.env.ADMIN_EMAIL || 'admin@nexpos.com'} / ${process.env.ADMIN_PASSWORD || 'admin123456'}`);
        console.log('   2. Create additional users');
        console.log('   3. Add more products');
        console.log('   4. Start making transactions');

        if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
            console.log('\n🔒 Security Note:');
            console.log('   - Change the default admin password after first login');
            console.log('   - Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables for production');
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

// Jalankan seeding
seedAll();