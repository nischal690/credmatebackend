import { ConfigService } from '@nestjs/config';
export declare class AwsConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    getAwsConfig(): {
        region: string;
        credentials: {
            accessKeyId: string;
            secretAccessKey: string;
        };
    };
    getRekognitionConfig(): {
        collectionId: string;
        faceMatchThreshold: number;
    };
    getDynamoDBConfig(): {
        faceRecognitionTableName: string;
    };
}
