import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 Client configuration
const s3Client = new S3Client({
  endpoint: 'https://request.storage.portal.welocalhost.com',
  region: 'garage',
  credentials: {
    accessKeyId: 'GK067c7c4ab99be317db32f2f9',
    secretAccessKey: '7927bbfca0480d7fc2b51ad47eaf64a812d698a55e1b27e836ad64cf910ce10c',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = 'aikya';
const MONGODB_URI = 'mongodb+srv://Aikya:Aikya2026@cluster0.un7nvko.mongodb.net/AikyaBuilders?retryWrites=true&w=majority&appName=Cluster0';
const CLOUD_STORAGE_BASE = 'https://request.storage.portal.welocalhost.com/aikya';

// Chennai area image mappings
const chennaiImages = {
  chithlapakam: ['c1.jpeg', 'c2.jpeg', 'c3.jpeg', 'c4.jpeg', 'c5.jpeg'],
  gudavancherry: ['g1.jpeg', 'g2.jpeg', 'g3.jpeg'],
  hastinapuram: ['h1.jpeg'],
  perugalathur: ['p1.jpeg', 'p2.jpeg'],
  tambaram: ['t1.jpeg', 't2.jpeg', 't3.jpeg', 't4.jpeg', 't5.jpeg', 't6.jpeg']
};

async function uploadImageToS3(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: 'image/jpeg',
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to upload ${key}:`, error.message);
    return false;
  }
}

async function uploadAllChennaiImages() {
  console.log('📦 Uploading Chennai area images to cloud storage...\n');
  
  const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'assets', 'images');
  let totalUploaded = 0;
  const uploadedImages = {};

  for (const [area, images] of Object.entries(chennaiImages)) {
    console.log(`📂 Processing ${area}:`);
    uploadedImages[area] = [];
    
    for (const imageName of images) {
      const localPath = path.join(frontendPath, area, imageName);
      
      if (!fs.existsSync(localPath)) {
        console.log(`   ⚠️  File not found: ${imageName}`);
        continue;
      }

      // Generate cloud storage key
      const timestamp = Date.now();
      const key = `chennai-${timestamp}-${area}-${imageName}`;
      
      const success = await uploadImageToS3(localPath, key);
      if (success) {
        const cloudUrl = `${CLOUD_STORAGE_BASE}/${key}`;
        uploadedImages[area].push({
          original: imageName,
          cloudUrl: cloudUrl,
          key: key
        });
        console.log(`   ✓ Uploaded: ${imageName} → ${key}`);
        totalUploaded++;
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    console.log('');
  }

  console.log(`\n✅ Successfully uploaded ${totalUploaded} images to cloud storage\n`);
  return uploadedImages;
}

async function updateProjectsWithCloudUrls(uploadedImages) {
  console.log('🔄 Updating database with cloud storage URLs...\n');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }), 'projects');

    // Get all Chennai projects
    const projects = await Project.find({
      area: { $in: Object.keys(chennaiImages) }
    }).sort({ area: 1, name: 1 });

    console.log(`Found ${projects.length} Chennai projects in database\n`);

    let updated = 0;
    for (const project of projects) {
      const area = project.area;
      const areaImages = uploadedImages[area];
      
      if (!areaImages || areaImages.length === 0) {
        console.log(`⚠️  No images for ${project.name} (${area})`);
        continue;
      }

      // Assign the first available image for this area
      const imageData = areaImages[0];
      
      await Project.updateOne(
        { _id: project._id },
        { $set: { image: imageData.cloudUrl } }
      );

      console.log(`✓ ${project.name}`);
      console.log(`  Updated to: ${imageData.cloudUrl}\n`);
      updated++;

      // Remove used image so next project gets a different one
      uploadedImages[area].shift();
    }

    console.log(`\n✅ Successfully updated ${updated} projects in database`);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

async function main() {
  console.log('🚀 Starting Chennai Images Migration to Cloud Storage\n');
  console.log('=' .repeat(60) + '\n');
  
  try {
    // Step 1: Upload all images to cloud storage
    const uploadedImages = await uploadAllChennaiImages();
    
    // Step 2: Update database with new cloud URLs
    await updateProjectsWithCloudUrls(uploadedImages);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('\nYour Chennai project images are now stored in cloud storage.');
    console.log('Refresh your website to see the images.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  }
  
  process.exit(0);
}

main();
