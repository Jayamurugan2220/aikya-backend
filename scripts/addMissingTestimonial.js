import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function addMissingTestimonial() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const TestimonialItem = mongoose.model('TestimonialItem', new mongoose.Schema({}, { strict: false }), 'testimonials');
    
    // Check if Rajesh Kumar exists
    const existing = await TestimonialItem.findOne({ name: 'Rajesh Kumar' });
    
    if (existing) {
      console.log('✅ Rajesh Kumar testimonial already exists');
    } else {
      console.log('Creating Rajesh Kumar testimonial...');
      
      const newTestimonial = await TestimonialItem.create({
        name: 'Rajesh Kumar',
        role: 'Business Owner',
        company: 'Resident - Aikya Business Square',
        content: 'Aikya Builders delivered exceptional quality in our office project in T. Nagar. Their attention to detail and professional approach made the entire process seamless. The team was responsive and delivered on time.',
        rating: 5,
        location: 'T. Nagar, Chennai',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created:', newTestimonial.name);
    }

    // Show all testimonials
    const all = await TestimonialItem.find().sort({ order: 1, createdAt: -1 });
    console.log(`\n📋 Total testimonials: ${all.length}\n`);
    all.forEach((t, i) => {
      console.log(`${i+1}. ${t.name} - ${t.rating}⭐`);
      console.log(`   ${t.company}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

addMissingTestimonial();
