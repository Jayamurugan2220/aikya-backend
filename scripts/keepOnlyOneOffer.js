import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function keepOnlyOneOffer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

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
    
    if (!mainDoc || !mainDoc.offers || mainDoc.offers.length === 0) {
      console.log('❌ No offers found in database');
      return;
    }

    console.log(`📋 Current offers: ${mainDoc.offers.length}`);
    mainDoc.offers.forEach((offer, i) => {
      console.log(`${i+1}. ${offer.title}`);
    });

    // Keep only the first offer
    if (mainDoc.offers.length > 1) {
      console.log('\n🔧 Keeping only the first offer...\n');
      const firstOffer = mainDoc.offers[0];
      mainDoc.offers = [firstOffer];
      await mainDoc.save();
      console.log(`✅ Success! Now showing only: ${firstOffer.title}`);
    } else {
      console.log('\n✅ Already showing only one offer');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

keepOnlyOneOffer();
