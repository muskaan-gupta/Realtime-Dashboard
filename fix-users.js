const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://muskan_67:musk143_kk@cluster0.1plv064.mongodb.net/realtime-analytics';

async function fixUsers() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('realtime-analytics');
    
    console.log('Fixing users with missing usernames...');
    
    // Update admin user
    const adminResult = await db.collection('users').updateOne(
      { email: 'admin@demo.com' },
      { $set: { username: 'admin' } }
    );
    console.log('Admin user updated:', adminResult.modifiedCount);
    
    // Update viewer user if exists
    const viewerResult = await db.collection('users').updateOne(
      { email: 'viewer@demo.com' },
      { $set: { username: 'viewer' } }
    );
    console.log('Viewer user updated:', viewerResult.modifiedCount);
    
    // Fix any other users without usernames
    const usersWithoutUsername = await db.collection('users').find({ 
      $or: [
        { username: { $exists: false } },
        { username: null },
        { username: '' }
      ]
    }).toArray();
    
    console.log('Users without username:', usersWithoutUsername.length);
    
    for (let user of usersWithoutUsername) {
      const username = user.email.split('@')[0]; // Use email prefix as username
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { username: username } }
      );
      console.log('Fixed user:', user.email, '-> username:', username);
    }
    
    console.log('✅ All users fixed!');
    
    // Verify the fix
    const adminCheck = await db.collection('users').findOne({ email: 'admin@demo.com' });
    console.log('✅ Admin verification - Username:', adminCheck.username);
    
  } finally {
    await client.close();
  }
}

fixUsers().catch(console.error);