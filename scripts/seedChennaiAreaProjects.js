import mongoose from 'mongoose';
import { CMSItems } from '../models/CMSItems.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/future-builders-studio';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function seedChennaiAreaProjects() {
  try {
    console.log('🚀 Seeding Chennai area projects...');

    // Chennai areas with their projects
    const chennaiAreas = {
      tambaram: {
        name: 'Tambaram',
        projectCount: 6,
        projects: [
          { name: 'Aikya Tambaram Residency I', image: '/assets/images/tambaram/t1.jpeg', status: 'completed' },
          { name: 'Aikya Tambaram Heights', image: '/assets/images/tambaram/t2.jpeg', status: 'ongoing' },
          { name: 'Tambaram Green Villas', image: '/assets/images/tambaram/t3.jpeg', status: 'upcoming' },
          { name: 'Aikya Tambaram Towers', image: '/assets/images/tambaram/t4.jpeg', status: 'completed' },
          { name: 'Tambaram Premium Flats', image: '/assets/images/tambaram/t5.jpeg', status: 'ongoing' },
          { name: 'Aikya Tambaram Residency II', image: '/assets/images/tambaram/t6.jpeg', status: 'upcoming' }
        ]
      },
      perugalathur: {
        name: 'Perugalathur',
        projectCount: 2,
        projects: [
          { name: 'Aikya Perugalathur Homes', image: '/assets/images/perugalathur/p1.jpeg', status: 'completed' },
          { name: 'Perugalathur Grand Villa', image: '/assets/images/perugalathur/p2.jpeg', status: 'ongoing' }
        ]
      },
      hastinapuram: {
        name: 'Hastinapuram',
        projectCount: 1,
        projects: [
          { name: 'Aikya Hastinapuram Paradise', image: '/assets/images/hastinapuram/h1.jpeg', status: 'completed' }
        ]
      },
      gudavancherry: {
        name: 'Gudavancherry',
        projectCount: 3,
        projects: [
          { name: 'Aikya Gudavancherry Elite', image: '/assets/images/gudavancherry/g1.jpeg', status: 'upcoming' },
          { name: 'Gudavancherry Smart Homes', image: '/assets/images/gudavancherry/g2.jpeg', status: 'completed' },
          { name: 'Aikya Gudavancherry Plaza', image: '/assets/images/gudavancherry/g3.jpeg', status: 'ongoing' }
        ]
      },
      chithlapakam: {
        name: 'Chithlapakam',
        projectCount: 5,
        projects: [
          { name: 'Aikya Chithlapakam Residency', image: '/assets/images/chithlapakam/c1.jpeg', status: 'completed' },
          { name: 'Chithlapakam Pearl Apartments', image: '/assets/images/chithlapakam/c2.jpeg', status: 'ongoing' },
          { name: 'Aikya Chithlapakam Heights', image: '/assets/images/chithlapakam/c3.jpeg', status: 'upcoming' },
          { name: 'Chithlapakam Green Vista', image: '/assets/images/chithlapakam/c4.jpeg', status: 'completed' },
          { name: 'Aikya Chithlapakam Elite', image: '/assets/images/chithlapakam/c5.jpeg', status: 'ongoing' }
        ]
      }
    };

    // Get or create projects collection
    let projectsCollection = await CMSItems.findOne({ collectionName: 'projects' });
    
    if (!projectsCollection) {
      projectsCollection = new CMSItems({
        collectionName: 'projects',
        items: []
      });
    }

    // Add Chennai area projects
    const newProjects = [];
    for (const [areaKey, areaData] of Object.entries(chennaiAreas)) {
      for (const project of areaData.projects) {
        newProjects.push({
          _id: new mongoose.Types.ObjectId(),
          name: project.name,
          location: `${areaData.name}, Chennai`,
          area: areaKey,
          category: 'residential',
          type: 'apartment',
          status: project.status,
          image: project.image,
          images: [project.image],
          amenities: ['24/7 Security', 'Power Backup', 'Water Supply', 'Parking'],
          description: `Premium ${project.status} project in ${areaData.name}, Chennai`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Add new projects to existing items
    projectsCollection.items.push(...newProjects);
    await projectsCollection.save();

    console.log('✅ Chennai area projects seeded successfully!');
    console.log(`📊 Added ${newProjects.length} Chennai area projects:`);
    
    for (const [areaKey, areaData] of Object.entries(chennaiAreas)) {
      console.log(`   ${areaData.name}: ${areaData.projectCount} projects`);
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding Chennai area projects:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seeding
seedChennaiAreaProjects();
