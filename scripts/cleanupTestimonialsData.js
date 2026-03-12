import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupTestimonialsData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const TestimonialItem = mongoose.model('TestimonialItem', new mongoose.Schema({}, { strict: false }), 'testimonials');
    const allDocs = await TestimonialItem.find();
    
    console.log(`Total documents: ${allDocs.length}\n`);

    // Find and delete the main document that has testimonials array
    for (const doc of allDocs) {
      if (doc.testimonials && Array.isArray(doc.testimonials)) {
        console.log(`Found main document with testimonials array (${doc.testimonials.length} items)`);
        console.log(`Deleting this document: ${doc._id}\n`);
        await TestimonialItem.deleteOne({ _id: doc._id });
      }
    }

    // Verify remaining documents
    const remaining = await TestimonialItem.find();
    console.log(`✅ Cleanup complete! Remaining testimonials: ${remaining.length}\n`);
    
    remaining.forEach((test, i) => {
      console.log(`${i+1}. ${test.name || 'No name'}`);
      console.log(`   Rating: ${test.rating || 'N/A'}`);
      console.log(`   Company: ${test.company || 'N/A'}`);
      console.log('');
    });

    console.log('\n✅ All individual testimonials are now ready for CMS management!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

cleanupTestimonialsData();
