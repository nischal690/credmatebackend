import { Injectable } from '@nestjs/common';
import { 
  RekognitionClient, 
  SearchFacesByImageCommand,
  CreateCollectionCommand,
} from '@aws-sdk/client-rekognition';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { AwsConfigService } from '../../common/config/aws.config.service';
import { ImageUtils } from '../../common/utils/image.utils';

export interface FaceMatchResult {
  matched: boolean;
  confidence?: number;
  matchedUserId?: string;
  fullName?: string;
  metadata?: string;
}

@Injectable()
export class FaceRecognitionService {
  private readonly rekognitionClient: RekognitionClient;
  private readonly dynamoDBClient: DynamoDBClient;
  private readonly collectionId: string;
  private readonly faceMatchThreshold: number;
  private readonly tableName: string;

  constructor(private readonly awsConfigService: AwsConfigService) {
    const awsConfig = this.awsConfigService.getAwsConfig();
    const rekognitionConfig = this.awsConfigService.getRekognitionConfig();
    const dynamoDBConfig = this.awsConfigService.getDynamoDBConfig();

    this.rekognitionClient = new RekognitionClient(awsConfig);
    this.dynamoDBClient = new DynamoDBClient(awsConfig);
    this.collectionId = rekognitionConfig.collectionId;
    this.faceMatchThreshold = rekognitionConfig.faceMatchThreshold;
    this.tableName = dynamoDBConfig.faceRecognitionTableName;
    
    this.initializeCollection();
  }

  private async initializeCollection(): Promise<void> {
    try {
      const command = new CreateCollectionCommand({
        CollectionId: this.collectionId,
      });
      await this.rekognitionClient.send(command);
      console.log(`Collection ${this.collectionId} created successfully`);
    } catch (error) {
      // Collection might already exist, which is fine
      if (error.name !== 'ResourceAlreadyExistsException') {
        console.error('Error creating collection:', error);
        throw error;
      }
    }
  }

  async searchFaceByImage(imageBuffer: Buffer): Promise<FaceMatchResult[]> {
    try {
      await ImageUtils.validateImage(imageBuffer);
      const processedImageBuffer = await ImageUtils.convertToJpeg(imageBuffer);

      const searchFacesCommand = new SearchFacesByImageCommand({
        CollectionId: this.collectionId,
        Image: { Bytes: processedImageBuffer },
        FaceMatchThreshold: this.faceMatchThreshold,
        MaxFaces: 4
      });

      const response = await this.rekognitionClient.send(searchFacesCommand);
      
      if (!response.FaceMatches || response.FaceMatches.length === 0) {
        return [{ matched: false }];
      }

      return await Promise.all(
        response.FaceMatches.slice(0, 4).map(async (match) => {
          const rekognitionId = match.Face?.FaceId;
          let fullName = null;
          
          if (rekognitionId) {
            const getItemCommand = new GetItemCommand({
              TableName: this.tableName,
              Key: {
                RekognitionId: { S: rekognitionId }
              }
            });
            
            const dynamoResponse = await this.dynamoDBClient.send(getItemCommand);
            if (dynamoResponse.Item) {
              fullName = dynamoResponse.Item.FullName?.S;
            }
          }

          return {
            matched: true,
            Similarity: match.Similarity,
            FullName: fullName
          };
        })
      );
    } catch (error) {
      console.error('Error in face search:', error);
      throw error;
    }
  }

  private async getUserDetails(rekognitionId: string): Promise<{ matchedUserId?: string; fullName?: string; metadata?: string }> {
    try {
      const getItemCommand = new GetItemCommand({
        TableName: this.tableName,
        Key: {
          RekognitionId: { S: rekognitionId }
        }
      });
      
      const response = await this.dynamoDBClient.send(getItemCommand);
      
      if (!response.Item) {
        return {};
      }

      return {
        matchedUserId: response.Item.userId?.S,
        fullName: response.Item.FullName?.S,
        metadata: response.Item.metadata?.S
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {};
    }
  }
}
