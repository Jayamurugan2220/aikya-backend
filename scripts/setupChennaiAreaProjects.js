import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { ProjectItem } from '../models/CMSItems.js';

// Chennai area project data with your uploaded images
const chennaiAreaProjects = [
  // TAMBARAM AREA (6 images)
  {
    name: 'Aikya Tambaram Heights',
    location: 'Tambaram, Chennai',
    area: 'tambaram',
    description: 'Modern residential complex in the heart of Tambaram with excellent connectivity',
    category: 'residential',
    type: 'apartment',
    status: 'ongoing',
    image: '/api/images/chennai-1741019826123-tambaram-1.jpeg',
    amenities: ['24/7 Security', 'Power Backup', 'Parking', 'Water Supply'],
  },
  {
    name: 'Aikya Tambaram Elite',
    location: 'Tambaram, Chennai',
    area: 'tambaram',
    description: 'Premium apartments with modern amenities in Tambaram',
    category: 'residential',
    type: 'apartment',
    status: 'completed',
    image: '/api/images/chennai-1741019826124-tambaram-2.jpeg',
    amenities: ['Swimming Pool', 'Gym', 'Children Play Area', 'Landscaped Gardens'],
  },

  // PERUGALATHUR AREA (2 images)
  {
    name: 'Aikya Perugalathur Villa',
    location: 'Perugalathur, Chennai',
    area: 'perugalathur',
    description: 'Spacious villas in the rapidly developing Perugalathur region',
    category: 'residential',
    type: 'villa',
    status: 'ongoing',
    image: '/api/images/chennai-1741019826127-perugalathur-1.jpeg',
    amenities: ['Private Garden', 'Car Parking', 'Security', 'Power Backup'],
  },

  // HASTINAPURAM AREA (1 image)
  {
    name: 'Aikya Hastinapuram Residency',
    location: 'Hastinapuram, Chennai',
    area: 'hastinapuram',
    description: 'Affordable housing with excellent connectivity to major IT corridors',
    category: 'residential',
    type: 'apartment',
    status: 'upcoming',
    image: '/api/images/chennai-1741019826128-hastinapuram-1.jpeg',
    amenities: ['Lift', 'Security', 'Water Supply', 'Parking'],
  },

  // GUDAVANCHERRY AREA (3 images)
  {
    name: 'Aikya Gudavancherry Square',
    location: 'Gudavancherry, Chennai',
    area: 'gudavancherry',
    description: 'Commercial and residential mixed-use development in Gudavancherry',
    category: 'residential',
    type: 'apartment',
    status: 'ongoing',
    image: '/api/images/chennai-1741019826129-gudavancherry-1.jpeg',
    amenities: ['Shopping Complex', 'Food Court', 'Parking', '24/7 Security'],
  },

  // CHITHLAPAKAM AREA (5 images)
  {
    name: 'Aikya Chithlapakam Tower',
    location: 'Chithlapakam, Chennai',
    area: 'chithlapakam',
    description: 'High-rise residential towers with premium amenities',
    category: 'residential',
    type: 'apartment',
    status: 'completed',
    image: '/api/images/chennai-1741019826134-chithlapakam-1.jpeg',
    amenities: ['Club House', 'Swimming Pool', 'Gym', 'Indoor Games', 'Landscaped Gardens'],
  },
  {
    name: 'Aikya Chithlapakam Gardens',
    location: 'Chithlapakam, Chennai',
    area: 'chithlapakam',
    description: 'Serene residential community with lush green spaces',
    category: 'residential',
    type: 'apartment',
    status: 'ongoing',
    image: '/api/images/chennai-1741019826135-chithlapakam-2.jpeg',
    amenities: ['Garden', 'Children Park', 'Power Backup', 'Security'],
  },
];

// Mapping for existing projects - update their area based on location
const locationToAreaMapping = {
  'tambaram': 'tambaram',
  'guduvancheri': 'gudavancherry',
  'gudavanchery': 'gudavancherry',
  // Add more mappings as needed
};

async function setupChennaiAreaProjects() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('\n📍 Setting Up Chennai Area Projects...');
    console.log('=' .repeat(70));

    // Step 1: Update existing Chennai projects with area field
    console.log('\n📝 Step 1: Updating existing Chennai projects with area field...');
    const existingProjects = await ProjectItem.find({
      location: { $regex: /chennai/i }
    });

    let updatedExisting = 0;
    for (const project of existingProjects) {
      const locationLower = project.location?.toLowerCase() || '';
      let areaFound = false;

      for (const [locKey, areaValue] of Object.entries(locationToAreaMapping)) {
        if (locationLower.includes(locKey)) {
          project.area = areaValue;
          project.updatedAt = Date.now();
          await project.save();
          console.log(`✅ Updated: ${project.name} → area: ${areaValue}`);
          updatedExisting++;
          areaFound = true;
          break;
        }
      }

      if (!areaFound && !project.area) {
        console.log(`⚠️  Skipped: ${project.name} (location: ${project.location}) - no area mapping`);
      }
    }

    // Step 2: Add new Chennai area projects (if they don't exist)
    console.log('\n📝 Step 2: Adding new Chennai area-specific projects...');
    let addedNew = 0;
    let skippedExisting = 0;

    for (const projectData of chennaiAreaProjects) {
      const existing = await ProjectItem.findOne({ name: projectData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped: "${projectData.name}" (already exists)`);
        skippedExisting++;
      } else {
        const newProject = await ProjectItem.create(projectData);
        console.log(`✅ Created: ${newProject.name} (${newProject.area})`);
        addedNew++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SETUP SUMMARY:');
    console.log(`   ✅ Updated existing projects: ${updatedExisting}`);
    console.log(`   ✅ Created new projects: ${addedNew}`);
    console.log(`   ⏭️  Skipped existing: ${skippedExisting}`);
    console.log('=' .repeat(70));

    // Show all Chennai area projects
    console.log('\n📋 All Chennai Projects by Area:');
    const allChennaiProjects = await ProjectItem.find({
      area: { $exists: true, $ne: null }
    }).sort({ area: 1, name: 1 });

    const areaGroups = {};
    allChennaiProjects.forEach(project => {
      if (!areaGroups[project.area]) {
        areaGroups[project.area] = [];
      }
      areaGroups[project.area].push(project);
    });

    Object.entries(areaGroups).forEach(([area, projects]) => {
      console.log(`\n🏢 ${area.toUpperCase()} (${projects.length} projects):`);
      projects.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name}`);
        console.log(`      Location: ${p.location}`);
        console.log(`      Status: ${p.status}`);
        console.log(`      Image: ${p.image ? 'Yes' : 'No'}`);
      });
    });

    console.log('\n✅ Chennai area projects setup complete!');
    console.log('🎉 You can now filter projects by area in the Chennai Projects page\n');

  } catch (error) {
    console.error('❌ Error setting up Chennai area projects:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
setupChennaiAreaProjects()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
