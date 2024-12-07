/// <reference types="multer" />
import { SearchService } from './search.service';
import { UserProfileResponse } from '../user/interfaces/user-profile.interface';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    searchByFace(file: Express.Multer.File): Promise<import("./services/face-recognition.service").FaceMatchResult[]>;
    searchByMobileNumber(phoneNumber: string): Promise<UserProfileResponse>;
    searchById(userId: string): Promise<UserProfileResponse>;
    searchByAadhar(aadharNumber: string): Promise<UserProfileResponse>;
    searchByPanNumber(panNumber: string): Promise<UserProfileResponse>;
}
