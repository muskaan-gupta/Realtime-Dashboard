const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = 'mongodb+srv://muskan_67:musk143_kk@cluster0.1plv064.mongodb.net/realtime-analytics';

async function setupDemoAccounts() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('realtime-analytics');
    
    console.log('Setting up demo accounts...');
    
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const viewerPassword = await bcrypt.hash('viewer123', 10);
    
    // Update or create admin account
    const adminResult = await db.collection('users').updateOne(
      { email: 'admin@demo.com' },
      { 
        $set: { 
          username: 'admin',
          password: adminPassword,
          role: 'admin',
          isActive: true,
          name: 'Demo Admin'
        }
      },
      { upsert: true }
    );
    console.log('✅ Admin account ready:', adminResult.upsertedCount ? 'created' : 'updated');
    
    // Update or create viewer account
    const viewerResult = await db.collection('users').updateOne(
      { email: 'viewer@demo.com' },
      { 
        $set: { 
          username: 'viewer',
          password: viewerPassword,
          role: 'viewer',
          isActive: true,
          name: 'Demo Viewer'
        }
      },
      { upsert: true }
    );
    console.log('✅ Viewer account ready:', viewerResult.upsertedCount ? 'created' : 'updated');
    
    console.log('');
    console.log('🎉 Demo accounts ready!');
    console.log('Admin: admin@demo.com / admin123');
    console.log('Viewer: viewer@demo.com / viewer123');
    
  } finally {
    await client.close();
  }
}

setupDemoAccounts().catch(console.error);