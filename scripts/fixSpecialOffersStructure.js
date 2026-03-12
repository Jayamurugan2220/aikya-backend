import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function fixSpecialOffers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check both possible collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name).join(', '));
    console.log('\n');

    // First, let's see what's in the specialoffers collection
    const SpecialOfferIndividual = mongoose.model('SpecialOfferIndividual', new mongoose.Schema({}, { strict: false }), 'specialoffers');
    const individualOffers = await SpecialOfferIndividual.find();
    
    console.log(`Found ${individualOffers.length} individual offer documents:\n`);
    individualOffers.forEach((offer, i) => {
      console.log(`${i+1}. ${offer.title || 'Untitled'}`);
      console.log(`   Image: ${offer.image || 'NO IMAGE'}`);
      console.log(`   Description: ${(offer.description || '').substring(0, 50)}...`);
      console.log('');
    });

    // Now check if there's a main SpecialOffers document
    const SpecialOffers = mongoose.model('SpecialOffers', new mongoose.Schema({
      heading: String,
      subheading: String,
      description: String,
      offers: [{
        title: String,
        subtitle: String,
        tagline: String,
        description: String,
        price: String,
        discount: String,
        features: [String],
        image: String,
        contactNumbers: [String],
      }],
    }, { strict: false }), 'specialoffers');

    let mainDoc = await SpecialOffers.findOne({});
    console.log('\nMain SpecialOffers document:', mainDoc ? 'EXISTS' : 'DOES NOT EXIST');
    
    if (mainDoc) {
      console.log('Heading:', mainDoc.heading);
      console.log('Offers array length:', mainDoc.offers?.length || 0);
      if (mainDoc.offers) {
        mainDoc.offers.forEach((offer, i) => {
          console.log(`  ${i+1}. ${offer.title} - Image: ${offer.image ? 'HAS IMAGE' : 'NO IMAGE'}`);
        });
      }
    }

    // If we have individual documents but no main document with offers array, fix it
    if (individualOffers.length > 0 && (!mainDoc || !mainDoc.offers || mainDoc.offers.length === 0)) {
      console.log('\n🔧 FIXING: Converting individual documents to offers array...\n');
      
      const offersArray = individualOffers.map(offer => ({
        title: offer.title,
        subtitle: offer.subtitle || 'Experience',
        tagline: offer.tagline || 'Modern Comfort',
        description: offer.description,
        price: offer.price,
        discount: offer.discount,
        features: offer.features || [],
        image: offer.image,
        contactNumbers: offer.contactNumbers || ['+91 9042 666 555', '+91 44 6009 6009'],
      }));

      if (!mainDoc) {
        mainDoc = new SpecialOffers({
          heading: 'Special Offers',
          subheading: 'Special Offer',
          description: "Don't miss out on our exclusive limited-time offers",
          offers: offersArray,
        });
      } else {
        mainDoc.offers = offersArray;
      }

      await mainDoc.save();
      console.log('✅ Created/Updated main document with offers array');
      console.log(`   Total offers: ${offersArray.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

fixSpecialOffers();
