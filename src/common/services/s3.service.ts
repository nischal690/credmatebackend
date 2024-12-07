import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private s3: S3Client;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      region: this.configService.get('AWS_REGION'),
    });
  }

  private async createFolderIfNotExists(bucketName: string, folderId: string): Promise<void> {
    try {
      // Check if folder exists by listing objects with the folder prefix
      const listParams = {
        Bucket: bucketName,
        Prefix: `${folderId}/`,
        MaxKeys: 1
      };

      const command = new ListObjectsV2Command(listParams);
      const objects = await this.s3.send(command);
      
      // If no objects found with this prefix, create an empty folder
      if (objects.Contents?.length === 0) {
        const putParams = {
          Bucket: bucketName,
          Key: `${folderId}/`,
          Body: ''
        };
        const putCommand = new PutObjectCommand(putParams);
        await this.s3.send(putCommand);
      }
    } catch (error) {
      console.warn(`Warning: Error checking/creating folder: ${error.message}`);
      // Continue even if folder creation fails as it's not critical
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    
    // Ensure user folder exists
    await this.createFolderIfNotExists(bucketName, userId);
    
    // Create file path: userId/timestamp-filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${userId}/${timestamp}-${sanitizedFilename}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId: userId,
        originalName: file.originalname,
        uploadTimestamp: new Date().toISOString()
      },
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      const result = await this.s3.send(command);
      return result.$metadata.httpStatusCode === 200 ? `https://${bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}` : '';
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  async listUserFiles(userId: string): Promise<string[]> {
    const bucketName = this.configService.get('AWS_S3_BUCKET_NAME');
    
    const listParams = {
      Bucket: bucketName,
      Prefix: `${userId}/`,
    };

    try {
      const command = new ListObjectsV2Command(listParams);
      const objects = await this.s3.send(command);
      return objects.Contents?.map(obj => obj.Key) || [];
    } catch (error) {
      throw new Error(`Failed to list user files: ${error.message}`);
    }
  }
}
