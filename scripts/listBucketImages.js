import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: 'https://request.storage.portal.welocalhost.com',
  region: 'garage',
  credentials: {
    accessKeyId: 'GK067c7c4ab99be317db32f2f9',
    secretAccessKey: '7927bbfca0480d7fc2b51ad47eaf64a812d698a55e1b27e836ad64cf910ce10c',
  },
  forcePathStyle: true,
});

async function listBucketImages() {
  try {
    console.log('📦 Checking cloud storage bucket: aikya\n');
    
    const command = new ListObjectsV2Command({
      Bucket: 'aikya',
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('❌ Bucket is empty - no images found!\n');
      return;
    }

    console.log(`✓ Found ${response.Contents.length} files in bucket:\n`);
    
    // Filter and display Chennai project images
    const chennaiImages = response.Contents.filter(obj => 
      obj.Key && obj.Key.includes('chennai')
    );
    
    if (chennaiImages.length > 0) {
      console.log(`✅ Chennai Project Images (${chennaiImages.length}):`);
      chennaiImages.forEach(obj => {
        const sizeKB = ((obj.Size || 0) / 1024).toFixed(2);
        console.log(`   - ${obj.Key} (${sizeKB} KB)`);
      });
      console.log('');
    } else {
      console.log('❌ No Chennai project images found!\n');
    }
    
    // Show all other images
    const otherImages = response.Contents.filter(obj => 
      obj.Key && !obj.Key.includes('chennai')
    );
    
    if (otherImages.length > 0) {
      console.log(`📁 Other Images (${otherImages.length}):`);
      otherImages.forEach(obj => {
        const sizeKB = ((obj.Size || 0) / 1024).toFixed(2);
        console.log(`   - ${obj.Key} (${sizeKB} KB)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error accessing bucket:', error.message);
    if (error.$metadata) {
      console.error('Status:', error.$metadata.httpStatusCode);
    }
  }
}

listBucketImages();
