import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(private readonly configService: ConfigService) {}

  getAwsConfig() {
    const region = this.configService.get<string>('aws.region');
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials not properly configured');
    }

    return {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
  }

  getRekognitionConfig() {
    return {
      collectionId: this.configService.get<string>('aws.rekognition.collectionId'),
      faceMatchThreshold: this.configService.get<number>('aws.rekognition.faceMatchThreshold'),
    };
  }

  getDynamoDBConfig() {
    return {
      faceRecognitionTableName: 'face_recognition',
    };
  }
}
