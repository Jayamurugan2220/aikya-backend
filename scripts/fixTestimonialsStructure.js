import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function fixTestimonials() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check individual testimonial documents
    const TestimonialIndividual = mongoose.model('TestimonialIndividual', new mongoose.Schema({}, { strict: false }), 'testimonials');
    const individualTestimonials = await TestimonialIndividual.find();
    
    console.log(`Found ${individualTestimonials.length} individual testimonial documents:\n`);
    individualTestimonials.forEach((test, i) => {
      console.log(`${i+1}. ${test.name || 'No name'}`);
      console.log(`   Rating: ${test.rating || 'N/A'} stars`);
      console.log(`   Message: ${(test.message || test.content || '').substring(0, 50)}...`);
      console.log('');
    });

    // Check main Testimonials document
    const Testimonials = mongoose.model('Testimonials', new mongoose.Schema({
      heading: String,
      subheading: String,
      description: String,
      testimonials: [{
        name: String,
        role: String,
        company: String,
        content: String,
        message: String,
        image: String,
        rating: Number,
        location: String,
      }],
    }, { strict: false }), 'testimonials');

    let mainDoc = await Testimonials.findOne({});
    console.log('\nMain Testimonials document:', mainDoc ? 'EXISTS' : 'DOES NOT EXIST');
    
    if (mainDoc) {
      console.log('Heading:', mainDoc.heading);
      console.log('Testimonials array length:', mainDoc.testimonials?.length || 0);
      if (mainDoc.testimonials) {
        mainDoc.testimonials.forEach((test, i) => {
          console.log(`  ${i+1}. ${test.name} - ${test.rating} stars`);
        });
      }
    }

    // If we have individual documents but no main document with testimonials array, fix it
    if (individualTestimonials.length > 0 && (!mainDoc || !mainDoc.testimonials || mainDoc.testimonials.length === 0)) {
      console.log('\n🔧 FIXING: Converting individual documents to testimonials array...\n');
      
      const testimonialsArray = individualTestimonials.map(test => ({
        name: test.name,
        role: test.role,
        company: test.company || test.location,
        content: test.content || test.message || `Working with Aikya has been an incredible experience. The quality and attention to detail is outstanding.`,
        message: test.message || test.content,
        image: test.image,
        rating: test.rating || 5,
        location: test.location,
      }));

      if (!mainDoc) {
        mainDoc = new Testimonials({
          heading: 'What Our Clients Say',
          subheading: 'we create spaces that transform lives and possibilities',
          description: 'Our clients are at the heart of everything we do.',
          testimonials: testimonialsArray,
        });
      } else {
        mainDoc.heading = mainDoc.heading || 'What Our Clients Say';
        mainDoc.subheading = mainDoc.subheading || 'we create spaces that transform lives and possibilities';
        mainDoc.description = mainDoc.description || 'Our clients are at the heart of everything we do.';
        mainDoc.testimonials = testimonialsArray;
      }

      await mainDoc.save();
      console.log('✅ Created/Updated main document with testimonials array');
      console.log(`   Total testimonials: ${testimonialsArray.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

fixTestimonials();
