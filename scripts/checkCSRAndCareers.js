import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';

async function checkCSRAndCareers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check CSR Initiatives
    const CSRItem = mongoose.model('CSRItem', new mongoose.Schema({}, { strict: false }), 'csr');
    const csrItems = await CSRItem.find();
    
    console.log('===== CSR INITIATIVES =====');
    console.log(`Total: ${csrItems.length}\n`);
    
    if (csrItems.length > 0) {
      csrItems.forEach((item, i) => {
        console.log(`${i+1}. ${item.title || 'Untitled'}`);
        console.log(`   Category: ${item.category || 'N/A'}`);
        console.log(`   Image: ${item.image ? 'YES' : 'NO'}`);
        console.log('');
      });
    } else {
      console.log('❌ No CSR initiatives found\n');
    }

    // Check Careers
    const CareerItem = mongoose.model('CareerItem', new mongoose.Schema({}, { strict: false }), 'careers');
    const careerItems = await CareerItem.find();
    
    console.log('===== CAREERS/JOB POSITIONS =====');
    console.log(`Total: ${careerItems.length}\n`);
    
    if (careerItems.length > 0) {
      careerItems.forEach((item, i) => {
        console.log(`${i+1}. ${item.title || 'Untitled'}`);
        console.log(`   Department: ${item.department || 'N/A'}`);
        console.log(`   Location: ${item.location || 'N/A'}`);
        console.log(`   Type: ${item.type || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No career positions found\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
  
  process.exit(0);
}

checkCSRAndCareers();
