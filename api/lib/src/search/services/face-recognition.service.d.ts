/// <reference types="node" />
/// <reference types="node" />
import { AwsConfigService } from '../../common/config/aws.config.service';
export interface FaceMatchResult {
    matched: boolean;
    confidence?: number;
    matchedUserId?: string;
    fullName?: string;
    metadata?: string;
}
export declare class FaceRecognitionService {
    private readonly awsConfigService;
    private readonly rekognitionClient;
    private readonly dynamoDBClient;
    private readonly collectionId;
    private readonly faceMatchThreshold;
    private readonly tableName;
    constructor(awsConfigService: AwsConfigService);
    private initializeCollection;
    searchFaceByImage(imageBuffer: Buffer): Promise<FaceMatchResult[]>;
    private getUserDetails;
}
