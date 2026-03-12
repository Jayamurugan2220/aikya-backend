import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Contact } from '../models/Content.js';

dotenv.config();

const updateContactInfo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Contact data with new address and email
    const contactData = {
      heading: "Let's Build",
      headingHighlight: 'Together',
      description: "Ready to transform your dreams into reality? Partner with India's leading real estate developer.",
      companyName: 'AIKYA BUILDERS PVT LTD',
      address: 'No 251, TNHB Colony, Tambaram Sanatorium, Chennai - 600 047',
      contactPersons: 'B. GOPALAKRISHNAN / M B FURHAN SIDDIQ',
      phone: '+91 98765 43210',
      email: 'aikyabuilders@gmail.com',
      mapCoordinates: '12.9968,80.1263', // Coordinates for Tambaram Sanatorium
      updatedAt: Date.now(),
    };

    // Find and update, or create if doesn't exist
    let contact = await Contact.findOne();
    
    if (contact) {
      console.log('Updating existing Contact document...');
      Object.assign(contact, contactData);
      await contact.save();
      console.log('Contact document updated successfully');
    } else {
      console.log('Creating new Contact document...');
      contact = await Contact.create(contactData);
      console.log('Contact document created successfully');
    }

    console.log('\nContact Information:');
    console.log('-------------------');
    console.log(`Company: ${contact.companyName}`);
    console.log(`Address: ${contact.address}`);
    console.log(`Contact Persons: ${contact.contactPersons}`);
    console.log(`Phone: ${contact.phone}`);
    console.log(`Email: ${contact.email}`);
    console.log(`Map Coordinates: ${contact.mapCoordinates}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating contact info:', error);
    process.exit(1);
  }
};

updateContactInfo();
