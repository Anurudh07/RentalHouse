const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use public DNS servers (bypasses Windows local DNS SRV resolution bugs)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server override failed:', e.message);
}
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');

// Sample Unsplash images of houses and apartments
const propertyImages = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80', // Luxury Villa Exterior
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', // Villa Pool
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', // High-end Mansion
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', // Modern Luxury Home
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80', // Suburb Cozy Home
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', // Attic Loft
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', // Apartment Living Room
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', // Contemporary Living Room
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Skyscraper Flat
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', // Modern Subdivisions
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // Neat Studio Flat
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', // Dining view Flat
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', // Parisian Flat
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', // Suburban House Bedroom
  'https://images.unsplash.com/photo-1560185127-6a2806647f81?auto=format&fit=crop&w=800&q=80'  // Modern Kitchen Interior
];

const sampleAmenities = [
  'WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Air Conditioning', 
  '24/7 Security', 'Elevator', 'Power Backup', 'Furnished', 
  'Pet Friendly', 'Balcony', 'Washing Machine'
];

const cities = [
  { name: 'Mumbai', state: 'Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
  { name: 'Bangalore', state: 'Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
  { name: 'Delhi', state: 'NCR', coords: { lat: 28.7041, lng: 77.1025 } },
  { name: 'Pune', state: 'Maharashtra', coords: { lat: 18.5204, lng: 73.8567 } },
  { name: 'Hyderabad', state: 'Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
  { name: 'Noida', state: 'Uttar Pradesh', coords: { lat: 28.5355, lng: 77.3910 } },
  { name: 'Gurgaon', state: 'Haryana', coords: { lat: 28.4595, lng: 77.0266 } },
  { name: 'Chennai', state: 'Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } }
];

const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'PG'];

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentalhouse');
    console.log('Database connected!');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();
    await Favorite.deleteMany();
    await Review.deleteMany();
    await Inquiry.deleteMany();
    console.log('All collections cleared successfully!');

    // 1. Create Admin
    console.log('Seeding admin user...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@rentalhouse.com',
      password: 'admin123', // hooks will re-hash, but mongoose model will re-trigger pre-save
      phone: '+919999999999',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    });

    // 2. Create Owners (10 owners)
    console.log('Seeding 10 owner accounts...');
    const owners = [];
    for (let i = 1; i <= 10; i++) {
      const owner = await User.create({
        name: `Owner Name ${i}`,
        email: `owner${i}@rentalhouse.com`,
        password: 'owner123',
        phone: `+91987654321${i-1}`,
        role: 'owner',
        profileImage: `https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80`
      });
      owners.push(owner);
    }

    // 3. Create Tenants (20 tenants)
    console.log('Seeding 20 tenant accounts...');
    const tenants = [];
    for (let i = 1; i <= 20; i++) {
      const tenant = await User.create({
        name: `Tenant Name ${i}`,
        email: `tenant${i}@rentalhouse.com`,
        password: 'tenant123',
        phone: `+91912345678${i-1}`,
        role: 'tenant',
        profileImage: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80`
      });
      tenants.push(tenant);
    }

    // 4. Create Properties (30 properties)
    console.log('Seeding 30 property listings...');
    const properties = [];
    
    // Generate static attributes to make it diverse
    const adjectives = ['Luxury', 'Premium', 'Cozy', 'Spacious', 'Sleek Modern', 'Vintage', 'Eco-friendly', 'Affordable', 'Stunning', 'Charming'];
    const propertyNouns = {
      Apartment: ['Penthouse', 'Studio Apartment', 'Condo Flat', 'Skyscraper Apartment', 'Attic Loft'],
      Villa: ['Beachside Villa', 'Poolside Villa', 'Bungalow Mansion', 'Modern Villa', 'Country Villa'],
      'Independent House': ['Duplex House', 'Independent Bungalow', 'Family Townhouse', 'Suburban Cottage', 'Independent Floor'],
      PG: ['Single Room PG', 'Shared Room PG', 'Co-Living Suite', 'Student PG Hostel', 'Executive PG Accommodation']
    };

    for (let i = 1; i <= 30; i++) {
      // Pick random parameters
      const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const nounsList = propertyNouns[type];
      const noun = nounsList[Math.floor(Math.random() * nounsList.length)];
      const cityData = cities[Math.floor(Math.random() * cities.length)];
      
      const title = `${adj} ${noun} in ${cityData.name}`;
      const bedrooms = type === 'PG' ? 1 : Math.floor(Math.random() * 4) + 1; // 1 to 4 BHK
      const bathrooms = Math.max(1, bedrooms - (Math.random() > 0.7 ? 1 : 0)); // sensible bath count
      const area = bedrooms * (400 + Math.floor(Math.random() * 300)); // sensible sq ft
      
      // Rent range based on type
      let rent = 15000; // default
      if (type === 'PG') rent = 5000 + Math.floor(Math.random() * 8000);
      else if (type === 'Apartment') rent = 20000 + Math.floor(Math.random() * 60000);
      else if (type === 'Villa') rent = 75000 + Math.floor(Math.random() * 150000);
      else if (type === 'Independent House') rent = 30000 + Math.floor(Math.random() * 70000);
      
      const deposit = rent * 3; // typical 3 months deposit

      // Choose 3-6 random amenities
      const shuffledAmenities = [...sampleAmenities].sort(() => 0.5 - Math.random());
      const selectedAmenities = shuffledAmenities.slice(0, 3 + Math.floor(Math.random() * 4));

      // Choose 2-4 random images
      const shuffledImages = [...propertyImages].sort(() => 0.5 - Math.random());
      const selectedImages = shuffledImages.slice(0, 2 + Math.floor(Math.random() * 3));

      // Select random owner (10 owners)
      const owner = owners[Math.floor(Math.random() * owners.length)];

      // Slightly offset coordinates to create variance
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;
      
      // Property status distribution (most available, few rented, few pending)
      let status = 'available';
      if (i === 5 || i === 12 || i === 25) {
        status = 'rented';
      } else if (i === 8 || i === 19) {
        status = 'pending'; // admin approval pending
      }

      const property = await Property.create({
        title,
        description: `This beautiful ${bedrooms} BHK ${type} is located in the prime area of ${cityData.name}. It offers spacious rooms with modern architecture, premium furnishings, and excellent ventilation. Equipped with top-notch amenities like ${selectedAmenities.slice(0, 3).join(', ')}, it is perfect for families and working professionals looking for a premium lifestyle. Close to markets, public transit, and reputed schools.`,
        rent,
        deposit,
        propertyType: type,
        bedrooms,
        bathrooms,
        area,
        address: `${Math.floor(Math.random() * 900) + 10}, Grand Avenue, Near Town Center`,
        city: cityData.name,
        state: cityData.state,
        pincode: `4000${Math.floor(Math.random() * 80) + 10}`,
        amenities: selectedAmenities,
        images: selectedImages,
        locationCoordinates: {
          lat: cityData.coords.lat + latOffset,
          lng: cityData.coords.lng + lngOffset
        },
        ownerId: owner._id,
        status,
        averageRating: 0 // Will update through reviews seeding
      });

      properties.push(property);
    }

    // 5. Create Reviews (15 reviews from different tenants)
    console.log('Seeding property reviews & triggering rating updates...');
    const reviewTexts = [
      'Absolutely loved staying here! The owner is very responsive and the location is peaceful.',
      'Excellent construction, modern styling, and spacious halls. Recommended!',
      'Decent place, but the parking space is a bit narrow. Amenities are good.',
      'Very close to the tech park. Ideal PG location. Value for money.',
      'A luxury stay. Fully furnished, pool is well-maintained. 5 stars!',
      'Nice breeze and view from the balcony. Rent is slightly high but worth it.',
      'The locality is great. Safe neighborhood with 24/7 security. Good water supply.',
      'Comfortable house, but power backup was down once. Rest is fine.'
    ];

    for (let i = 0; i < 18; i++) {
      // Pick random property and random tenant
      const propIndex = Math.floor(Math.random() * properties.length);
      const tenantIndex = Math.floor(Math.random() * tenants.length);
      
      const property = properties[propIndex];
      const tenant = tenants[tenantIndex];

      // Prevent duplicates reviews from same user on same property
      const exists = await Review.findOne({ propertyId: property._id, tenantId: tenant._id });
      if (!exists) {
        await Review.create({
          propertyId: property._id,
          tenantId: tenant._id,
          rating: Math.floor(Math.random() * 3) + 3, // 3, 4, 5 stars
          reviewText: reviewTexts[Math.floor(Math.random() * reviewTexts.length)]
        });
      }
    }

    // 6. Create Favorites (Wishlists)
    console.log('Seeding wishlists (Favorites)...');
    for (let i = 0; i < 20; i++) {
      const propIndex = Math.floor(Math.random() * properties.length);
      const tenantIndex = Math.floor(Math.random() * tenants.length);
      
      const property = properties[propIndex];
      const tenant = tenants[tenantIndex];

      const exists = await Favorite.findOne({ propertyId: property._id, tenantId: tenant._id });
      if (!exists) {
        await Favorite.create({
          propertyId: property._id,
          tenantId: tenant._id
        });
      }
    }

    // 7. Create Bookings (10 bookings)
    console.log('Seeding booking requests...');
    const bookingStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    for (let i = 0; i < 10; i++) {
      const propIndex = i % properties.length; // spread across properties
      const tenantIndex = i % tenants.length;
      
      const property = properties[propIndex];
      const tenant = tenants[tenantIndex];
      
      // Ensure property is not already booked in seed
      const exists = await Booking.findOne({ propertyId: property._id, tenantId: tenant._id });
      if (!exists) {
        await Booking.create({
          propertyId: property._id,
          tenantId: tenant._id,
          bookingDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000), // past 10 days
          status: bookingStatuses[i % bookingStatuses.length]
        });
      }
    }

    // 8. Create Inquiries (10 inquiries)
    console.log('Seeding inquiries inbox...');
    const messages = [
      'Is this property still available? I would like to schedule a visit tomorrow.',
      'What is the minimum lock-in period for this house? Is the deposit negotiable?',
      'Does the rent include maintenance charges? Please let me know.',
      'Are pets allowed? I have a small friendly cat.',
      'Is there any brokerage involved? Can I contact you directly?'
    ];

    for (let i = 0; i < 10; i++) {
      const propIndex = Math.floor(Math.random() * properties.length);
      const tenantIndex = Math.floor(Math.random() * tenants.length);
      
      const property = properties[propIndex];
      const tenant = tenants[tenantIndex];

      await Inquiry.create({
        tenantId: tenant._id,
        propertyId: property._id,
        name: tenant.name,
        email: tenant.email,
        phone: tenant.phone,
        message: messages[Math.floor(Math.random() * messages.length)]
      });
    }

    console.log('\n=============================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`Created:`);
    console.log(`- 1 Super Admin (admin@rentalhouse.com / admin123)`);
    console.log(`- 10 Owners (owner1@rentalhouse.com to owner10 / owner123)`);
    console.log(`- 20 Tenants (tenant1@rentalhouse.com to tenant20 / tenant123)`);
    console.log(`- 30 Properties scattered in Mumbai, Bangalore, Pune, Delhi, Hyderabad`);
    console.log(`- Reviews, Bookings, Favorites, and Inquiries populated!`);
    console.log('=============================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
