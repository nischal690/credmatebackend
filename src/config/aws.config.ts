import { registerAs } from '@nestjs/config';

export default registerAs('aws', () => ({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  rekognition: {
    collectionId: process.env.AWS_REKOGNITION_COLLECTION_ID || 'user-profile-faces',
    faceMatchThreshold: parseInt(process.env.AWS_FACE_MATCH_THRESHOLD, 10) || 90,
  },
}));
