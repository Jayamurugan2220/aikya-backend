import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const SpecialOffer = mongoose.model('SpecialOffer', new mongoose.Schema({}, { strict: false }), 'specialoffers');
    const Testimonial = mongoose.model('Testimonial', new mongoose.Schema({}, { strict: false }), 'testimonials');

    console.log('===== SPECIAL OFFERS =====\n');
    const offers = await SpecialOffer.find();
    console.log(`Total: ${offers.length} offers\n`);
    
    offers.forEach((offer, index) => {
      console.log(`${index + 1}. ${offer.title || 'Untitled'}`);
      console.log(`   Image: ${offer.image || 'NO IMAGE'}`);
      console.log(`   Description: ${offer.description?.substring(0, 50) || 'No description'}...`);
      console.log(`   Valid From: ${offer.validFrom || 'N/A'}`);
      console.log(`   Valid To: ${offer.validTo || 'N/A'}`);
      console.log(`   Active: ${offer.isActive !== false ? 'Yes' : 'No'}\n`);
    });

    console.log('===== TESTIMONIALS =====\n');
    const testimonials = await Testimonial.find();
    console.log(`Total: ${testimonials.length} testimonials\n`);
    
    testimonials.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name || 'No name'}`);
      console.log(`   Rating: ${test.rating || 'N/A'} stars`);
      console.log(`   Message: ${test.message?.substring(0, 60) || 'No message'}...`);
      console.log(`   Company: ${test.company || 'N/A'}`);
      console.log(`   Active: ${test.isActive !== false ? 'Yes' : 'No'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

checkData();
