/// <reference types="node" />
/// <reference types="node" />
import { FaceRecognitionService } from './services/face-recognition.service';
import { PrismaService } from '../database/prisma/prisma.service';
import { UserProfileResponse } from '../user/interfaces/user-profile.interface';
export declare class SearchService {
    private readonly faceRecognitionService;
    private readonly prisma;
    constructor(faceRecognitionService: FaceRecognitionService, prisma: PrismaService);
    searchByFace(imageBuffer: Buffer): Promise<import("./services/face-recognition.service").FaceMatchResult[]>;
    searchByMobileNumber(phoneNumber: string): Promise<UserProfileResponse | null>;
    searchById(userId: string): Promise<UserProfileResponse | null>;
    searchByAadhar(aadhaarNumber: string): Promise<UserProfileResponse | null>;
    searchByPanNumber(panNumber: string): Promise<UserProfileResponse | null>;
}
