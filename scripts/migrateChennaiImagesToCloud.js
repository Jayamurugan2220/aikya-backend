import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadFileFromPath } from '../config/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Chennai Area Images Migration to Cloud Bucket...\n');

const CHENNAI_IMAGES_BASE = path.join(__dirname, '../../frontend/src/assets/images');
const OUTPUT_FILE = path.join(__dirname, 'chennai-migration-results.json');

const chennaiAreas = ['tambaram', 'perugalathur', 'hastinapuram', 'gudavancherry', 'chithlapakam'];

const migrationResults = {
  timestamp: new Date().toISOString(),
  totalImages: 0,
  uploaded: 0,
  failed: 0,
  areas: {},
  imageMap: {}
};

async function migrateChennaiImages() {
  try {
    console.log('📦 Scanning Chennai area folders...\n');

    // Process each Chennai area
    for (const area of chennaiAreas) {
      const areaDir = path.join(CHENNAI_IMAGES_BASE, area);
      
      if (!fs.existsSync(areaDir)) {
        console.log(`⚠️  Folder not found: ${area}, skipping...`);
        continue;
      }

      const files = fs.readdirSync(areaDir).filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      if (files.length === 0) {
        console.log(`⚠️  No images found in: ${area}`);
        continue;
      }

      migrationResults.areas[area] = {
        total: files.length,
        uploaded: 0,
        failed: 0,
        images: []
      };

      migrationResults.totalImages += files.length;

      console.log(`📂 Processing ${area}: ${files.length} images`);
      console.log('─'.repeat(60));

      // Upload each image from this area
      for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const filePath = path.join(areaDir, fileName);
        
        console.log(`  [${i + 1}/${files.length}] Uploading: ${area}/${fileName}`);
        
        try {
          // Generate a clean filename with area prefix
          const cleanFileName = `chennai-${area}-${fileName.replace(/\s+/g, '-')}`;
          const cloudUrl = await uploadFileFromPath(filePath, cleanFileName);
          
          migrationResults.uploaded++;
          migrationResults.areas[area].uploaded++;
          migrationResults.areas[area].images.push({
            originalName: fileName,
            cloudUrl: cloudUrl,
            fileName: cleanFileName,
            proxyUrl: `http://localhost:5000/api/images/${cleanFileName}`,
            success: true
          });

          // Store in imageMap for easy lookup
          migrationResults.imageMap[`${area}/${fileName}`] = {
            cloudUrl: cloudUrl,
            proxyUrl: `http://localhost:5000/api/images/${cleanFileName}`,
            fileName: cleanFileName
          };
          
          console.log(`     ✅ Uploaded successfully`);
        } catch (error) {
          migrationResults.failed++;
          migrationResults.areas[area].failed++;
          migrationResults.areas[area].images.push({
            originalName: fileName,
            error: error.message,
            success: false
          });
          
          console.log(`     ❌ Failed: ${error.message}`);
        }
      }
      console.log('');
    }

    // Save migration results
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(migrationResults, null, 2));
    
    // Print summary
    console.log('\n' + '═'.repeat(70));
    console.log('📊 CHENNAI AREAS MIGRATION SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Images: ${migrationResults.totalImages}`);
    console.log(`✅ Uploaded: ${migrationResults.uploaded}`);
    console.log(`❌ Failed: ${migrationResults.failed}`);
    console.log('\nBy Area:');
    
    for (const [area, stats] of Object.entries(migrationResults.areas)) {
      console.log(`  ${area.padEnd(15)}: ${stats.uploaded}/${stats.total} uploaded`);
    }
    
    console.log(`\n📄 Results saved to: ${OUTPUT_FILE}`);
    console.log('═'.repeat(70) + '\n');

    // Generate chennaiImages-cloud.ts file
    generateChennaiImagesCloudFile(migrationResults);

    if (migrationResults.uploaded === migrationResults.totalImages) {
      console.log('🎉 All Chennai area images successfully migrated to cloud bucket!\n');
      console.log('📋 Next steps:');
      console.log('1. Check frontend/src/assets/chennaiImages-cloud.ts');
      console.log('2. Replace imports in ChennaiProjects.tsx to use chennaiImages-cloud.ts');
      console.log('3. Run the database seed script: node backend/scripts/seedChennaiAreaProjects.js');
      console.log('4. Restart frontend server');
      console.log('5. Verify images load from cloud\n');
    } else {
      console.log('⚠️  Some images failed to upload. Check chennai-migration-results.json\n');
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

function generateChennaiImagesCloudFile(results) {
  console.log('📝 Generating chennaiImages-cloud.ts file...\n');

  let content = `// Chennai Area Images - Cloud Bucket URLs
// Auto-generated on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Run migration script to update

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

`;

  // Generate image URL constants
  for (const [area, data] of Object.entries(results.areas)) {
    content += `// ${area.charAt(0).toUpperCase() + area.slice(1)} images\n`;
    data.images.forEach((img, index) => {
      if (img.success) {
        const varName = `${area}${index + 1}`;
        content += `const ${varName} = \`\${BASE_URL}/api/images/${img.fileName}\`;\n`;
      }
    });
    content += '\n';
  }

  // Generate exports
  content += 'export const chennaiAreaImages = {\n';
  for (const [area, data] of Object.entries(results.areas)) {
    const imageVars = data.images
      .filter(img => img.success)
      .map((_, index) => `${area}${index + 1}`)
      .join(', ');
    content += `  ${area}: [${imageVars}],\n`;
  }
  content += '};\n\n';

  content += `export const areaDisplayNames = {
  tambaram: 'Tambaram',
  perugalathur: 'Perugalathur',
  hastinapuram: 'Hastinapuram',
  gudavancherry: 'Gudavancherry',
  chithlapakam: 'Chithlapakam',
};

// Cloud URLs for direct access (if needed)
export const chennaiAreaImagesCloud = {
`;

  for (const [area, data] of Object.entries(results.areas)) {
    content += `  ${area}: [\n`;
    data.images.forEach(img => {
      if (img.success) {
        content += `    '${img.cloudUrl}',\n`;
      }
    });
    content += `  ],\n`;
  }
  content += '};\n';

  // Write file
  const outputPath = path.join(__dirname, '../../frontend/src/assets/chennaiImages-cloud.ts');
  fs.writeFileSync(outputPath, content);
  console.log(`✅ Generated: ${outputPath}\n`);

  // Also generate the updated database seed script
  generateUpdatedSeedScript(results);
}

function generateUpdatedSeedScript(results) {
  console.log('📝 Generating updated database seed script...\n');

  const content = `import mongoose from 'mongoose';
import { CMSItems } from '../models/CMSItems.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/future-builders-studio';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

async function seedChennaiAreaProjects() {
  try {
    console.log('🚀 Seeding Chennai area projects with cloud images...');

    // Chennai areas with their projects (using cloud bucket URLs)
    const chennaiAreas = {
${Object.entries(results.areas).map(([area, data]) => {
  const areaName = area.charAt(0).toUpperCase() + area.slice(1);
  const projects = data.images.filter(img => img.success).map((img, index) => {
    const statusValues = ['completed', 'ongoing', 'upcoming'];
    const status = statusValues[index % 3];
    return `          { 
            name: 'Aikya ${areaName} ${['Residency', 'Heights', 'Villas', 'Towers', 'Premium', 'Elite'][index % 6]} ${index > 5 ? 'Phase ' + Math.floor(index / 6) : ''}', 
            image: \`\${BASE_URL}/api/images/${img.fileName}\`, 
            status: '${status}' 
          }`;
  }).join(',\n');

  return `      ${area}: {
        name: '${areaName}',
        projectCount: ${data.images.filter(img => img.success).length},
        projects: [
${projects}
        ]
      }`;
}).join(',\n')}
    };

    // Get or create projects collection
    let projectsCollection = await CMSItems.findOne({ collectionName: 'projects' });
    
    if (!projectsCollection) {
      projectsCollection = new CMSItems({
        collectionName: 'projects',
        items: []
      });
    }

    // Clear existing Chennai projects
    projectsCollection.items = projectsCollection.items.filter(
      item => !item.area || !['tambaram', 'perugalathur', 'hastinapuram', 'gudavancherry', 'chithlapakam'].includes(item.area)
    );

    // Add Chennai area projects with cloud URLs
    const newProjects = [];
    for (const [areaKey, areaData] of Object.entries(chennaiAreas)) {
      for (const project of areaData.projects) {
        newProjects.push({
          _id: new mongoose.Types.ObjectId(),
          name: project.name,
          location: \`\${areaData.name}, Chennai\`,
          area: areaKey,
          category: 'residential',
          type: 'apartment',
          status: project.status,
          image: project.image,
          images: [project.image],
          amenities: ['24/7 Security', 'Power Backup', 'Water Supply', 'Parking', 'Garden', 'Club House'],
          description: \`Premium \${project.status} residential project in \${areaData.name}, Chennai. Experience modern living with world-class amenities.\`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Add new projects to existing items
    projectsCollection.items.push(...newProjects);
    projectsCollection.updatedAt = new Date();
    await projectsCollection.save();

    console.log('✅ Chennai area projects seeded successfully!');
    console.log(\`📊 Added \${newProjects.length} Chennai area projects:\`);
    
    for (const [areaKey, areaData] of Object.entries(chennaiAreas)) {
      console.log(\`   \${areaData.name}: \${areaData.projectCount} projects\`);
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
`;

  const scriptPath = path.join(__dirname, 'seedChennaiAreaProjects-cloud.js');
  fs.writeFileSync(scriptPath, content);
  console.log(`✅ Generated: ${scriptPath}\n`);
}

// Run migration
migrateChennaiImages();
