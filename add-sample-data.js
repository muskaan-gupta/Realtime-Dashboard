const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://muskan_67:musk143_kk@cluster0.1plv064.mongodb.net/realtime-analytics';

// Sample data generators
const products = [
  'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M3', 'Dell XPS 13', 'iPad Pro',
  'AirPods Pro', 'Sony WH-1000XM5', 'Nintendo Switch', 'PlayStation 5', 'Xbox Series X',
  'Apple Watch Series 9', 'Tesla Model 3', 'Coffee Maker', 'Smart TV 65"', 'Gaming Chair',
  'Wireless Keyboard', 'Gaming Mouse', 'Webcam HD', 'Monitor 27"', 'Tablet Stand'
];

const categories = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Beauty', 'Food', 'Automotive', 'Other'
];

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'UAE'];
const salesPersons = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Brown', 'David Lee', 'Lisa Chen', 'Tom Garcia', 'Anna Rodriguez'];
const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'];
const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
const customerNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eva Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson'];
const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// Generate random date within last 90 days
function randomDate(days = 90) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (Math.random() * days * 24 * 60 * 60 * 1000));
  return pastDate;
}

// Generate random price
function randomPrice(min = 10, max = 2000) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

// Generate sample sales data
function generateSalesData(count = 50) {
  const sales = [];
  
  for (let i = 0; i < count; i++) {
    const productName = products[Math.floor(Math.random() * products.length)];
    const productCategory = categories[Math.floor(Math.random() * categories.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = randomPrice(20, 500);
    const totalAmount = quantity * unitPrice;
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    sales.push({
      orderId: orderId,
      productName: productName,
      productCategory: productCategory,
      quantity: quantity,
      unitPrice: unitPrice,
      totalAmount: Math.round(totalAmount * 100) / 100,
      customerName: customerName,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
      salesPerson: salesPersons[Math.floor(Math.random() * salesPersons.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      region: regions[Math.floor(Math.random() * regions.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      saleDate: randomDate(90)
    });
  }
  
  return sales;
}

// Generate sample orders data
function generateOrdersData(count = 30) {
  const orders = [];
  const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  for (let i = 0; i < count; i++) {
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const customerId = `CUST-${Math.floor(Math.random() * 10000)}`;
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const numItems = Math.floor(Math.random() * 4) + 1;
    const items = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const productName = products[Math.floor(Math.random() * products.length)];
      const unitPrice = randomPrice(20, 500);
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = unitPrice * quantity;
      
      items.push({
        productId: `PROD-${Math.floor(Math.random() * 10000)}`,
        productName: productName,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: Math.round(totalPrice * 100) / 100
      });
      
      subtotal += totalPrice;
    }
    
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 10% discount sometimes
    const totalAmount = subtotal + tax + shipping - discount;
    
    const shippingAddress = {
      street: `${Math.floor(Math.random() * 9999)} Main St`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
      state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: countries[Math.floor(Math.random() * countries.length)]
    };
    
    orders.push({
      orderNumber: orderNumber,
      customerId: customerId,
      customerName: customerName,
      customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
      customerPhone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      shippingAddress: shippingAddress,
      billingAddress: shippingAddress, // Same as shipping for simplicity
      items: items,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      shipping: shipping,
      discount: Math.round(discount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      orderStatus: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
      orderDate: randomDate(60),
      estimatedDelivery: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Within 2 weeks
      notes: Math.random() > 0.5 ? 'Customer requested fast delivery' : '',
      trackingNumber: Math.random() > 0.3 ? `TRK${Math.floor(Math.random() * 1000000000)}` : ''
    });
  }
  
  return orders;
}

// Generate sample users data
function generateUsersData(count = 10) {
  const users = [];
  const firstNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Avery', 'Quinn', 'Sage'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Lopez'];
  const roles = ['Admin', 'Viewer', 'Manager', 'Analyst'];
  const usedUsernames = new Set();
  
  for (let i = 0; i < count; i++) {
    let firstName, lastName, username;
    
    // Ensure unique username
    do {
      firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 0 ? i : ''}`;
    } while (usedUsernames.has(username));
    
    usedUsernames.add(username);
    
    users.push({
      username: username,
      email: `${username}@company.com`,
      name: `${firstName} ${lastName}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      password: '$2b$10$placeholder', // This would be properly hashed in real scenario
      createdAt: randomDate(180),
      isActive: Math.random() > 0.1
    });
  }
  
  return users;
}

async function addSampleData() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('realtime-analytics');
    
    // Generate sample data
    console.log('📊 Generating sample data...');
    const salesData = generateSalesData(75);
    const ordersData = generateOrdersData(45);
    const usersData = generateUsersData(12);
    
    // Insert sales data
    console.log('💰 Adding sales data...');
    await db.collection('sales').insertMany(salesData);
    console.log(`✅ Added ${salesData.length} sales records`);
    
    // Insert orders data
    console.log('📦 Adding orders data...');
    await db.collection('orders').insertMany(ordersData);
    console.log(`✅ Added ${ordersData.length} order records`);
    
    // Insert users data
    console.log('👥 Adding users data...');
    await db.collection('users').insertMany(usersData);
    console.log(`✅ Added ${usersData.length} user records`);
    
    // Display final counts
    const finalSalesCount = await db.collection('sales').countDocuments();
    const finalOrdersCount = await db.collection('orders').countDocuments();
    const finalUsersCount = await db.collection('users').countDocuments();
    
    console.log('\n🎉 Sample data added successfully!');
    console.log('📈 Final database counts:');
    console.log(`   Sales: ${finalSalesCount}`);
    console.log(`   Orders: ${finalOrdersCount}`);
    console.log(`   Users: ${finalUsersCount}`);
    
    // Calculate some interesting stats
    const totalRevenue = await db.collection('sales').aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const recentSales = await db.collection('sales').countDocuments({
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    console.log('\n💡 Sample statistics:');
    console.log(`   Total Revenue: $${totalRevenue[0]?.total?.toFixed(2) || '0.00'}`);
    console.log(`   Sales in last 7 days: ${recentSales}`);
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await client.close();
    console.log('🔒 Database connection closed');
  }
}

// Run the script
addSampleData();