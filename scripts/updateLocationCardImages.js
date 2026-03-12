import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { LocationCardItem } from '../models/CMSItems.js';

// Location card image mappings - using your uploaded cloud images
const locationImageMappings = {
  'CHENNAI': '/api/images/project-1772260779292-8-WhatsApp-Image-2026-02-26-at-7.15.15-PM-(1).jpeg',
  'TIRUNELVELI': '/api/images/project-1772260780135-9-WhatsApp-Image-2026-02-26-at-7.15.15-PM-(2).jpeg',
  'CHENGALPATTU': '/api/images/project-1772260783100-14-WhatsApp-Image-2026-02-26-at-7.15.16-PM.jpeg',
};

async function updateLocationCardImages() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('\n📍 Updating Location Card Images...');
    console.log('=' .repeat(60));

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [locationName, imageUrl] of Object.entries(locationImageMappings)) {
      console.log(`\n🔍 Looking for location: ${locationName}`);
      
      const location = await LocationCardItem.findOne({ 
        name: { $regex: new RegExp(`^${locationName}$`, 'i') } 
      });

      if (location) {
        const oldImage = location.image;
        location.image = imageUrl;
        location.updatedAt = Date.now();
        await location.save();
        
        console.log(`✅ Updated ${locationName}`);
        console.log(`   Old: ${oldImage?.substring(0, 50)}...`);
        console.log(`   New: ${imageUrl}`);
        updatedCount++;
      } else {
        console.log(`❌ Location "${locationName}" not found in database`);
        notFoundCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Update Summary:');
    console.log(`   ✅ Updated: ${updatedCount} location cards`);
    console.log(`   ❌ Not Found: ${notFoundCount} location cards`);
    console.log('=' .repeat(60));

    // Display current location cards
    console.log('\n📋 Current Location Cards:');
    const allLocations = await LocationCardItem.find().sort({ order: 1 });
    allLocations.forEach((loc, index) => {
      console.log(`\n${index + 1}. ${loc.name}`);
      console.log(`   Image: ${loc.image?.substring(0, 80)}...`);
      console.log(`   Projects: ${loc.projectCount}`);
      console.log(`   Order: ${loc.order}`);
    });

    console.log('\n✅ Location card images updated successfully!');
    console.log('🎉 Your location cards now use cloud bucket images\n');

  } catch (error) {
    console.error('❌ Error updating location card images:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the update
updateLocationCardImages()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
