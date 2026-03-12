import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function addImagesToSpecialOffers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const SpecialOffer = mongoose.model('SpecialOffer', new mongoose.Schema({}, { strict: false }), 'specialoffers');

    const offers = await SpecialOffer.find();

    console.log(`📢 Found ${offers.length} Special Offers\n`);

    // Use existing project images from bucket
    const imageUrls = [
      '/api/images/project-1772260770241-0-WhatsApp-Image-2026-02-26-at-7.15.12-PM-(1).jpeg',
      '/api/images/project-1772260771872-1-WhatsApp-Image-2026-02-26-at-7.15.12-PM.jpeg',
      '/api/images/project-1772260772326-2-WhatsApp-Image-2026-02-26-at-7.15.13-PM-(1).jpeg',
      '/api/images/project-1772260772596-3-WhatsApp-Image-2026-02-26-at-7.15.13-PM-(2).jpeg',
    ];

    let updated = 0;
    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      
      if (!offer.image) {
        const imageUrl = imageUrls[i % imageUrls.length];
        
        await SpecialOffer.updateOne(
          { _id: offer._id },
          { $set: { image: imageUrl } }
        );

        console.log(`✅ ${offer.title || 'Untitled Offer'}`);
        console.log(`   Added image: ${imageUrl}\n`);
        updated++;
      } else {
        console.log(`⏭️  ${offer.title || 'Untitled Offer'}`);
        console.log(`   Already has image: ${offer.image}\n`);
      }
    }

    console.log(`✅ Updated ${updated} special offers with images`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

addImagesToSpecialOffers();
