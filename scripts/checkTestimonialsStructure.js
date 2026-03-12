import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function checkTestimonialsStructure() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check individual testimonial documents
    const TestimonialItem = mongoose.model('TestimonialItem', new mongoose.Schema({}, { strict: false }), 'testimonials');
    const individualTestimonials = await TestimonialItem.find();
    
    console.log(`Found ${individualTestimonials.length} testimonial documents:\n`);
    individualTestimonials.forEach((test, i) => {
      console.log(`${i+1}. ${test.name || 'No name'}`);
      console.log(`   Rating: ${test.rating || 'N/A'} stars`);
      console.log(`   Content: ${(test.content || test.message || '').substring(0, 60)}...`);
      console.log(`   Company: ${test.company || 'N/A'}`);
      console.log(`   Has testimonials array: ${!!test.testimonials}`);
      if (test.testimonials && Array.isArray(test.testimonials)) {
        console.log(`   Testimonials array length: ${test.testimonials.length}`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

checkTestimonialsStructure();
