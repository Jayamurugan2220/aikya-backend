import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { ProjectItem } from '../models/CMSItems.js';

async function checkChennaiProjects() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log('\n📋 Checking Projects Database...');
    console.log('=' .repeat(60));

    // Get all projects
    const allProjects = await ProjectItem.find();
    console.log(`\n📊 Total Projects: ${allProjects.length}`);

    // Check if any have 'area' field (for Chennai subdivisions)
    const projectsWithArea = allProjects.filter(p => p.area);
    console.log(`📍 Projects with "area" field: ${projectsWithArea.length}`);

    // Show Chennai-related projects
    const chennaiProjects = allProjects.filter(p => 
      p.location?.toLowerCase().includes('chennai') ||
      p.name?.toLowerCase().includes('chennai') ||
      p.area
    );

    console.log(`\n🏢 Chennai-Related Projects: ${chennaiProjects.length}`);
    console.log('=' .repeat(60));

    if (chennaiProjects.length > 0) {
      chennaiProjects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name || 'Unnamed'}`);
        console.log(`   Location: ${project.location || 'N/A'}`);
        console.log(`   Area: ${project.area || 'N/A'}`);
        console.log(`   Category: ${project.category || 'N/A'}`);
        console.log(`   Status: ${project.status || 'N/A'}`);
        console.log(`   Image: ${project.image ? project.image.substring(0, 60) + '...' : 'N/A'}`);
      });
    } else {
      console.log('\n❌ No Chennai projects found in database');
      console.log('💡 Chennai area projects need to be added to Projects Manager');
    }

    // Show sample of all projects
    console.log('\n\n📋 Sample of All Projects (first 5):');
    console.log('=' .repeat(60));
    allProjects.slice(0, 5).forEach((project, index) => {
      console.log(`\n${index + 1}. ${project.name || 'Unnamed'}`);
      console.log(`   Location: ${project.location || 'N/A'}`);
      console.log(`   Category: ${project.category || 'N/A'}`);
      console.log(`   Has Image: ${project.image ? 'Yes' : 'No'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkChennaiProjects()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
